import { Router } from "express";
import db from "../db/index.js";
import { authenticateToken, getTeamUserIds, isUserInTeam } from "../middleware/auth.js";
import { notifyTrainingSubmitted, notifyRiskAlert, notifyInjuryAlert } from "../services/notification.js";

const router = Router();

// GET /api/sessions
router.get("/", authenticateToken, (req, res) => {
  try {
    const { athlete_id, date_from, date_to, limit } = req.query;

    let sessions;
    if (req.user.role === "athlete") {
      sessions = db.training_sessions.query({
        where: { athlete_id: req.user.id },
        orderBy: ["session_date", "DESC"],
        limit: limit ? parseInt(limit) : undefined,
      });
    } else if (athlete_id) {
      if (!isUserInTeam(parseInt(athlete_id), req.user.team_id)) {
        return res.status(403).json({ error: "无权访问该运动员数据" });
      }
      sessions = db.training_sessions.query({
        where: { athlete_id: parseInt(athlete_id) },
        orderBy: ["session_date", "DESC"],
        limit: limit ? parseInt(limit) : undefined,
      });
    } else {
      const teamUserIds = getTeamUserIds(req.user.team_id);
      const where = {};
      if (teamUserIds) where.athlete_id = { $in: teamUserIds };
      sessions = db.training_sessions.query({
        where,
        orderBy: ["session_date", "DESC"],
        limit: limit ? parseInt(limit) : undefined,
      });
    }

    // 日期过滤
    if (date_from) sessions = sessions.filter((s) => s.session_date >= date_from);
    if (date_to) sessions = sessions.filter((s) => s.session_date <= date_to);

    // 关联运动员名称和AI报告
    const enriched = sessions.map((s) => {
      const user = db.users.findById(s.athlete_id);
      const report = db.ai_reports.findOne({ session_id: s.id });
      return {
        ...s,
        athlete_name: user?.display_name || "未知",
        overall_score: report?.overall_score,
        status_level: report?.status_level,
        risk_flag: report?.risk_flag,
        coach_summary: report?.coach_summary,
      };
    });

    res.json({ sessions: enriched });
  } catch (err) {
    console.error("获取训练记录失败:", err);
    res.status(500).json({ error: "获取训练记录失败" });
  }
});

// GET /api/sessions/overview/team
router.get("/overview/team", authenticateToken, (req, res) => {
  try {
    if (req.user.role === "athlete") {
      return res.status(403).json({ error: "无权查看全队概览" });
    }

    const today = new Date().toISOString().split("T")[0];
    const athletes = db.users.findAll({ role: "athlete", is_active: 1, team_id: req.user.team_id });

    const parseJsonSafe = (val) => {
      if (!val) return null;
      if (typeof val !== "string") return val;
      try { return JSON.parse(val); } catch { return null; }
    };

    // 今日已提交反馈的运动员ID集合
    const teamUserIds = getTeamUserIds(req.user.team_id);
    const todaySessions = db.training_sessions.query({
      where: { session_date: today, ...(teamUserIds ? { athlete_id: { $in: teamUserIds } } : {}) },
    });
    const todayAthleteIds = new Set(todaySessions.map((s) => s.athlete_id));

    const overview = athletes.map((athlete) => {
      const sessions = db.training_sessions.query({
        where: { athlete_id: athlete.id },
        orderBy: ["session_date", "DESC"],
        limit: 1,
      });
      const latestSession = sessions[0] || null;
      const report = latestSession ? db.ai_reports.findOne({ session_id: latestSession.id }) : null;
      const rawResponse = parseJsonSafe(report?.raw_ai_response);
      const emotion = parseJsonSafe(report?.emotion_json);

      return {
        athlete_id: athlete.id,
        display_name: athlete.display_name,
        session_date: latestSession?.session_date,
        body_score: latestSession?.body_score,
        mind_score: latestSession?.mind_score,
        tags: latestSession?.tags,
        overall_score: report?.overall_score,
        status_level: report?.status_level,
        risk_flag: report?.risk_flag,
        risk_reason: report?.risk_reason,
        emotion_display: rawResponse?.emotion_display || (emotion?.polarity === "积极" ? "😊 积极" : emotion?.polarity === "消极" ? "😟 消极" : "😐 中性"),
        summary: rawResponse?.athlete_view?.summary || null,
        trained_today: todayAthleteIds.has(athlete.id),
      };
    });

    // 排序：风险标记优先，评分低优先
    overview.sort((a, b) => {
      if (a.risk_flag && !b.risk_flag) return -1;
      if (!a.risk_flag && b.risk_flag) return 1;
      return (a.overall_score || 10) - (b.overall_score || 10);
    });

    const total = overview.length;
    const trainedToday = overview.filter((a) => a.trained_today).length;
    const riskCount = overview.filter((s) => s.risk_flag).length;
    const scoresArr = overview.filter((s) => s.overall_score);
    const avgScore = scoresArr.length > 0
      ? Math.round((scoresArr.reduce((sum, s) => sum + s.overall_score, 0) / scoresArr.length) * 10) / 10
      : 0;

    // 最近3条助教训练备注
    const recentNotesTeamUserIds = getTeamUserIds(req.user.team_id);
    const recentNotes = db.training_notes.query({
      where: recentNotesTeamUserIds ? { athlete_id: { $in: recentNotesTeamUserIds } } : {},
      orderBy: ["created_at", "DESC"],
    }).slice(0, 3).map((n) => {
      const author = db.users.findById(n.created_by);
      const athlete = db.users.findById(n.athlete_id);
      return {
        id: n.id,
        author_name: author?.display_name || "未知",
        athlete_name: athlete?.display_name || "未知",
        date: n.created_at?.split("T")[0] || "",
        content: n.content?.substring(0, 80) || "",
        note_type: n.note_type,
      };
    });

    // 本周计划概览
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const weekStart = monday.toISOString().split("T")[0];
    const weekEnd = sunday.toISOString().split("T")[0];

    const weekPlansTeamUserIds = getTeamUserIds(req.user.team_id);
    const weekPlans = db.training_plans.query({
      where: { approval_status: "approved" },
      orderBy: ["plan_date", "ASC"],
    }).filter((p) => {
      if (p.plan_date < weekStart || p.plan_date > weekEnd) return false;
      if (!weekPlansTeamUserIds) return true;
      const targets = Array.isArray(p.target_athletes) ? p.target_athletes : [];
      return targets.length === 0 || targets.some((id) => weekPlansTeamUserIds.includes(id));
    });

    res.json({
      athletes: overview,
      stats: {
        total,
        trained_today: trainedToday,
        risk_count: riskCount,
        avg_score: avgScore,
      },
      recent_notes: recentNotes,
      week_plans: weekPlans.map((p) => ({
        id: p.id,
        date: p.plan_date,
        title: p.title,
        intensity_level: p.intensity_level,
      })),
      week_range: { start: weekStart, end: weekEnd },
    });
  } catch (err) {
    console.error("获取全队概览失败:", err);
    res.status(500).json({ error: "获取全队概览失败" });
  }
});

// 解析报告中的JSON字段为前端期望的格式
function parseReport(report) {
  if (!report) return null;
  const safeParse = (val, fallback) => {
    if (!val) return fallback;
    if (typeof val !== "string") return val;
    try { return JSON.parse(val); } catch { return fallback; }
  };
  return {
    id: report.id,
    session_id: report.session_id,
    athlete_id: report.athlete_id,
    overall_score: report.overall_score,
    status_level: report.status_level,
    emotion: safeParse(report.emotion_json, {}),
    fatigue: safeParse(report.fatigue_json, {}),
    difficulty_points: safeParse(report.difficulty_points, []),
    training_zone: report.training_zone,
    zone_distribution: safeParse(report.zone_distribution_json, {}),
    vdot_estimate: report.vdot_estimate,
    training_quality: report.training_quality,
    intensity_feedback: report.intensity_feedback,
    periodization_analysis: report.periodization_analysis,
    load_management: safeParse(report.load_management_json, {}),
    recovery_status: report.recovery_status,
    phase_alignment: report.phase_alignment,
    treatment_coordination: report.treatment_coordination,
    body_region_conflict: report.body_region_conflict,
    coordination_suggestion: report.coordination_suggestion,
    diary_text: report.diary_text,
    coach_summary: report.coach_summary,
    recommendations: safeParse(report.recommendations, []),
    daniels_recommendation: report.daniels_recommendation,
    periodization_recommendation: report.periodization_recommendation,
    risk_flag: !!report.risk_flag,
    risk_reason: report.risk_reason,
  };
}

// GET /api/sessions/:id
router.get("/:id", authenticateToken, (req, res) => {
  try {
    const session = db.training_sessions.findById(parseInt(req.params.id));
    if (!session) return res.status(404).json({ error: "训练记录不存在" });

    if (req.user.role === "athlete" && session.athlete_id !== req.user.id) {
      return res.status(403).json({ error: "无权查看此记录" });
    }

    if (req.user.role !== "athlete" && !isUserInTeam(session.athlete_id, req.user.team_id)) {
      return res.status(403).json({ error: "无权访问该训练记录" });
    }

    const user = db.users.findById(session.athlete_id);
    const rawReport = db.ai_reports.findOne({ session_id: session.id });
    console.log(`[DEBUG] session_id=${session.id}, rawReport found:`, !!rawReport, rawReport ? `id=${rawReport.id}` : "null");
    const report = parseReport(rawReport);
    console.log(`[DEBUG] parsedReport keys:`, report ? Object.keys(report).join(",") : "null");
    const notes = db.training_notes.findAll({ session_id: session.id }).map((n) => {
      const author = db.users.findById(n.created_by);
      return { ...n, author_name: author?.display_name || "未知" };
    });

    // 解析 fit_data_json
    const parseJsonSafe = (val) => {
      if (!val) return null;
      if (typeof val !== "string") return val;
      try { return JSON.parse(val); } catch { return null; }
    };

    res.json({
      session: {
        ...session,
        athlete_name: user?.display_name || "未知",
        fit_data_json: parseJsonSafe(session.fit_data_json),
      },
      report,
      notes,
    });
  } catch (err) {
    console.error("获取训练详情失败:", err);
    res.status(500).json({ error: "获取训练详情失败" });
  }
});

// POST /api/sessions
router.post("/", authenticateToken, (req, res) => {
  try {
    const athleteId = req.user.role === "athlete" ? req.user.id : (req.body.athlete_id || req.user.id);

    if (req.user.role !== "athlete" && req.body.athlete_id && !isUserInTeam(parseInt(req.body.athlete_id), req.user.team_id)) {
      return res.status(403).json({ error: "无权为该运动员创建记录" });
    }

    if (!req.body.transcript) {
      return res.status(400).json({ error: "训练反馈内容不能为空" });
    }

    const session = db.training_sessions.create({
      athlete_id: athleteId,
      session_date: new Date().toISOString().split("T")[0],
      session_name: req.body.session_name || null,
      body_score: req.body.body_score ? parseInt(req.body.body_score) : null,
      mind_score: req.body.mind_score ? parseInt(req.body.mind_score) : null,
      difficulty_score: req.body.difficulty_score ? parseInt(req.body.difficulty_score) : null,
      tags: req.body.tags || null,
      transcript: req.body.transcript,
      week_body_avg: req.body.week_body_avg ? parseFloat(req.body.week_body_avg) : null,
      week_mind_avg: req.body.week_mind_avg ? parseFloat(req.body.week_mind_avg) : null,
      recent_trend: req.body.recent_trend || null,
      training_phase: req.body.training_phase || null,
      cycle_week: req.body.cycle_week || null,
      weekly_volume_trend: req.body.weekly_volume_trend || null,
      target_race_date: req.body.target_race_date || null,
      days_to_race: req.body.days_to_race ? parseInt(req.body.days_to_race) : null,
      recent_injury: req.body.recent_injury || null,
      sleep_quality: req.body.sleep_quality || null,
      training_monotony: req.body.training_monotony || null,
      objective_data_json: req.body.objective_data_json || null,
      plan_id: req.body.plan_id || null,
    });

    // 基于绑定关系通知相关人员
    notifyTrainingSubmitted(athleteId, session.id, {
      session_date: session.session_date,
      session_name: session.session_name,
      transcript: session.transcript,
    });

    res.json({ message: "训练记录已提交", session });
  } catch (err) {
    console.error("创建训练记录失败:", err);
    res.status(500).json({ error: "创建训练记录失败" });
  }
});

export default router;
