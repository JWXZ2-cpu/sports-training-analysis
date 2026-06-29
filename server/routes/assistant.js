import { Router } from "express";
import db from "../db/index.js";
import { authenticateToken, getTeamUserIds, isUserInTeam } from "../middleware/auth.js";
import { notifyTrainingNote } from "../services/notification.js";

const router = Router();

// 助教权限检查
function requireAssistant(req, res, next) {
  if (req.user.role === "assistant") return next();
  return res.status(403).json({ error: "只有助教可以执行此操作" });
}

// 主教练权限检查
function requireHeadCoach(req, res, next) {
  if (req.user.role === "head_coach") return next();
  return res.status(403).json({ error: "只有主教练可以查看" });
}

// ============================================
// POST /api/assistant/notes — 助教提交训练备注
// ============================================
router.post("/notes", authenticateToken, requireAssistant, (req, res) => {
  try {
    const { athlete_id, note_date, content, note_type } = req.body;

    if (!athlete_id || !content) {
      return res.status(400).json({ error: "运动员和备注内容为必填项" });
    }

    if (athlete_id && !isUserInTeam(parseInt(athlete_id), req.user.team_id)) {
      return res.status(403).json({ error: "无权为该运动员创建备注" });
    }

    const validTypes = ["evaluation", "feedback", "observation"];
    const type = validTypes.includes(note_type) ? note_type : "observation";

    const note = db.training_notes.create({
      athlete_id: parseInt(athlete_id),
      session_id: null,
      note_date: note_date || new Date().toISOString().split("T")[0],
      note_type: type,
      content,
      created_by: req.user.id,
    });

    // 通知主教练
    const assistant = db.users.findById(req.user.id);
    const athlete = db.users.findById(parseInt(athlete_id));
    if (assistant && athlete) {
      notifyTrainingNote(assistant.display_name, athlete.display_name);
    }

    res.json({ message: "训练备注已提交", note });
  } catch (err) {
    console.error("提交训练备注失败:", err);
    res.status(500).json({ error: "提交训练备注失败" });
  }
});

// ============================================
// GET /api/assistant/notes — 助教查看自己的备注
// ============================================
router.get("/notes", authenticateToken, requireAssistant, (req, res) => {
  try {
    const { athlete_id, limit } = req.query;
    const limitNum = parseInt(limit) || 20;

    let notes = db.training_notes.query({
      where: { created_by: req.user.id },
      orderBy: ["created_at", "DESC"],
    });

    if (athlete_id) {
      notes = notes.filter((n) => n.athlete_id === parseInt(athlete_id));
    }

    notes = notes.slice(0, limitNum);

    const enriched = notes.map((n) => {
      const athlete = db.users.findById(n.athlete_id);
      return {
        ...n,
        athlete_name: athlete?.display_name || "未知",
      };
    });

    res.json({ notes: enriched, total: enriched.length });
  } catch (err) {
    console.error("获取备注列表失败:", err);
    res.status(500).json({ error: "获取备注列表失败" });
  }
});

// ============================================
// GET /api/coach/notes — 主教练查看所有助教备注
// ============================================
router.get("/coach/notes", authenticateToken, requireHeadCoach, (req, res) => {
  try {
    const { athlete_id, limit } = req.query;
    const limitNum = parseInt(limit) || 20;

    const teamUserIds = getTeamUserIds(req.user.team_id);
    let notes = db.training_notes.query({
      where: teamUserIds ? { athlete_id: { $in: teamUserIds } } : {},
      orderBy: ["created_at", "DESC"],
    });

    if (athlete_id) {
      notes = notes.filter((n) => n.athlete_id === parseInt(athlete_id));
    }

    notes = notes.slice(0, limitNum);

    const enriched = notes.map((n) => {
      const athlete = db.users.findById(n.athlete_id);
      const author = db.users.findById(n.created_by);
      return {
        ...n,
        athlete_name: athlete?.display_name || "未知",
        author_name: author?.display_name || "未知",
        author_role: author?.role || "未知",
      };
    });

    res.json({ notes: enriched, total: enriched.length });
  } catch (err) {
    console.error("获取备注列表失败:", err);
    res.status(500).json({ error: "获取备注列表失败" });
  }
});

export default router;
