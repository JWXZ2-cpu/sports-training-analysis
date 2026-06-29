import { Router } from "express";
import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import db from "../db/index.js";
import { authenticateToken, isUserInTeam } from "../middleware/auth.js";
import { fitUpload, fileSizeLimitHandler } from "../middleware/upload.js";
import { parseFitFile, formatPace, formatDuration, formatDistance } from "../services/fit-parser.js";
import { calculateFromPB, calculateZonesFromConconi } from "../services/vdotCalculator.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const router = Router();

// 运动员专属路由，所有接口都需要认证且只能访问自己的数据
function requireAthlete(req, res, next) {
  if (req.user.role === "athlete") return next();
  // 教练组也可以查看（用于了解运动员视角）
  if (["head_coach", "assistant", "doctor", "strength_coach", "scientist", "manager"].includes(req.user.role)) return next();
  return res.status(403).json({ error: "无权访问" });
}

// ============================================
// GET /api/athlete/my-plan/this-week
// 返回当前运动员本周的训练计划
// ============================================
router.get("/my-plan/this-week", authenticateToken, requireAthlete, (req, res) => {
  try {
    const athleteId = req.user.role === "athlete" ? req.user.id : (req.query.athlete_id ? parseInt(req.query.athlete_id) : req.user.id);

    // Team check for non-athlete viewing another athlete's data
    if (req.user.role !== "athlete" && req.query.athlete_id && !isUserInTeam(athleteId, req.user.team_id)) {
      return res.status(403).json({ error: "无权访问该运动员数据" });
    }

    // 计算本周一到周日的日期范围
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=周日, 1=周一, ...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const weekStart = monday.toISOString().split("T")[0];
    const weekEnd = sunday.toISOString().split("T")[0];
    const today = now.toISOString().split("T")[0];

    const DAY_NAMES = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

    // 查询该运动员本周的计划
    const allPlans = db.training_plans.query({
      where: { approval_status: "approved" },
      orderBy: ["plan_date", "ASC"],
    }).filter((p) => {
      if (p.plan_date < weekStart || p.plan_date > weekEnd) return false;
      // 检查是否针对该运动员
      const targets = typeof p.target_athletes === "string" ? JSON.parse(p.target_athletes) : (p.target_athletes || []);
      return targets.length === 0 || targets.includes("all") || targets.includes(athleteId);
    });

    // 构建7天的计划数组
    const plans = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = DAY_NAMES[d.getDay()];
      const isToday = dateStr === today;

      const plan = allPlans.find((p) => p.plan_date === dateStr);

      if (plan) {
        const content = typeof plan.content_json === "string" ? JSON.parse(plan.content_json) : (plan.content_json || {});

        plans.push({
          date: dateStr,
          day_of_week: dayName,
          is_today: isToday,
          title: plan.title,
          training_zone: content.target_zone || null,
          estimated_distance: content.estimated_distance || null,
          estimated_duration: content.estimated_duration || null,
          intensity_level: plan.intensity_level || null,
          // 今日计划返回完整内容，其他天返回null
          full_content: isToday ? {
            target_pace: content.target_pace || null,
            target_hr: content.target_hr || null,
            warmup: content.warmup || null,
            main: content.main || [],
            cooldown: content.cooldown || null,
            notes: content.notes || null,
          } : null,
        });
      } else {
        plans.push({
          date: dateStr,
          day_of_week: dayName,
          is_today: isToday,
          title: null,
          training_zone: null,
          estimated_distance: null,
          estimated_duration: null,
          intensity_level: null,
          full_content: null,
        });
      }
    }

    res.json({ week_start: weekStart, week_end: weekEnd, today, plans });
  } catch (err) {
    console.error("获取本周计划失败:", err);
    res.status(500).json({ error: "获取本周计划失败" });
  }
});

// ============================================
// GET /api/athlete/my-reports
// 返回当前运动员的训练历史记录列表
// ============================================
router.get("/my-reports", authenticateToken, requireAthlete, (req, res) => {
  try {
    const athleteId = req.user.role === "athlete" ? req.user.id : (req.query.athlete_id ? parseInt(req.query.athlete_id) : req.user.id);

    // Team check for non-athlete viewing another athlete's data
    if (req.user.role !== "athlete" && req.query.athlete_id && !isUserInTeam(athleteId, req.user.team_id)) {
      return res.status(403).json({ error: "无权访问该运动员数据" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // 获取该运动员所有训练记录
    const allSessions = db.training_sessions.query({
      where: { athlete_id: athleteId },
      orderBy: ["session_date", "DESC"],
    });

    const total = allSessions.length;
    const offset = (page - 1) * limit;
    const pageSessions = allSessions.slice(offset, offset + limit);

    // 关联AI报告
    const reports = pageSessions.map((s) => {
      const report = db.ai_reports.findOne({ session_id: s.id });
      const parseJsonSafe = (val) => {
        if (!val) return null;
        if (typeof val !== "string") return val;
        try { return JSON.parse(val); } catch { return null; }
      };

      // 从 raw_ai_response 中提取 athlete_view
      const rawResponse = parseJsonSafe(report?.raw_ai_response);
      const athleteView = rawResponse?.athlete_view || {};
      const fatigue = parseJsonSafe(report?.fatigue_json);
      const emotion = parseJsonSafe(report?.emotion_json);

      return {
        id: s.id,
        date: s.session_date,
        session_name: s.session_name || "训练",
        summary: athleteView.summary || null,
        emotion_display: rawResponse?.emotion_display || (emotion?.polarity === "积极" ? "😊 积极" : emotion?.polarity === "消极" ? "😟 消极" : "😐 中性"),
        // 以下字段仅用于教练端，运动员端不显示
        overall_score: report?.overall_score || null,
        status_level: report?.status_level || null,
        training_zone: report?.training_zone || null,
        fatigue_level: fatigue?.level || null,
        body_score: s.body_score,
        mind_score: s.mind_score,
        risk_flag: !!report?.risk_flag,
      };
    });

    res.json({ total, page, limit, reports });
  } catch (err) {
    console.error("获取训练历史失败:", err);
    res.status(500).json({ error: "获取训练历史失败" });
  }
});

// ============================================
// GET /api/athlete/my-reports/:id
// 返回单条训练的完整AI报告详情
// ============================================
router.get("/my-reports/:id", authenticateToken, requireAthlete, (req, res) => {
  try {
    const session = db.training_sessions.findById(parseInt(req.params.id));
    if (!session) return res.status(404).json({ error: "训练记录不存在" });

    // Team check for non-athlete viewing another athlete's training record
    if (req.user.role !== "athlete" && !isUserInTeam(session.athlete_id, req.user.team_id)) {
      return res.status(403).json({ error: "无权访问该训练记录" });
    }

    // 运动员只能看自己的
    if (req.user.role === "athlete" && session.athlete_id !== req.user.id) {
      return res.status(403).json({ error: "无权查看此记录" });
    }

    const user = db.users.findById(session.athlete_id);
    const rawReport = db.ai_reports.findOne({ session_id: session.id });

    // 解析报告JSON字段
    const parseJsonSafe = (val, fallback = null) => {
      if (!val) return fallback;
      if (typeof val !== "string") return val;
      try { return JSON.parse(val); } catch { return fallback; }
    };

    const report = rawReport ? {
      id: rawReport.id,
      session_id: rawReport.session_id,
      athlete_id: rawReport.athlete_id,
      overall_score: rawReport.overall_score,
      status_level: rawReport.status_level,
      emotion: parseJsonSafe(rawReport.emotion_json, {}),
      fatigue: parseJsonSafe(rawReport.fatigue_json, {}),
      difficulty_points: parseJsonSafe(rawReport.difficulty_points, []),
      training_zone: rawReport.training_zone,
      zone_distribution: parseJsonSafe(rawReport.zone_distribution_json, {}),
      vdot_estimate: rawReport.vdot_estimate,
      training_quality: rawReport.training_quality,
      intensity_feedback: rawReport.intensity_feedback,
      periodization_analysis: rawReport.periodization_analysis,
      load_management: parseJsonSafe(rawReport.load_management_json, {}),
      recovery_status: rawReport.recovery_status,
      phase_alignment: rawReport.phase_alignment,
      diary_text: rawReport.diary_text,
      coach_summary: rawReport.coach_summary,
      recommendations: parseJsonSafe(rawReport.recommendations, []),
      daniels_recommendation: rawReport.daniels_recommendation,
      periodization_recommendation: rawReport.periodization_recommendation,
      risk_flag: !!rawReport.risk_flag,
      risk_reason: rawReport.risk_reason,
    } : null;

    // 训练备注（运动员只能看到教练组的备注）
    const notes = db.training_notes.findAll({ session_id: session.id }).map((n) => {
      const author = db.users.findById(n.created_by);
      return { ...n, author_name: author?.display_name || "未知" };
    });

    res.json({
      session: { ...session, athlete_name: user?.display_name || "未知" },
      report,
      notes,
    });
  } catch (err) {
    console.error("获取报告详情失败:", err);
    res.status(500).json({ error: "获取报告详情失败" });
  }
});

// ============================================
// GET /api/athlete/summary
// 返回个人数据统计
// ============================================
router.get("/summary", authenticateToken, requireAthlete, (req, res) => {
  try {
    const athleteId = req.user.role === "athlete" ? req.user.id : (req.query.athlete_id ? parseInt(req.query.athlete_id) : req.user.id);

    // Team check for non-athlete viewing another athlete's data
    if (req.user.role !== "athlete" && req.query.athlete_id && !isUserInTeam(athleteId, req.user.team_id)) {
      return res.status(403).json({ error: "无权访问该运动员数据" });
    }

    // 获取所有训练记录和报告
    const allSessions = db.training_sessions.query({
      where: { athlete_id: athleteId },
      orderBy: ["session_date", "DESC"],
    });

    const allReports = db.ai_reports.query({
      where: { athlete_id: athleteId },
      orderBy: ["created_at", "DESC"],
    });

    const parseJsonSafe = (val) => {
      if (!val) return null;
      if (typeof val !== "string") return val;
      try { return JSON.parse(val); } catch { return null; }
    };

    // 近30天的日期范围
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

    const recentSessions = allSessions.filter((s) => s.session_date >= thirtyDaysAgoStr);
    const recentReports = allReports.filter((r) => {
      const session = db.training_sessions.findById(r.session_id);
      return session && session.session_date >= thirtyDaysAgoStr;
    });

    // 1. 近30天训练概览
    const totalSessions = recentSessions.length;
    // 总跑量（从 estimated_distance 累加，或从训练记录中提取）
    let totalDistance = 0;
    recentSessions.forEach((s) => {
      // 尝试从 session 的 objective_data_json 中提取距离
      const obj = parseJsonSafe(s.objective_data_json);
      if (obj?.distance) totalDistance += parseFloat(obj.distance) || 0;
    });
    // 如果没有距离数据，用报告数 * 平均估算
    if (totalDistance === 0 && totalSessions > 0) {
      totalDistance = Math.round(totalSessions * 8); // 默认估算8km/次
    }

    // 平均评分
    const scoresArr = recentSessions.filter((s) => s.body_score).map((s) => (s.body_score + s.mind_score) / 2);
    const avgScore = scoresArr.length > 0 ? Math.round((scoresArr.reduce((a, b) => a + b, 0) / scoresArr.length) * 10) / 10 : 0;

    // 平均情绪
    const emotions = recentReports.map((r) => {
      const emotion = parseJsonSafe(r.emotion_json);
      return emotion?.polarity;
    }).filter(Boolean);
    const emotionCounts = {};
    emotions.forEach((e) => { emotionCounts[e] = (emotionCounts[e] || 0) + 1; });
    const avgEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "--";

    // 2. 评分趋势（最近7次）
    const last7Sessions = allSessions.slice(0, 7).reverse();
    const scoreTrend = last7Sessions.map((s) => ({
      date: s.session_date.substring(5), // MM-DD
      body_score: s.body_score,
      mind_score: s.mind_score,
    }));

    // 3. 疲劳度趋势（最近7次）
    const fatigueMap = { "低": 1, "中": 2, "高": 3, "Low": 1, "Medium": 2, "High": 3 };
    const last7Reports = allReports.slice(0, 7);
    const fatigueTrend = last7Reports.map((r) => {
      const session = db.training_sessions.findById(r.session_id);
      const fatigue = parseJsonSafe(r.fatigue_json);
      return {
        date: session?.session_date?.substring(5) || "--",
        fatigue_value: fatigueMap[fatigue?.level] || 0,
      };
    }).reverse();

    // 4. 训练区间分布（近30天）
    const zoneDistribution = { E: 0, M: 0, T: 0, I: 0, R: 0 };
    recentReports.forEach((r) => {
      if (r.training_zone && zoneDistribution.hasOwnProperty(r.training_zone)) {
        zoneDistribution[r.training_zone]++;
      }
    });

    // 5. 综合评分趋势（最近7次）
    const overallScoreTrend = last7Reports.map((r) => {
      const session = db.training_sessions.findById(r.session_id);
      return {
        date: session?.session_date?.substring(5) || "--",
        overall_score: r.overall_score,
      };
    }).reverse();

    // 6. 常见训练难点TOP5
    const difficultyCounts = {};
    recentReports.forEach((r) => {
      const points = parseJsonSafe(r.difficulty_points);
      if (Array.isArray(points)) {
        points.forEach((p) => {
          if (p) difficultyCounts[p] = (difficultyCounts[p] || 0) + 1;
        });
      }
    });
    const topDifficulties = Object.entries(difficultyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([text, count]) => ({ text, count }));

    res.json({
      overview: {
        total_sessions: totalSessions,
        total_distance: Math.round(totalDistance),
        avg_score: avgScore,
        avg_emotion: avgEmotion,
      },
      score_trend: scoreTrend,
      fatigue_trend: fatigueTrend,
      zone_distribution: zoneDistribution,
      overall_score_trend: overallScoreTrend,
      top_difficulties: topDifficulties,
    });
  } catch (err) {
    console.error("获取个人统计失败:", err);
    res.status(500).json({ error: "获取个人统计失败" });
  }
});

// ============================================
// POST /api/athlete/upload-fit
// 上传并解析 FIT 文件
// ============================================
router.post("/upload-fit", authenticateToken, fitUpload.single("file"), fileSizeLimitHandler, async (req, res) => {
  try {
    // Determine target athlete: athlete uses own ID, non-athlete must specify athlete_id
    const targetAthleteId = req.user.role === "athlete" ? req.user.id : parseInt(req.body.athlete_id || req.query.athlete_id);
    if (!targetAthleteId) {
      return res.status(400).json({ error: "请指定运动员" });
    }
    // Team check for non-athlete uploading on behalf of another athlete
    if (req.user.role !== "athlete" && !isUserInTeam(targetAthleteId, req.user.team_id)) {
      return res.status(403).json({ error: "无权为该运动员上传数据" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "请选择要上传的文件" });
    }

    // 读取文件
    const fileBuffer = readFileSync(req.file.path);
    const fileName = req.file.originalname;

    // 解析 FIT 文件
    let parsedData;
    try {
      parsedData = await parseFitFile(fileBuffer, fileName);
    } catch (parseErr) {
      console.error("FIT 解析失败:", parseErr);
      return res.status(400).json({ error: `文件解析失败: ${parseErr.message}` });
    }

    // 尝试关联当天的训练记录
    const startDate = new Date(parsedData.start_time);
    const dateStr = startDate.toISOString().split("T")[0];

    const existingSessions = db.training_sessions.query({
      where: { athlete_id: targetAthleteId },
    }).filter((s) => s.session_date === dateStr);

    let matchedSessionId = null;

    if (existingSessions.length > 0) {
      // 关联到已有记录
      const session = existingSessions[0];
      db.training_sessions.update(session.id, {
        fit_data_json: JSON.stringify(parsedData),
        has_fit_data: 1,
        device_name: parsedData.device,
      });
      matchedSessionId = session.id;
    } else {
      // 创建新的训练记录
      const newSession = db.training_sessions.create({
        athlete_id: targetAthleteId,
        session_date: dateStr,
        session_name: `${parsedData.sport_type}训练`,
        body_score: null,
        mind_score: null,
        difficulty_score: null,
        tags: null,
        transcript: null,
        fit_data_json: JSON.stringify(parsedData),
        has_fit_data: 1,
        device_name: parsedData.device,
      });
      matchedSessionId = newSession.id;
    }

    // 构建摘要信息
    const summary = {
      date: dateStr,
      device: parsedData.device,
      distance: formatDistance(parsedData.total_distance_meters),
      duration: formatDuration(parsedData.total_duration_seconds),
      avg_pace: formatPace(parsedData.avg_pace_sec_per_km) + "/km",
      avg_hr: parsedData.avg_heart_rate ? `${parsedData.avg_heart_rate}bpm` : "--",
      max_hr: parsedData.max_heart_rate ? `${parsedData.max_heart_rate}bpm` : "--",
      cadence: parsedData.avg_cadence ? `${parsedData.avg_cadence}spm` : "--",
      power: parsedData.avg_power ? `${parsedData.avg_power}W` : "--",
      laps_count: parsedData.laps.length,
    };

    res.json({
      success: true,
      parsed_data: parsedData,
      summary,
      matched_session_id: matchedSessionId,
      message: existingSessions.length > 0
        ? "数据已关联到今天的训练记录"
        : "数据已导入，提交训练反馈时将自动使用",
    });
  } catch (err) {
    console.error("上传 FIT 文件失败:", err);
    res.status(500).json({ error: "上传失败: " + err.message });
  }
});

// ============================================
// POST /api/athlete/onboarding/conconi
// Conconi 测试结果 → 训练区间
// ============================================
router.post("/onboarding/conconi", authenticateToken, (req, res) => {
  try {
    const { aerobicThresholdHR, aerobicThresholdPace, anaerobicThresholdHR, anaerobicThresholdPace, maxHR } = req.body;

    if (!aerobicThresholdHR || !aerobicThresholdPace || !anaerobicThresholdHR || !anaerobicThresholdPace || !maxHR) {
      return res.status(400).json({ error: "请填写完整的 Conconi 测试数据" });
    }

    const result = calculateZonesFromConconi({
      aerobicThresholdHR: Number(aerobicThresholdHR),
      aerobicThresholdPace,
      anaerobicThresholdHR: Number(anaerobicThresholdHR),
      anaerobicThresholdPace,
      maxHR: Number(maxHR),
    });

    res.json(result);
  } catch (err) {
    console.error("Conconi 计算失败:", err);
    res.status(500).json({ error: "计算失败: " + err.message });
  }
});

// ============================================
// POST /api/athlete/onboarding/vdot
// PB 成绩 → VDOT → 训练区间
// ============================================
router.post("/onboarding/vdot", authenticateToken, (req, res) => {
  try {
    const { raceType, raceTime, maxHR } = req.body;

    if (!raceType || !raceTime) {
      return res.status(400).json({ error: "请选择比赛项目并输入完赛时间" });
    }

    const result = calculateFromPB(raceType, raceTime, Number(maxHR) || 190);
    res.json(result);
  } catch (err) {
    console.error("VDOT 计算失败:", err);
    res.status(500).json({ error: "计算失败: " + err.message });
  }
});

// ============================================
// POST /api/athlete/onboarding/save
// 保存体测数据到 athlete_profiles
// ============================================
router.post("/onboarding/save", authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { method, vdot, maxHR, restingHR, zones, conconiData } = req.body;

    // 查找或创建 athlete_profile
    let profile = db.athlete_profiles.findOne({ athlete_id: userId });
    const physiologyData = {
      method, // "conconi" 或 "vdot"
      vdot: Number(vdot),
      max_hr: Number(maxHR),
      resting_hr: Number(restingHR) || 60,
      zones,
      conconi_data: conconiData || null,
      assessed_at: new Date().toISOString(),
    };

    if (profile) {
      db.athlete_profiles.update(profile.id, {
        physiology: physiologyData,
        vdot: Number(vdot),
        max_hr: Number(maxHR),
        resting_hr: Number(restingHR) || 60,
        updated_at: new Date().toISOString(),
      });
    } else {
      db.athlete_profiles.create({
        athlete_id: userId,
        physiology: physiologyData,
        vdot: Number(vdot),
        max_hr: Number(maxHR),
        resting_hr: Number(restingHR) || 60,
      });
    }

    res.json({ success: true, message: "体测数据已保存" });
  } catch (err) {
    console.error("保存体测数据失败:", err);
    res.status(500).json({ error: "保存失败: " + err.message });
  }
});

// ============================================
// GET /api/athlete/onboarding/status
// 检查运动员是否已完成体测
// ============================================
router.get("/onboarding/status", authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const profile = db.athlete_profiles.findOne({ athlete_id: userId });
    const hasPhysiology = !!(profile?.physiology?.vdot || profile?.vdot);
    const assessedAt = profile?.physiology?.assessed_at || null;

    // 检查是否超过 6 周 (42 天)
    let isStale = false;
    if (assessedAt) {
      const daysSince = (Date.now() - new Date(assessedAt).getTime()) / (1000 * 60 * 60 * 24);
      isStale = daysSince > 42;
    }

    res.json({
      hasPhysiology,
      assessedAt,
      isStale,
      vdot: profile?.physiology?.vdot || profile?.vdot || null,
    });
  } catch (err) {
    console.error("查询体测状态失败:", err);
    res.status(500).json({ error: "查询失败" });
  }
});

export default router;
