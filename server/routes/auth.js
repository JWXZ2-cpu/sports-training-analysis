import { Router } from "express";
import bcrypt from "bcryptjs";
import db from "../db/index.js";
import { generateToken, authenticateToken } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/register
router.post("/register", (req, res) => {
  try {
    const { username, password, display_name, role, invite_code } = req.body;

    if (!username || !password || !display_name) {
      return res.status(400).json({ error: "用户名、密码和显示名称为必填项" });
    }

    const validRoles = ["athlete", "head_coach", "assistant", "doctor", "strength_coach", "scientist", "manager"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: "无效的角色" });
    }

    const existing = db.users.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: "用户名已存在" });
    }

    // 验证邀请码
    let teamId = null;
    if (invite_code) {
      const team = db.teams.findOne({ invite_code: invite_code.toUpperCase() });
      if (!team) {
        return res.status(400).json({ error: "邀请码无效" });
      }
      teamId = team.id;
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    const user = db.users.create({
      username, password_hash, display_name,
      role: role || "athlete", is_active: 1,
      team_id: teamId,
      avatar_url: null, phone: null, email: null,
    });

    const token = generateToken(user);

    res.json({
      message: "注册成功",
      user: { id: user.id, username: user.username, display_name: user.display_name, role: user.role, team_id: teamId },
      token,
    });
  } catch (err) {
    console.error("注册错误:", err);
    res.status(500).json({ error: "注册失败" });
  }
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "请输入用户名和密码" });
    }

    const user = db.users.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "用户名或密码错误" });
    }

    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: "用户名或密码错误" });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: "账户已被禁用" });
    }

    const token = generateToken(user);

    res.json({
      message: "登录成功",
      user: { id: user.id, username: user.username, display_name: user.display_name, role: user.role, team_id: user.team_id || null },
      token,
    });
  } catch (err) {
    console.error("登录错误:", err);
    res.status(500).json({ error: "登录失败" });
  }
});

// GET /api/auth/me
router.get("/me", authenticateToken, (req, res) => {
  try {
    const user = db.users.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "用户不存在" });
    const { password_hash, ...safe } = user;
    res.json({ user: safe });
  } catch {
    res.status(500).json({ error: "获取用户信息失败" });
  }
});

// PUT /api/auth/profile
router.put("/profile", authenticateToken, (req, res) => {
  try {
    const { display_name, phone, email } = req.body;
    const updates = {};
    if (display_name) updates.display_name = display_name;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;

    const user = db.users.update(req.user.id, updates);
    const { password_hash, ...safe } = user;
    res.json({ message: "更新成功", user: safe });
  } catch {
    res.status(500).json({ error: "更新失败" });
  }
});

// POST /api/auth/join-team
// 注册后通过邀请码加入团队
router.post("/join-team", authenticateToken, (req, res) => {
  try {
    const { invite_code } = req.body;
    if (!invite_code) return res.status(400).json({ error: "请输入邀请码" });

    // 检查是否已有团队
    const currentUser = db.users.findById(req.user.id);
    if (currentUser?.team_id) {
      return res.status(400).json({ error: "你已在团队中，如需更换请联系管理员" });
    }

    // 验证邀请码
    const team = db.teams.findOne({ invite_code: invite_code.toUpperCase() });
    if (!team) return res.status(404).json({ error: "邀请码无效" });

    // 加入团队
    db.users.update(req.user.id, { team_id: team.id });

    res.json({ message: "加入成功", team_name: team.name, team_id: team.id });
  } catch (err) {
    console.error("加入团队失败:", err);
    res.status(500).json({ error: "加入失败" });
  }
});

// GET /api/auth/users
router.get("/users", authenticateToken, (req, res) => {
  try {
    if (req.user.role === "athlete") {
      return res.status(403).json({ error: "无权查看用户列表" });
    }

    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (req.user.team_id) filter.team_id = req.user.team_id;
    const users = db.users.findAll(filter);

    res.json({
      users: users.map(({ password_hash, ...u }) => u),
    });
  } catch {
    res.status(500).json({ error: "获取用户列表失败" });
  }
});

// GET /api/auth/athletes
router.get("/athletes", authenticateToken, (req, res) => {
  try {
    if (req.user.role === "athlete") {
      return res.status(403).json({ error: "无权查看运动员列表" });
    }

    const athleteFilter = { role: "athlete" };
    if (req.user.team_id) athleteFilter.team_id = req.user.team_id;
    const athletes = db.users.findAll(athleteFilter).map((u) => {
      const profile = db.athlete_profiles.findOne({ user_id: u.id });
      return {
        id: u.id, username: u.username, display_name: u.display_name, is_active: u.is_active,
        sport: profile?.sport, team: profile?.team, vdot_current: profile?.vdot_current, weight_kg: profile?.weight_kg,
      };
    });

    res.json({ athletes });
  } catch {
    res.status(500).json({ error: "获取运动员列表失败" });
  }
});

export default router;
