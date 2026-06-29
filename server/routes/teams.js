import { Router } from "express";
import db from "../db/index.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = Router();

// 生成 6 位随机邀请码
function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 去掉易混淆字符 I/O/0/1
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ============================================
// POST /api/teams
// 创建团队（主教练专用）
// ============================================
router.post("/", authenticateToken, requireRole("head_coach"), (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "请输入团队名称" });

    // 检查是否已有团队
    const existing = db.teams.findOne({ owner_id: req.user.id });
    if (existing) return res.status(400).json({ error: "你已创建过团队" });

    // 生成唯一邀请码
    let inviteCode;
    do { inviteCode = generateInviteCode(); } while (db.teams.findOne({ invite_code: inviteCode }));

    const team = db.teams.create({
      name,
      invite_code: inviteCode,
      owner_id: req.user.id,
    });

    // 将创建者关联到团队
    db.users.update(req.user.id, { team_id: team.id });

    res.json({ team });
  } catch (err) {
    console.error("创建团队失败:", err);
    res.status(500).json({ error: "创建失败" });
  }
});

// ============================================
// GET /api/teams/my
// 获取我的团队信息
// ============================================
router.get("/my", authenticateToken, (req, res) => {
  try {
    const teamId = req.user.team_id;
    if (!teamId) return res.json({ team: null });

    const team = db.teams.findById(teamId);
    if (!team) return res.json({ team: null });

    // 获取成员列表
    const members = db.users.findAll({ team_id: teamId }).map((u) => ({
      id: u.id,
      username: u.username,
      display_name: u.display_name,
      role: u.role,
    }));

    res.json({ team: { ...team, members } });
  } catch (err) {
    console.error("获取团队信息失败:", err);
    res.status(500).json({ error: "获取失败" });
  }
});

// ============================================
// POST /api/teams/invite-code/regenerate
// 重新生成邀请码（团队创建者专用）
// ============================================
router.post("/invite-code/regenerate", authenticateToken, (req, res) => {
  try {
    const teamId = req.user.team_id;
    if (!teamId) return res.status(400).json({ error: "你还没有团队" });

    const team = db.teams.findById(teamId);
    if (!team) return res.status(404).json({ error: "团队不存在" });
    if (team.owner_id !== req.user.id) return res.status(403).json({ error: "只有团队创建者可以重新生成邀请码" });

    let inviteCode;
    do { inviteCode = generateInviteCode(); } while (db.teams.findOne({ invite_code: inviteCode }));

    db.teams.update(teamId, { invite_code: inviteCode });

    res.json({ invite_code: inviteCode });
  } catch (err) {
    console.error("重新生成邀请码失败:", err);
    res.status(500).json({ error: "操作失败" });
  }
});

// ============================================
// POST /api/teams/verify-code
// 验证邀请码（注册时调用）
// ============================================
router.post("/verify-code", (req, res) => {
  try {
    const { invite_code } = req.body;
    if (!invite_code) return res.status(400).json({ error: "请输入邀请码" });

    const team = db.teams.findOne({ invite_code: invite_code.toUpperCase() });
    if (!team) return res.status(404).json({ error: "邀请码无效" });

    res.json({ valid: true, team_name: team.name, team_id: team.id });
  } catch (err) {
    console.error("验证邀请码失败:", err);
    res.status(500).json({ error: "验证失败" });
  }
});

// ============================================
// GET /api/teams/members
// 获取团队成员列表
// ============================================
router.get("/members", authenticateToken, (req, res) => {
  try {
    const teamId = req.user.team_id;
    if (!teamId) return res.json({ members: [] });

    const members = db.users.findAll({ team_id: teamId }).map((u) => ({
      id: u.id,
      username: u.username,
      display_name: u.display_name,
      role: u.role,
    }));

    res.json({ members });
  } catch (err) {
    console.error("获取成员失败:", err);
    res.status(500).json({ error: "获取失败" });
  }
});

export default router;
