import { Router } from "express";
import db from "../db/index.js";
import { authenticateToken, getTeamUserIds } from "../middleware/auth.js";

const router = Router();

// 管理人员权限检查
function requireManager(req, res, next) {
  if (req.user.role === "manager") return next();
  // 主教练也可以查看
  if (req.user.role === "head_coach") return next();
  return res.status(403).json({ error: "无权访问" });
}

// 辅助函数：获取本周日期范围
function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toISOString().split("T")[0],
    end: sunday.toISOString().split("T")[0],
  };
}

// 辅助函数：解析JSON
function parseJson(val) {
  if (!val) return null;
  if (typeof val !== "string") return val;
  try { return JSON.parse(val); } catch { return null; }
}

// 辅助函数：按团队过滤计划
function filterPlansByTeam(plans, teamUserIds) {
  if (!teamUserIds) return plans;
  return plans.filter((p) => {
    const targets = Array.isArray(p.target_athletes) ? p.target_athletes : [];
    return targets.length === 0 || targets.some((id) => teamUserIds.includes(id));
  });
}

// ============================================
// GET /api/manager/dashboard — 团队整体数据概览
// ============================================
router.get("/dashboard", authenticateToken, requireManager, (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const week = getWeekRange();
    const athletes = db.users.findAll({ role: "athlete", is_active: 1, team_id: req.user.team_id });
    const totalAthletes = athletes.length;
    const teamUserIds = getTeamUserIds(req.user.team_id);

    // 今日训练统计
    const todaySessions = db.training_sessions.query({}).filter((s) => s.session_date === today && (!teamUserIds || teamUserIds.includes(s.athlete_id)));
    const trainedToday = new Set(todaySessions.map((s) => s.athlete_id)).size;

    // 本周训练统计
    const weekSessions = db.training_sessions.query({}).filter(
      (s) => s.session_date >= week.start && s.session_date <= week.end && (!teamUserIds || teamUserIds.includes(s.athlete_id))
    );

    // 本周距离统计
    let totalDistance = 0;
    weekSessions.forEach((s) => {
      const fitData = parseJson(s.fit_data_json);
      if (fitData?.total_distance_meters) {
        totalDistance += fitData.total_distance_meters / 1000;
      }
    });

    // 本周计划统计
    const weekPlans = filterPlansByTeam(
      db.training_plans.query({
        where: { approval_status: "approved" },
      }).filter((p) => p.plan_date >= week.start && p.plan_date <= week.end),
      teamUserIds
    );

    // 计算完成率（有训练记录的天数 / 有计划的天数）
    const planDates = new Set(weekPlans.map((p) => p.plan_date));
    const sessionDates = new Set(weekSessions.map((s) => s.session_date));
    let completedCount = 0;
    planDates.forEach((d) => { if (sessionDates.has(d)) completedCount++; });

    // 全队最近一次训练的评分
    const latestReports = [];
    athletes.forEach((a) => {
      const reports = db.ai_reports.query({
        where: { athlete_id: a.id },
        orderBy: ["created_at", "DESC"],
      });
      if (reports.length > 0) latestReports.push(reports[0]);
    });

    const scoresArr = latestReports.filter((r) => r.overall_score).map((r) => r.overall_score);
    const avgScore = scoresArr.length > 0
      ? Math.round((scoresArr.reduce((a, b) => a + b, 0) / scoresArr.length) * 10) / 10
      : 0;

    // 情绪分布
    const emotionDist = { positive: 0, neutral: 0, negative: 0 };
    latestReports.forEach((r) => {
      const emotion = parseJson(r.emotion_json);
      if (emotion?.polarity === "积极") emotionDist.positive++;
      else if (emotion?.polarity === "消极") emotionDist.negative++;
      else emotionDist.neutral++;
    });

    // 预警人数
    const alertCount = latestReports.filter((r) => r.risk_flag).length;

    res.json({
      today: {
        trained_count: trainedToday,
        total_athletes: totalAthletes,
        training_rate: totalAthletes > 0 ? `${Math.round((trainedToday / totalAthletes) * 100)}%` : "0%",
      },
      this_week: {
        total_sessions: weekSessions.length,
        total_distance_km: Math.round(totalDistance),
        training_plan_count: planDates.size,
        completed_plan_count: completedCount,
        completion_rate: planDates.size > 0 ? `${Math.round((completedCount / planDates.size) * 100)}%` : "0%",
      },
      team_status: {
        avg_score: avgScore,
        emotion_distribution: emotionDist,
        alert_count: alertCount,
      },
    });
  } catch (err) {
    console.error("获取仪表盘数据失败:", err);
    res.status(500).json({ error: "获取数据失败" });
  }
});

// ============================================
// GET /api/manager/attendance — 出勤统计
// ============================================
router.get("/attendance", authenticateToken, requireManager, (req, res) => {
  try {
    const { period, start_date, end_date } = req.query;
    const now = new Date();

    let startDate, endDate;
    if (start_date && end_date) {
      startDate = start_date;
      endDate = end_date;
    } else if (period === "week") {
      const week = getWeekRange();
      startDate = week.start;
      endDate = week.end;
    } else if (period === "quarter") {
      const quarterStart = new Date(now);
      quarterStart.setMonth(Math.floor(now.getMonth() / 3) * 3, 1);
      startDate = quarterStart.toISOString().split("T")[0];
      endDate = now.toISOString().split("T")[0];
    } else {
      // 默认本月
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = monthStart.toISOString().split("T")[0];
      endDate = now.toISOString().split("T")[0];
    }

    const athletes = db.users.findAll({ role: "athlete", is_active: 1, team_id: req.user.team_id });
    const teamUserIds = getTeamUserIds(req.user.team_id);

    // 统计有计划的天数
    const plans = filterPlansByTeam(
      db.training_plans.query({
        where: { approval_status: "approved" },
      }).filter((p) => p.plan_date >= startDate && p.plan_date <= endDate),
      teamUserIds
    );
    const expectedDays = new Set(plans.map((p) => p.plan_date)).size;

    // 统计每个运动员的实际训练天数
    const athleteStats = athletes.map((a) => {
      const sessions = db.training_sessions.query({
        where: { athlete_id: a.id },
      }).filter((s) => s.session_date >= startDate && s.session_date <= endDate);
      const actualDays = new Set(sessions.map((s) => s.session_date)).size;

      return {
        athlete_id: a.id,
        athlete_name: a.display_name,
        expected_sessions: expectedDays,
        actual_sessions: actualDays,
        attendance_rate: expectedDays > 0 ? `${Math.round((actualDays / expectedDays) * 100)}%` : "--",
      };
    });

    // 按出勤率降序排列
    athleteStats.sort((a, b) => {
      const rateA = parseInt(a.attendance_rate) || 0;
      const rateB = parseInt(b.attendance_rate) || 0;
      return rateB - rateA;
    });

    // 团队平均出勤率
    const rates = athleteStats.filter((a) => a.attendance_rate !== "--").map((a) => parseInt(a.attendance_rate));
    const teamAvg = rates.length > 0 ? `${Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)}%` : "--";

    res.json({
      period: period || "month",
      start_date: startDate,
      end_date: endDate,
      athletes: athleteStats,
      team_avg_attendance: teamAvg,
    });
  } catch (err) {
    console.error("获取出勤统计失败:", err);
    res.status(500).json({ error: "获取出勤统计失败" });
  }
});

// ============================================
// GET /api/manager/team-status — 训练计划周进度
// ============================================
router.get("/team-status", authenticateToken, requireManager, (req, res) => {
  try {
    const week = getWeekRange();
    const athletes = db.users.findAll({ role: "athlete", is_active: 1, team_id: req.user.team_id });
    const totalAthletes = athletes.length;
    const teamUserIds = getTeamUserIds(req.user.team_id);

    const DAY_NAMES = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

    // 构建本周7天数据
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(week.start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = DAY_NAMES[d.getDay()];

      // 查找当天的计划
      const dayPlans = filterPlansByTeam(
        db.training_plans.query({
          where: { approval_status: "approved", plan_date: dateStr },
        }),
        teamUserIds
      );

      // 查找当天的训练记录
      const daySessions = db.training_sessions.query({}).filter((s) => s.session_date === dateStr && (!teamUserIds || teamUserIds.includes(s.athlete_id)));
      const completedAthletes = new Set(daySessions.map((s) => s.athlete_id)).size;

      const sessionType = dayPlans.length > 0 ? dayPlans[0].title : null;
      const isRestDay = !sessionType || sessionType.includes("休息");

      weekDays.push({
        date: dateStr,
        day_of_week: dayName,
        session_type: sessionType || "休息日",
        status: isRestDay ? "休息日" : (new Date(dateStr) <= new Date() ? "已完成" : "待执行"),
        completed_count: isRestDay ? 0 : completedAthletes,
        total_count: isRestDay ? 0 : totalAthletes,
      });
    }

    // 教练组工作记录（最近的训练备注）
    const recentNotes = db.training_notes.query({
      orderBy: ["created_at", "DESC"],
    }).filter((n) => !teamUserIds || teamUserIds.includes(n.created_by)).slice(0, 5).map((n) => {
      const author = db.users.findById(n.created_by);
      return {
        author: author?.display_name || "未知",
        date: n.created_at?.split("T")[0] || "",
        content: n.content?.substring(0, 60) || "",
      };
    });

    res.json({
      current_week_plans: weekDays,
      coach_notes: recentNotes,
    });
  } catch (err) {
    console.error("获取团队状态失败:", err);
    res.status(500).json({ error: "获取团队状态失败" });
  }
});

export default router;
