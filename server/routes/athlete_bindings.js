/**
 * 运动员绑定关系 API 路由
 * 管理运动员与主教练、助教、队医的绑定关系
 */
import { Router } from "express";
import db from "../db/index.js";
import bindings from "../db/bindings.js";
import { authenticateToken, getTeamUserIds, isUserInTeam } from "../middleware/auth.js";

const router = Router();

// 校验角色映射
const ROLE_MAP = {
  coach_id: "head_coach",
  assistant_id: "assistant",
  doctor_id: "doctor",
};

/**
 * 校验绑定数据的合法性
 */
function validateBinding(body) {
  const errors = [];

  // 校验 athlete_id
  if (!body.athlete_id) {
    errors.push("athlete_id 不能为空");
  } else {
    const athlete = db.users.findById(body.athlete_id);
    if (!athlete || athlete.role !== "athlete") {
      errors.push("athlete_id 对应的用户不存在或不是运动员");
    }
  }

  // 校验教练组 ID 的角色
  for (const [field, expectedRole] of Object.entries(ROLE_MAP)) {
    if (body[field]) {
      const user = db.users.findById(body[field]);
      if (!user) {
        errors.push(`${field} 对应的用户不存在`);
      } else if (user.role !== expectedRole) {
        errors.push(`${field} 对应的用户角色不是 ${expectedRole}，而是 ${user.role}`);
      }
    }
  }

  return errors;
}

// ============================================
// GET /api/bindings — 获取所有绑定关系
// ============================================
router.get("/", authenticateToken, (req, res) => {
  try {
    const teamUserIds = getTeamUserIds(req.user.team_id);
    let allBindings = bindings.getAll();
    if (teamUserIds) {
      allBindings = allBindings.filter((b) =>
        teamUserIds.includes(b.athlete_id) || teamUserIds.includes(b.coach_id) ||
        teamUserIds.includes(b.assistant_id) || teamUserIds.includes(b.doctor_id)
      );
    }
    // 附加用户名称信息
    const enriched = allBindings.map((b) => {
      const athlete = db.users.findById(b.athlete_id);
      const coach = b.coach_id ? db.users.findById(b.coach_id) : null;
      const assistant = b.assistant_id ? db.users.findById(b.assistant_id) : null;
      const doctor = b.doctor_id ? db.users.findById(b.doctor_id) : null;
      return {
        ...b,
        athlete_name: athlete?.display_name || "未知",
        coach_name: coach?.display_name || null,
        assistant_name: assistant?.display_name || null,
        doctor_name: doctor?.display_name || null,
      };
    });
    res.json({ bindings: enriched });
  } catch (err) {
    console.error("获取绑定关系失败:", err);
    res.status(500).json({ error: "获取绑定关系失败" });
  }
});

// ============================================
// GET /api/bindings/athlete/:athleteId — 获取某运动员的绑定关系
// ============================================
router.get("/athlete/:athleteId", authenticateToken, (req, res) => {
  try {
    const athleteId = parseInt(req.params.athleteId);

    // Verify athlete is in the same team
    if (!isUserInTeam(athleteId, req.user.team_id)) {
      return res.status(403).json({ error: "无权访问该运动员的绑定关系" });
    }

    const binding = bindings.getByAthleteId(athleteId);

    if (!binding) {
      return res.json({ binding: null });
    }

    // 附加用户名称
    const coach = binding.coach_id ? db.users.findById(binding.coach_id) : null;
    const assistant = binding.assistant_id ? db.users.findById(binding.assistant_id) : null;
    const doctor = binding.doctor_id ? db.users.findById(binding.doctor_id) : null;

    res.json({
      binding: {
        ...binding,
        coach_name: coach?.display_name || null,
        assistant_name: assistant?.display_name || null,
        doctor_name: doctor?.display_name || null,
      },
    });
  } catch (err) {
    console.error("获取绑定关系失败:", err);
    res.status(500).json({ error: "获取绑定关系失败" });
  }
});

// ============================================
// GET /api/bindings/staff/:staffId — 获取某工作人员负责的运动员列表
// ============================================
router.get("/staff/:staffId", authenticateToken, (req, res) => {
  try {
    const staffId = parseInt(req.params.staffId);

    // Verify staff is in the same team
    if (!isUserInTeam(staffId, req.user.team_id)) {
      return res.status(403).json({ error: "无权访问该工作人员的绑定关系" });
    }

    const staffBindings = bindings.getByStaffId(staffId);

    // 附加运动员名称
    const enriched = staffBindings.map((b) => {
      const athlete = db.users.findById(b.athlete_id);
      return {
        ...b,
        athlete_name: athlete?.display_name || "未知",
      };
    });

    res.json({ bindings: enriched });
  } catch (err) {
    console.error("获取绑定关系失败:", err);
    res.status(500).json({ error: "获取绑定关系失败" });
  }
});

// ============================================
// POST /api/bindings — 创建绑定关系
// ============================================
router.post("/", authenticateToken, (req, res) => {
  try {
    const { athlete_id, coach_id, assistant_id, doctor_id } = req.body;

    // 校验数据
    const errors = validateBinding(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join("; ") });
    }

    // Verify all referenced users are in the same team
    const referencedIds = [athlete_id, coach_id, assistant_id, doctor_id].filter(Boolean);
    for (const uid of referencedIds) {
      if (!isUserInTeam(uid, req.user.team_id)) {
        return res.status(403).json({ error: "只能绑定同一团队内的用户" });
      }
    }

    // 检查是否已存在
    const existing = bindings.getByAthleteId(athlete_id);
    if (existing) {
      return res.status(409).json({ error: "该运动员已有绑定关系，请使用 PUT 更新" });
    }

    const now = new Date().toISOString();
    const binding = bindings.create({
      athlete_id,
      coach_id: coach_id || null,
      assistant_id: assistant_id || null,
      doctor_id: doctor_id || null,
      created_at: now,
      updated_at: now,
    });

    res.status(201).json({ message: "绑定关系创建成功", binding });
  } catch (err) {
    console.error("创建绑定关系失败:", err);
    res.status(500).json({ error: "创建绑定关系失败" });
  }
});

// ============================================
// PUT /api/bindings/:athleteId — 更新绑定关系
// ============================================
router.put("/:athleteId", authenticateToken, (req, res) => {
  try {
    const athleteId = parseInt(req.params.athleteId);

    // Verify athlete is in the same team
    if (!isUserInTeam(athleteId, req.user.team_id)) {
      return res.status(403).json({ error: "无权修改该运动员的绑定关系" });
    }

    const { coach_id, assistant_id, doctor_id } = req.body;

    // 校验角色
    for (const [field, expectedRole] of Object.entries(ROLE_MAP)) {
      if (req.body[field]) {
        const user = db.users.findById(req.body[field]);
        if (!user) {
          return res.status(400).json({ error: `${field} 对应的用户不存在` });
        }
        if (user.role !== expectedRole) {
          return res.status(400).json({ error: `${field} 对应的用户角色不是 ${expectedRole}` });
        }
      }
    }

    const now = new Date().toISOString();
    const updated = bindings.update(athleteId, {
      ...(coach_id !== undefined && { coach_id: coach_id || null }),
      ...(assistant_id !== undefined && { assistant_id: assistant_id || null }),
      ...(doctor_id !== undefined && { doctor_id: doctor_id || null }),
      updated_at: now,
    });

    if (!updated) {
      return res.status(404).json({ error: "该运动员的绑定关系不存在" });
    }

    res.json({ message: "绑定关系更新成功", binding: updated });
  } catch (err) {
    console.error("更新绑定关系失败:", err);
    res.status(500).json({ error: "更新绑定关系失败" });
  }
});

// ============================================
// DELETE /api/bindings/:athleteId — 删除绑定关系
// ============================================
router.delete("/:athleteId", authenticateToken, (req, res) => {
  try {
    const athleteId = parseInt(req.params.athleteId);

    // Verify athlete is in the same team
    if (!isUserInTeam(athleteId, req.user.team_id)) {
      return res.status(403).json({ error: "无权删除该运动员的绑定关系" });
    }

    const deleted = bindings.remove(athleteId);

    if (!deleted) {
      return res.status(404).json({ error: "该运动员的绑定关系不存在" });
    }

    res.json({ message: "绑定关系已删除" });
  } catch (err) {
    console.error("删除绑定关系失败:", err);
    res.status(500).json({ error: "删除绑定关系失败" });
  }
});

export default router;
