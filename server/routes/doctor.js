import { Router } from "express";
import { readFileSync, mkdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { notifyTreatmentPlan } from "../services/notification.js";
import { dirname } from "path";
import db from "../db/index.js";
import { authenticateToken, getTeamUserIds, isUserInTeam } from "../middleware/auth.js";
import { checkUpload, fileSizeLimitHandler } from "../middleware/upload.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(__dirname, "../../uploads/doctor-checks"), { recursive: true });

const router = Router();

// 队医权限检查
function requireDoctor(req, res, next) {
  if (req.user.role === "doctor") return next();
  // 主教练和助教也可以查看（信息透明）
  if (["head_coach", "assistant"].includes(req.user.role)) return next();
  return res.status(403).json({ error: "无权访问" });
}

function requireDoctorWrite(req, res, next) {
  if (req.user.role === "doctor") return next();
  return res.status(403).json({ error: "只有队医可以执行此操作" });
}

// ============================================
// POST /api/doctor/treatment — 录入治疗记录
// ============================================
router.post("/treatment", authenticateToken, requireDoctorWrite, (req, res) => {
  try {
    const {
      athlete_id, body_part, treatment_method, device_used,
      notes, recovery_period_hours, treatment_date, injury_id,
    } = req.body;

    if (!athlete_id || !body_part || !treatment_method) {
      return res.status(400).json({ error: "运动员、治疗部位和治疗方式为必填项" });
    }

    if (athlete_id && !isUserInTeam(parseInt(athlete_id), req.user.team_id)) {
      return res.status(403).json({ error: "无权为该运动员创建治疗记录" });
    }

    const record = db.treatment_records.create({
      athlete_id: parseInt(athlete_id),
      treatment_date: treatment_date || new Date().toISOString(),
      body_part,
      treatment_method,
      equipment: device_used || null,
      post_treatment_notes: notes || null,
      recovery_period_hours: recovery_period_hours ? parseInt(recovery_period_hours) : null,
      restrictions: notes || null,
      injury_id: injury_id || null,
      hospital_check_file: null,
      recorded_by: req.user.id,
    });

    // 通知主教练和助教
    const doctor = db.users.findById(req.user.id);
    notifyTreatmentPlan(doctor?.display_name || "队医");

    res.json({ message: "治疗记录已录入", record });
  } catch (err) {
    console.error("录入治疗记录失败:", err);
    res.status(500).json({ error: "录入治疗记录失败" });
  }
});

// ============================================
// POST /api/doctor/parse-voice — AI解析队医语音文本
// ============================================
router.post("/parse-voice", authenticateToken, requireDoctorWrite, async (req, res) => {
  try {
    const API_BASE_URL = process.env.API_BASE_URL;
    const API_KEY = process.env.API_KEY;
    const MODEL_NAME = process.env.MODEL_NAME;

    if (!API_KEY || !API_BASE_URL) {
      return res.status(500).json({ error: "AI服务未配置" });
    }

    const { raw_voice_text } = req.body;
    if (!raw_voice_text) {
      return res.status(400).json({ error: "语音文本不能为空" });
    }

    // 获取运动员列表用于匹配
    const athletes = db.users.findAll({ role: "athlete", is_active: 1, team_id: req.user.team_id });
    const athleteNames = athletes.map((a) => a.display_name).join("、");

    const systemPrompt = `你是一位运动医学数据分析专家。请从队医的语音记录中提取治疗信息。

可匹配的运动员列表：${athleteNames}

严格输出以下JSON格式，不要输出JSON之外的内容：
{
  "athlete_name": "运动员姓名（从列表中匹配）",
  "body_part": "治疗部位",
  "treatment_method": "治疗方式（超声波治疗/冲击波治疗/手法松解/针灸/理疗/其他）",
  "treatment_duration": "治疗时长描述",
  "athlete_feedback": "运动员在治疗中的反馈",
  "post_treatment_assessment": "治疗后评估",
  "precautions": "注意事项",
  "recovery_period_hours": 48
}

注意：
- 运动员姓名必须从提供的列表中匹配最接近的
- treatment_method 必须是上述6种之一
- recovery_period_hours 为数字，如果语音中没有明确提及，默认48`;

    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        max_tokens: 1024,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `原始语音文本：${raw_voice_text}` },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `AI服务错误: ${errText}` });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    // 解析 JSON
    let parsed = null;
    try { parsed = JSON.parse(text.trim()); } catch {}
    if (!parsed) {
      const m = text.match(/\{[\s\S]*\}/);
      if (m) {
        let d = 0, e = -1;
        for (let i = 0; i < m[0].length; i++) {
          if (m[0][i] === '{') d++;
          if (m[0][i] === '}') d--;
          if (d === 0) { e = i; break; }
        }
        if (e >= 0) try { parsed = JSON.parse(m[0].substring(0, e + 1)); } catch {}
      }
    }

    if (!parsed) {
      return res.status(500).json({ error: "AI解析失败，请重试", raw: text.substring(0, 500) });
    }

    // 匹配运动员ID
    const matchedAthlete = athletes.find((a) => a.display_name === parsed.athlete_name);

    res.json({
      parsed,
      matched_athlete_id: matchedAthlete?.id || null,
    });
  } catch (err) {
    console.error("语音解析失败:", err);
    res.status(500).json({ error: "解析失败: " + err.message });
  }
});

// ============================================
// GET /api/doctor/treatments — 获取治疗记录列表
// ============================================
router.get("/treatments", authenticateToken, requireDoctor, (req, res) => {
  try {
    const { athlete_id, date, days } = req.query;
    const daysNum = parseInt(days) || 7;

    const teamUserIds = getTeamUserIds(req.user.team_id);
    let records = db.treatment_records.query({
      where: teamUserIds ? { athlete_id: { $in: teamUserIds } } : {},
      orderBy: ["treatment_date", "DESC"],
    });

    // 按运动员筛选
    if (athlete_id) {
      records = records.filter((r) => r.athlete_id === parseInt(athlete_id));
    }

    // 按日期筛选
    if (date) {
      records = records.filter((r) => r.treatment_date && r.treatment_date.startsWith(date));
    } else {
      // 默认最近N天
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysNum);
      const cutoffStr = cutoff.toISOString();
      records = records.filter((r) => r.treatment_date >= cutoffStr);
    }

    // 关联运动员名称
    const enriched = records.map((r) => {
      const athlete = db.users.findById(r.athlete_id);
      const recorder = db.users.findById(r.recorded_by);
      return {
        ...r,
        athlete_name: athlete?.display_name || "未知",
        recorder_name: recorder?.display_name || "未知",
      };
    });

    res.json({ treatments: enriched, total: enriched.length });
  } catch (err) {
    console.error("获取治疗记录失败:", err);
    res.status(500).json({ error: "获取治疗记录失败" });
  }
});

// ============================================
// GET /api/doctor/treatments/:id — 获取单条治疗记录
// ============================================
router.get("/treatments/:id", authenticateToken, requireDoctor, (req, res) => {
  try {
    const record = db.treatment_records.findById(parseInt(req.params.id));
    if (!record) return res.status(404).json({ error: "治疗记录不存在" });

    if (!isUserInTeam(record.athlete_id, req.user.team_id)) {
      return res.status(403).json({ error: "无权访问该治疗记录" });
    }

    const athlete = db.users.findById(record.athlete_id);
    const recorder = db.users.findById(record.recorded_by);

    res.json({
      record: {
        ...record,
        athlete_name: athlete?.display_name || "未知",
        recorder_name: recorder?.display_name || "未知",
      },
    });
  } catch (err) {
    console.error("获取治疗记录详情失败:", err);
    res.status(500).json({ error: "获取治疗记录详情失败" });
  }
});

// ============================================
// POST /api/doctor/injury — 录入伤病记录
// ============================================
router.post("/injury", authenticateToken, requireDoctorWrite, (req, res) => {
  try {
    const {
      athlete_id, injury_date, body_part, injury_type, severity,
      cause_analysis, diagnosis, treatment_plan, recovery_estimate, notes,
    } = req.body;

    if (!athlete_id || !body_part) {
      return res.status(400).json({ error: "运动员和受伤部位为必填项" });
    }

    if (athlete_id && !isUserInTeam(parseInt(athlete_id), req.user.team_id)) {
      return res.status(403).json({ error: "无权为该运动员创建伤病记录" });
    }

    const record = db.injury_records.create({
      athlete_id: parseInt(athlete_id),
      injury_date: injury_date || new Date().toISOString().split("T")[0],
      body_part,
      injury_type: injury_type || null,
      severity: severity || null,
      description: cause_analysis || null,
      diagnosis: diagnosis || null,
      treatment_plan: treatment_plan || null,
      recovery_status: "active",
      estimated_recovery_date: recovery_estimate || null,
      actual_recovery_date: null,
      hospital_check_files: null,
      notes: notes || null,
      recorded_by: req.user.id,
    });

    res.json({ message: "伤病记录已录入", record });
  } catch (err) {
    console.error("录入伤病记录失败:", err);
    res.status(500).json({ error: "录入伤病记录失败" });
  }
});

// ============================================
// GET /api/doctor/injuries — 获取伤病记录列表
// ============================================
router.get("/injuries", authenticateToken, requireDoctor, (req, res) => {
  try {
    const { athlete_id, status } = req.query;

    const teamUserIds = getTeamUserIds(req.user.team_id);
    let records = db.injury_records.query({
      where: teamUserIds ? { athlete_id: { $in: teamUserIds } } : {},
      orderBy: ["injury_date", "DESC"],
    });

    if (athlete_id) {
      records = records.filter((r) => r.athlete_id === parseInt(athlete_id));
    }
    if (status) {
      records = records.filter((r) => r.recovery_status === status);
    }

    const enriched = records.map((r) => {
      const athlete = db.users.findById(r.athlete_id);
      const recorder = db.users.findById(r.recorded_by);
      return {
        ...r,
        athlete_name: athlete?.display_name || "未知",
        recorder_name: recorder?.display_name || "未知",
      };
    });

    res.json({ injuries: enriched, total: enriched.length });
  } catch (err) {
    console.error("获取伤病记录失败:", err);
    res.status(500).json({ error: "获取伤病记录失败" });
  }
});

// ============================================
// GET /api/doctor/injury-alerts — 获取伤病预警列表
// ============================================
router.get("/injury-alerts", authenticateToken, requireDoctor, (req, res) => {
  try {
    const parseJsonSafe = (val) => {
      if (!val) return null;
      if (typeof val !== "string") return val;
      try { return JSON.parse(val); } catch { return null; }
    };

    const athletes = db.users.findAll({ role: "athlete", is_active: 1, team_id: req.user.team_id });
    const alerts = [];

    for (const athlete of athletes) {
      // 获取最近7次报告
      const reports = db.ai_reports.query({
        where: { athlete_id: athlete.id },
        orderBy: ["created_at", "DESC"],
      }).slice(0, 7);

      if (reports.length === 0) continue;

      const latestReport = reports[0];
      const reasons = [];
      let riskLevel = "low"; // low, medium, high

      // 1. 检查 risk_flag
      if (latestReport.risk_flag) {
        reasons.push(latestReport.risk_reason || "AI标记需关注");
        riskLevel = "high";
      }

      // 2. 检查疲劳度连续3天为"高"
      const recentFatigue = reports.slice(0, 3).map((r) => {
        const fatigue = parseJsonSafe(r.fatigue_json);
        return fatigue?.level;
      });
      if (recentFatigue.filter((f) => f === "高").length >= 3) {
        reasons.push("连续3天疲劳度高");
        riskLevel = "high";
      } else if (recentFatigue.filter((f) => f === "高").length >= 2) {
        reasons.push("近期疲劳度偏高");
        if (riskLevel !== "high") riskLevel = "medium";
      }

      // 3. 检查身体部位疼痛
      const bodyParts = reports.slice(0, 3).flatMap((r) => {
        const fatigue = parseJsonSafe(r.fatigue_json);
        return fatigue?.body_parts || [];
      });
      const partCounts = {};
      bodyParts.forEach((p) => { partCounts[p] = (partCounts[p] || 0) + 1; });
      const frequentParts = Object.entries(partCounts).filter(([_, c]) => c >= 2);
      if (frequentParts.length > 0) {
        reasons.push(`${frequentParts.map(([p]) => p).join("、")}反复出现疼痛`);
        if (riskLevel !== "high") riskLevel = "medium";
      }

      // 4. 检查活跃伤病
      const activeInjuries = db.injury_records.findAll({
        athlete_id: athlete.id,
        recovery_status: "active",
      });
      if (activeInjuries.length > 0) {
        reasons.push(`有${activeInjuries.length}个未恢复伤病`);
        riskLevel = "high";
      }

      if (reasons.length > 0) {
        alerts.push({
          athlete_id: athlete.id,
          athlete_name: athlete.display_name,
          risk_level: riskLevel,
          reasons,
          latest_score: latestReport.overall_score,
          latest_status: latestReport.status_level,
        });
      }
    }

    // 排序：high > medium > low
    const order = { high: 0, medium: 1, low: 2 };
    alerts.sort((a, b) => order[a.risk_level] - order[b.risk_level]);

    res.json({ alerts, total: alerts.length });
  } catch (err) {
    console.error("获取伤病预警失败:", err);
    res.status(500).json({ error: "获取伤病预警失败" });
  }
});

// ============================================
// GET /api/doctor/athlete/:id/health — 运动员健康数据
// ============================================
router.get("/athlete/:id/health", authenticateToken, requireDoctor, (req, res) => {
  try {
    const athleteId = parseInt(req.params.id);
    const athlete = db.users.findById(athleteId);
    if (!athlete) return res.status(404).json({ error: "运动员不存在" });

    if (req.user.team_id && athlete.team_id !== req.user.team_id) {
      return res.status(403).json({ error: "无权访问该运动员数据" });
    }

    const parseJsonSafe = (val) => {
      if (!val) return null;
      if (typeof val !== "string") return val;
      try { return JSON.parse(val); } catch { return null; }
    };

    // 伤病历史
    const injuries = db.injury_records.query({
      where: { athlete_id: athleteId },
      orderBy: ["injury_date", "DESC"],
    });

    // 近期治疗记录
    const treatments = db.treatment_records.query({
      where: { athlete_id: athleteId },
      orderBy: ["treatment_date", "DESC"],
    }).slice(0, 20);

    // 近期AI报告中的疲劳数据
    const reports = db.ai_reports.query({
      where: { athlete_id: athleteId },
      orderBy: ["created_at", "DESC"],
    }).slice(0, 14);

    const fatigueTrend = reports.map((r) => {
      const fatigue = parseJsonSafe(r.fatigue_json);
      return {
        date: r.created_at?.split("T")[0],
        level: fatigue?.level || "--",
        body_parts: fatigue?.body_parts || [],
      };
    });

    // body_parts 出现频率统计
    const partCounts = {};
    reports.forEach((r) => {
      const fatigue = parseJsonSafe(r.fatigue_json);
      (fatigue?.body_parts || []).forEach((p) => {
        partCounts[p] = (partCounts[p] || 0) + 1;
      });
    });
    const bodyPartStats = Object.entries(partCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([part, count]) => ({ part, count }));

    res.json({
      athlete: {
        id: athlete.id,
        name: athlete.display_name,
      },
      injuries,
      treatments,
      fatigue_trend: fatigueTrend,
      body_part_stats: bodyPartStats,
    });
  } catch (err) {
    console.error("获取运动员健康数据失败:", err);
    res.status(500).json({ error: "获取运动员健康数据失败" });
  }
});

// ============================================
// POST /api/doctor/upload-check — 上传医院检查结果
// ============================================
router.post("/upload-check", authenticateToken, requireDoctorWrite, checkUpload.single("file"), fileSizeLimitHandler, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "请选择要上传的文件" });
    }

    const { athlete_id, check_date, check_type, notes } = req.body;

    if (!athlete_id) {
      return res.status(400).json({ error: "请指定运动员" });
    }

    if (athlete_id && !isUserInTeam(parseInt(athlete_id), req.user.team_id)) {
      return res.status(403).json({ error: "无权为该运动员上传检查结果" });
    }

    const filePath = `/uploads/doctor-checks/${req.file.filename}`;

    // 保存到伤病记录（作为附件）
    const record = db.injury_records.create({
      athlete_id: parseInt(athlete_id),
      injury_date: check_date || new Date().toISOString().split("T")[0],
      body_part: check_type || "医院检查",
      injury_type: "检查报告",
      severity: null,
      description: notes || null,
      diagnosis: check_type || null,
      treatment_plan: null,
      recovery_status: "active",
      estimated_recovery_date: null,
      actual_recovery_date: null,
      hospital_check_files: filePath,
      notes: notes || null,
      recorded_by: req.user.id,
    });

    res.json({
      message: "检查结果已上传",
      record,
      file_url: filePath,
    });
  } catch (err) {
    console.error("上传检查结果失败:", err);
    res.status(500).json({ error: "上传检查结果失败" });
  }
});

// ============================================
// GET /api/doctor/tomorrow-plans — 查看明日训练计划
// ============================================
router.get("/tomorrow-plans", authenticateToken, requireDoctor, (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const teamUserIds = getTeamUserIds(req.user.team_id);
    const plans = db.training_plans.query({
      where: { approval_status: "approved", plan_date: tomorrowStr },
    }).filter((p) => {
      if (!teamUserIds) return true;
      const targets = typeof p.target_athletes === "string" ? JSON.parse(p.target_athletes) : (p.target_athletes || []);
      return targets.length === 0 || targets.some((id) => teamUserIds.includes(id));
    });

    const athletes = db.users.findAll({ role: "athlete", is_active: 1, team_id: req.user.team_id });

    const result = plans.map((p) => {
      const content = typeof p.content_json === "string" ? JSON.parse(p.content_json) : (p.content_json || {});
      const targets = typeof p.target_athletes === "string" ? JSON.parse(p.target_athletes) : (p.target_athletes || []);

      // 如果没有指定运动员，则适用于全队
      const affectedAthletes = targets.length === 0
        ? athletes
        : athletes.filter((a) => targets.includes(a.id));

      return affectedAthletes.map((a) => ({
        athlete_id: a.id,
        athlete_name: a.display_name,
        title: p.title,
        training_zone: content.target_zone || p.training_zone || null,
        target_pace: content.target_pace || null,
        focus_body_parts: p.focus_body_parts || null,
        intensity_level: p.intensity_level || null,
      }));
    }).flat();

    res.json({
      date: tomorrowStr,
      plans: result,
    });
  } catch (err) {
    console.error("获取明日计划失败:", err);
    res.status(500).json({ error: "获取明日计划失败" });
  }
});

// ============================================
// GET /api/doctor/today-treatments — 获取今日治疗记录
// ============================================
router.get("/today-treatments", authenticateToken, requireDoctor, (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const teamUserIds = getTeamUserIds(req.user.team_id);
    const records = db.treatment_records.query({
      where: teamUserIds ? { athlete_id: { $in: teamUserIds } } : {},
      orderBy: ["treatment_date", "DESC"],
    }).filter((r) => r.treatment_date && r.treatment_date.startsWith(today));

    const enriched = records.map((r) => {
      const athlete = db.users.findById(r.athlete_id);
      return {
        ...r,
        athlete_name: athlete?.display_name || "未知",
      };
    });

    res.json({ treatments: enriched, total: enriched.length });
  } catch (err) {
    console.error("获取今日治疗记录失败:", err);
    res.status(500).json({ error: "获取今日治疗记录失败" });
  }
});

// ============================================
// GET /api/doctor/conflict-check — 治疗-训练冲突检查
// ============================================
router.get("/conflict-check", authenticateToken, requireDoctor, (req, res) => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    // 1. 获取今日所有治疗记录
    const teamUserIds = getTeamUserIds(req.user.team_id);
    const todayTreatments = db.treatment_records.query({
      where: teamUserIds ? { athlete_id: { $in: teamUserIds } } : {},
      orderBy: ["treatment_date", "DESC"],
    }).filter((r) => r.treatment_date && r.treatment_date.startsWith(todayStr));

    // 2. 获取明日所有训练计划
    const tomorrowPlans = db.training_plans.query({
      where: { approval_status: "approved", plan_date: tomorrowStr },
    }).filter((p) => {
      if (!teamUserIds) return true;
      const targets = typeof p.target_athletes === "string" ? JSON.parse(p.target_athletes) : (p.target_athletes || []);
      return targets.length === 0 || targets.some((id) => teamUserIds.includes(id));
    });

    // 3. 获取所有运动员
    const athletes = db.users.findAll({ role: "athlete", is_active: 1, team_id: req.user.team_id });

    // 4. 身体部位与训练部位的映射
    const bodyPartToRegion = {
      "膝": ["腿", "膝", "下肢", "深蹲", "跑", "跳"],
      "膝盖": ["腿", "膝", "下肢", "深蹲", "跑", "跳"],
      "腿": ["腿", "下肢", "跑", "深蹲", "跳"],
      "大腿": ["腿", "大腿", "下肢", "跑", "深蹲"],
      "小腿": ["腿", "小腿", "下肢", "跑"],
      "跟腱": ["腿", "跟腱", "下肢", "跑"],
      "踝": ["腿", "踝", "下肢", "跑"],
      "肩": ["肩", "上肢", "推", "拉"],
      "肩膀": ["肩", "上肢", "推", "拉"],
      "背": ["背", "上肢", "核心"],
      "腰": ["腰", "核心", "下肢"],
      "核心": ["核心", "腰"],
      "手臂": ["手臂", "上肢"],
      "腕": ["腕", "上肢"],
    };

    // 5. 训练内容与身体部位的映射
    const planContentToRegions = (plan) => {
      const content = typeof plan.content_json === "string" ? JSON.parse(plan.content_json) : (plan.content_json || {});
      const regions = new Set();

      // 从 focus_body_parts 提取
      if (plan.focus_body_parts) {
        plan.focus_body_parts.split(/[,，、]/).forEach((p) => regions.add(p.trim()));
      }

      // 从训练内容提取关键词
      const text = [
        content.warmup || "",
        content.notes || "",
        ...(content.main || []).map((m) => typeof m === "string" ? m : m.exercise || ""),
      ].join(" ");

      if (/腿|跑|跳|深蹲|弓步/.test(text)) { regions.add("腿"); regions.add("下肢"); }
      if (/肩|推|拉|卧推|引体/.test(text)) { regions.add("肩"); regions.add("上肢"); }
      if (/核心|腰|腹/.test(text)) { regions.add("核心"); }
      if (/背/.test(text)) { regions.add("背"); }

      // 从训练区间推断
      const zone = content.target_zone || plan.training_zone;
      if (["I", "R", "T"].includes(zone)) {
        regions.add("腿"); regions.add("下肢"); // 高强度跑步主要用腿
      }

      return regions;
    };

    // 6. 对每个运动员进行冲突检查
    const results = athletes.map((athlete) => {
      // 该运动员今日治疗
      const athleteTreatments = todayTreatments.filter((t) => t.athlete_id === athlete.id);

      // 该运动员明日计划
      const athletePlans = tomorrowPlans.filter((p) => {
        const targets = typeof p.target_athletes === "string" ? JSON.parse(p.target_athletes) : (p.target_athletes || []);
        return targets.length === 0 || targets.includes(athlete.id);
      });

      // 无治疗记录
      if (athleteTreatments.length === 0) {
        const plan = athletePlans[0];
        return {
          athlete_id: athlete.id,
          athlete_name: athlete.display_name,
          status: "no_conflict",
          treatment: "无今日治疗",
          tomorrow_plan: plan ? `${plan.title}（${plan.intensity_level || "未标注"}）` : "无明日计划",
          analysis: "今日无治疗安排",
          suggestion: "无",
        };
      }

      // 无明日计划
      if (athletePlans.length === 0) {
        return {
          athlete_id: athlete.id,
          athlete_name: athlete.display_name,
          status: "no_conflict",
          treatment: athleteTreatments.map((t) => `${t.body_part}${t.treatment_method}（恢复期${t.recovery_period_hours || "未知"}h）`).join("；"),
          tomorrow_plan: "无明日计划",
          analysis: "明日无训练安排",
          suggestion: "无",
        };
      }

      // 有治疗且有计划，进行冲突检查
      const plan = athletePlans[0];
      const planRegions = planContentToRegions(plan);
      let worstStatus = "no_conflict";
      let conflictDetails = [];

      for (const treatment of athleteTreatments) {
        const treatmentPart = treatment.body_part || "";
        const recoveryHours = treatment.recovery_period_hours || 0;
        const treatmentTime = new Date(treatment.treatment_date);
        const recoveryEnd = new Date(treatmentTime.getTime() + recoveryHours * 3600 * 1000);
        const planStart = new Date(`${tomorrowStr}T08:00:00`);

        // 检查恢复期是否覆盖到明天
        const recoveryCoversTomorrow = recoveryEnd > planStart;

        // 检查治疗部位是否与训练部位冲突
        let partConflicts = false;
        for (const [part, related] of Object.entries(bodyPartToRegion)) {
          if (treatmentPart.includes(part)) {
            for (const region of related) {
              if (planRegions.has(region)) {
                partConflicts = true;
                break;
              }
            }
          }
          if (partConflicts) break;
        }

        if (recoveryCoversTomorrow && partConflicts) {
          // 判断冲突严重程度
          const intensity = plan.intensity_level || "medium";
          if (intensity === "high") {
            worstStatus = "major_conflict";
            conflictDetails.push({
              treatment: `${treatmentPart}${treatment.treatment_method}（恢复期${recoveryHours}h）`,
              reason: `${treatmentPart}在恢复期内，明日高强度训练会直接使用该部位`,
            });
          } else {
            if (worstStatus !== "major_conflict") worstStatus = "minor_conflict";
            conflictDetails.push({
              treatment: `${treatmentPart}${treatment.treatment_method}（恢复期${recoveryHours}h）`,
              reason: `${treatmentPart}在恢复期内，但明日训练强度较低`,
            });
          }
        }
      }

      if (worstStatus === "no_conflict") {
        return {
          athlete_id: athlete.id,
          athlete_name: athlete.display_name,
          status: "no_conflict",
          treatment: athleteTreatments.map((t) => `${t.body_part}${t.treatment_method}（恢复期${t.recovery_period_hours || "未知"}h）`).join("；"),
          tomorrow_plan: `${plan.title}（${plan.intensity_level || "未标注"}）`,
          analysis: "治疗部位与明日训练部位不冲突",
          suggestion: "可正常执行训练计划",
        };
      }

      return {
        athlete_id: athlete.id,
        athlete_name: athlete.display_name,
        status: worstStatus,
        treatment: conflictDetails.map((d) => d.treatment).join("；"),
        tomorrow_plan: `${plan.title}（${plan.intensity_level || "未标注"}）`,
        analysis: conflictDetails.map((d) => d.reason).join("；"),
        suggestion: worstStatus === "major_conflict"
          ? "建议调整明日训练计划，避开治疗部位"
          : "训练影响较小，可正常进行，注意避免治疗部位承压",
      };
    });

    const conflictCount = results.filter((r) => r.status === "major_conflict").length;
    const minorConflictCount = results.filter((r) => r.status === "minor_conflict").length;

    // 严重冲突时自动创建通知
    if (conflictCount > 0) {
      const conflicts = results.filter((r) => r.status === "major_conflict");
      const conflictMsg = conflicts.map((c) => `${c.athlete_name}：${c.analysis}`).join("；");

      // 通知主教练
      const headCoaches = db.users.findAll({ role: "head_coach", is_active: 1, team_id: req.user.team_id });
      for (const coach of headCoaches) {
        db.notifications.create({
          recipient_id: coach.id,
          sender_id: req.user.id,
          type: "conflict_alert",
          title: "⚠️ 治疗-训练冲突提醒",
          content: conflictMsg,
          related_entity_type: "conflict_check",
          related_entity_id: null,
          priority: "high",
          is_read: 0,
        });
      }

      // 通知助教
      const assistants = db.users.findAll({ role: "assistant", is_active: 1, team_id: req.user.team_id });
      for (const assistant of assistants) {
        db.notifications.create({
          recipient_id: assistant.id,
          sender_id: req.user.id,
          type: "conflict_alert",
          title: "⚠️ 治疗-训练冲突提醒",
          content: conflictMsg,
          related_entity_type: "conflict_check",
          related_entity_id: null,
          priority: "high",
          is_read: 0,
        });
      }
    }

    res.json({
      check_date: todayStr,
      tomorrow_date: tomorrowStr,
      results,
      conflict_count: conflictCount,
      minor_conflict_count: minorConflictCount,
    });
  } catch (err) {
    console.error("冲突检查失败:", err);
    res.status(500).json({ error: "冲突检查失败" });
  }
});

export default router;
