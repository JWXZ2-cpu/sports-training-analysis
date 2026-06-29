import { Router } from "express";
import db from "../db/index.js";
import { authenticateToken, getTeamUserIds, isUserInTeam } from "../middleware/auth.js";

const router = Router();

// 辅助函数：按团队过滤计划
function filterPlansByTeam(plans, teamUserIds) {
  if (!teamUserIds) return plans;
  return plans.filter((p) => {
    const targets = Array.isArray(p.target_athletes) ? p.target_athletes : [];
    return targets.length === 0 || targets.some((id) => teamUserIds.includes(id));
  });
}

// 辅助函数：解析计划数据
function parsePlan(plan) {
  if (!plan) return null;
  const parseJson = (val) => {
    if (!val) return null;
    if (typeof val !== "string") return val;
    try { return JSON.parse(val); } catch { return null; }
  };
  return {
    ...plan,
    content_json: parseJson(plan.content_json) || {},
    target_athletes: parseJson(plan.target_athletes) || [],
  };
}

// 辅助函数：关联创建者名称
function enrichPlan(plan) {
  const parsed = parsePlan(plan);
  if (!parsed) return null;
  const creator = db.users.findById(parsed.created_by);
  const approver = parsed.approved_by ? db.users.findById(parsed.approved_by) : null;
  return {
    ...parsed,
    creator_name: creator?.display_name || "未知",
    approver_name: approver?.display_name || null,
  };
}

// ============================================
// GET /api/plans — 获取训练计划列表
// ============================================
router.get("/", authenticateToken, (req, res) => {
  try {
    const { date, date_from, date_to, status, week_start, athlete_id } = req.query;
    const today = new Date().toISOString().split("T")[0];

    let plans;
    if (req.user.role === "athlete") {
      // 运动员只能看本周已批准的计划
      const ws = new Date();
      ws.setDate(ws.getDate() - ws.getDay());
      const we = new Date(ws);
      we.setDate(we.getDate() + 6);

      plans = db.training_plans.query({
        where: { approval_status: "approved" },
        orderBy: ["plan_date", "ASC"],
      }).filter((p) => {
        const d = p.plan_date;
        return d >= ws.toISOString().split("T")[0] && d <= we.toISOString().split("T")[0];
      });
    } else {
      const where = {};
      if (status) where.approval_status = status;
      plans = db.training_plans.query({ where, orderBy: ["plan_date", "ASC"] });

      // 按周筛选
      if (week_start) {
        const ws = new Date(week_start);
        const we = new Date(ws);
        we.setDate(we.getDate() + 6);
        const wsStr = ws.toISOString().split("T")[0];
        const weStr = we.toISOString().split("T")[0];
        plans = plans.filter((p) => p.plan_date >= wsStr && p.plan_date <= weStr);
      }

      if (date) plans = plans.filter((p) => p.plan_date === date);
      if (date_from) plans = plans.filter((p) => p.plan_date >= date_from);
      if (date_to) plans = plans.filter((p) => p.plan_date <= date_to);

      // 按运动员筛选
      if (athlete_id) {
        const aid = parseInt(athlete_id);
        plans = plans.filter((p) => {
          const targets = typeof p.target_athletes === "string" ? JSON.parse(p.target_athletes) : (p.target_athletes || []);
          return targets.length === 0 || targets.includes(aid);
        });
      }

      // 按团队过滤
      const teamUserIds = getTeamUserIds(req.user.team_id);
      plans = filterPlansByTeam(plans, teamUserIds);
    }

    res.json({ plans: plans.map(enrichPlan) });
  } catch (err) {
    console.error("获取训练计划失败:", err);
    res.status(500).json({ error: "获取训练计划失败" });
  }
});

// ============================================
// GET /api/plans/today — 获取今日计划
// ============================================
router.get("/today", authenticateToken, (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    let plans = db.training_plans.query({
      where: { approval_status: "approved", plan_date: today },
    });

    if (req.user.role === "athlete") {
      plans = plans.filter((p) => {
        const targets = typeof p.target_athletes === "string" ? JSON.parse(p.target_athletes) : (p.target_athletes || []);
        return targets.length === 0 || targets.includes("all") || targets.includes(req.user.id);
      });
    } else {
      const teamUserIds = getTeamUserIds(req.user.team_id);
      plans = filterPlansByTeam(plans, teamUserIds);
    }

    res.json({ plans: plans.map(enrichPlan), date: today });
  } catch (err) {
    console.error("获取今日计划失败:", err);
    res.status(500).json({ error: "获取今日计划失败" });
  }
});

// ============================================
// GET /api/plans/:id — 获取单个计划详情
// ============================================
router.get("/:id", authenticateToken, (req, res) => {
  try {
    const plan = db.training_plans.findById(parseInt(req.params.id));
    if (!plan) return res.status(404).json({ error: "计划不存在" });

    if (req.user.role !== "athlete" && req.user.team_id) {
      const teamUserIds = getTeamUserIds(req.user.team_id);
      const targets = Array.isArray(plan.target_athletes) ? plan.target_athletes : [];
      if (targets.length > 0 && !targets.some((id) => teamUserIds.includes(id))) {
        return res.status(403).json({ error: "无权访问该计划" });
      }
    }

    res.json({ plan: enrichPlan(plan) });
  } catch (err) {
    console.error("获取计划详情失败:", err);
    res.status(500).json({ error: "获取计划详情失败" });
  }
});

// ============================================
// POST /api/plans — 创建训练计划
// ============================================
router.post("/", authenticateToken, (req, res) => {
  try {
    if (!["head_coach", "assistant"].includes(req.user.role)) {
      return res.status(403).json({ error: "无权创建训练计划" });
    }

    const {
      title, description, plan_date, plan_type,
      training_zone, intensity_level, target_pace, target_hr,
      estimated_distance, estimated_duration,
      target_athletes, content_json, focus_body_parts, notes,
    } = req.body;

    if (!title || !plan_date) {
      return res.status(400).json({ error: "标题和日期为必填项" });
    }

    const approval_status = req.user.role === "head_coach" ? "approved" : "pending";

    // 合并 content_json
    const content = {
      warmup: content_json?.warmup || "",
      main: content_json?.main || [],
      cooldown: content_json?.cooldown || "",
      notes: notes || content_json?.notes || "",
      target_zone: training_zone || content_json?.target_zone || "",
      target_pace: target_pace || content_json?.target_pace || "",
      target_hr: target_hr || content_json?.target_hr || "",
      estimated_distance: estimated_distance || content_json?.estimated_distance || "",
      estimated_duration: estimated_duration || content_json?.estimated_duration || "",
    };

    const plan = db.training_plans.create({
      title, description: description || null,
      plan_date, plan_type: plan_type || "daily",
      training_zone: training_zone || null,
      intensity_level: intensity_level || null,
      target_athletes: JSON.stringify(target_athletes || []),
      content_json: JSON.stringify(content),
      focus_body_parts: focus_body_parts || null,
      created_by: req.user.id,
      approved_by: null,
      approval_status,
      rejection_reason: null,
      published_at: approval_status === "approved" ? new Date().toISOString() : null,
    });

    res.json({
      message: approval_status === "approved" ? "训练计划已发布" : "训练计划已提交",
      plan: enrichPlan(plan),
    });
  } catch (err) {
    console.error("创建训练计划失败:", err);
    res.status(500).json({ error: "创建训练计划失败" });
  }
});

// ============================================
// PUT /api/plans/:id — 修改训练计划
// ============================================
router.put("/:id", authenticateToken, (req, res) => {
  try {
    if (req.user.role !== "head_coach") {
      return res.status(403).json({ error: "只有主教练可以修改计划" });
    }

    const plan = db.training_plans.findById(parseInt(req.params.id));
    if (!plan) return res.status(404).json({ error: "计划不存在" });

    if (req.user.team_id) {
      const teamUserIds = getTeamUserIds(req.user.team_id);
      const targets = Array.isArray(plan.target_athletes) ? plan.target_athletes : [];
      if (targets.length > 0 && !targets.some((id) => teamUserIds.includes(id))) {
        return res.status(403).json({ error: "无权操作该计划" });
      }
    }

    const {
      title, description, plan_date, plan_type,
      training_zone, intensity_level, target_pace, target_hr,
      estimated_distance, estimated_duration,
      target_athletes, content_json, focus_body_parts, notes,
    } = req.body;

    const content = {
      warmup: content_json?.warmup || "",
      main: content_json?.main || [],
      cooldown: content_json?.cooldown || "",
      notes: notes || content_json?.notes || "",
      target_zone: training_zone || content_json?.target_zone || "",
      target_pace: target_pace || content_json?.target_pace || "",
      target_hr: target_hr || content_json?.target_hr || "",
      estimated_distance: estimated_distance || content_json?.estimated_distance || "",
      estimated_duration: estimated_duration || content_json?.estimated_duration || "",
    };

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (plan_date !== undefined) updates.plan_date = plan_date;
    if (plan_type !== undefined) updates.plan_type = plan_type;
    if (training_zone !== undefined) updates.training_zone = training_zone;
    if (intensity_level !== undefined) updates.intensity_level = intensity_level;
    if (focus_body_parts !== undefined) updates.focus_body_parts = focus_body_parts;
    if (target_athletes !== undefined) updates.target_athletes = JSON.stringify(target_athletes);
    updates.content_json = JSON.stringify(content);

    db.training_plans.update(plan.id, updates);
    const updated = db.training_plans.findById(plan.id);

    res.json({ message: "计划已更新", plan: enrichPlan(updated) });
  } catch (err) {
    console.error("修改训练计划失败:", err);
    res.status(500).json({ error: "修改训练计划失败" });
  }
});

// ============================================
// DELETE /api/plans/:id — 删除训练计划
// ============================================
router.delete("/:id", authenticateToken, (req, res) => {
  try {
    if (req.user.role !== "head_coach") {
      return res.status(403).json({ error: "只有主教练可以删除计划" });
    }

    const plan = db.training_plans.findById(parseInt(req.params.id));
    if (!plan) return res.status(404).json({ error: "计划不存在" });

    if (req.user.team_id) {
      const teamUserIds = getTeamUserIds(req.user.team_id);
      const targets = Array.isArray(plan.target_athletes) ? plan.target_athletes : [];
      if (targets.length > 0 && !targets.some((id) => teamUserIds.includes(id))) {
        return res.status(403).json({ error: "无权操作该计划" });
      }
    }

    db.training_plans.delete(plan.id);
    res.json({ message: "计划已删除" });
  } catch (err) {
    console.error("删除训练计划失败:", err);
    res.status(500).json({ error: "删除训练计划失败" });
  }
});

// ============================================
// POST /api/plans/:id/approve — 审批计划
// ============================================
router.post("/:id/approve", authenticateToken, (req, res) => {
  try {
    if (req.user.role !== "head_coach") {
      return res.status(403).json({ error: "只有主教练可以审批计划" });
    }

    const plan = db.training_plans.findById(parseInt(req.params.id));
    if (!plan) return res.status(404).json({ error: "计划不存在" });

    if (req.user.team_id) {
      const teamUserIds = getTeamUserIds(req.user.team_id);
      const targets = Array.isArray(plan.target_athletes) ? plan.target_athletes : [];
      if (targets.length > 0 && !targets.some((id) => teamUserIds.includes(id))) {
        return res.status(403).json({ error: "无权操作该计划" });
      }
    }

    const { action, reason } = req.body;

    if (action === "approve") {
      db.training_plans.update(plan.id, {
        approval_status: "approved",
        approved_by: req.user.id,
        published_at: new Date().toISOString(),
      });
      res.json({ message: "计划已批准" });
    } else if (action === "reject") {
      db.training_plans.update(plan.id, {
        approval_status: "rejected",
        approved_by: req.user.id,
        rejection_reason: reason || "",
      });
      res.json({ message: "计划已驳回" });
    } else {
      res.status(400).json({ error: "无效的操作" });
    }
  } catch (err) {
    console.error("审批计划失败:", err);
    res.status(500).json({ error: "审批计划失败" });
  }
});

// ============================================
// POST /api/coach/ai-plan-suggestion — AI辅助制定训练计划
// ============================================
router.post("/ai-plan-suggestion", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "head_coach") {
      return res.status(403).json({ error: "只有主教练可以使用AI辅助制定计划" });
    }

    const API_BASE_URL = process.env.API_BASE_URL;
    const API_KEY = process.env.API_KEY;
    const MODEL_NAME = process.env.MODEL_NAME;

    if (!API_KEY || !API_BASE_URL) {
      return res.status(500).json({ error: "AI服务未配置" });
    }

    const { goal, athlete_ids, training_phase, days_to_race, notes } = req.body;

    if (!goal || !athlete_ids?.length) {
      return res.status(400).json({ error: "请选择训练目标和运动员" });
    }

    const parseJsonSafe = (val) => {
      if (!val) return null;
      if (typeof val !== "string") return val;
      try { return JSON.parse(val); } catch { return null; }
    };

    // 1. 查询运动员近期数据
    const athleteData = athlete_ids.map((id) => {
      const athlete = db.users.findById(id);
      if (!athlete || (req.user.team_id && athlete.team_id !== req.user.team_id)) return null;

      // 最近7次训练
      const sessions = db.training_sessions.query({
        where: { athlete_id: id },
        orderBy: ["session_date", "DESC"],
        limit: 7,
      });

      // 区间分布统计
      const zoneCount = { E: 0, M: 0, T: 0, I: 0, R: 0 };
      let latestVdot = null;
      let latestFatigue = null;

      sessions.forEach((s) => {
        const report = db.ai_reports.findOne({ session_id: s.id });
        if (report?.training_zone && zoneCount.hasOwnProperty(report.training_zone)) {
          zoneCount[report.training_zone]++;
        }
        if (report?.vdot_estimate && !latestVdot) latestVdot = report.vdot_estimate;
        if (!latestFatigue) {
          const fatigue = parseJsonSafe(report?.fatigue_json);
          if (fatigue?.level) latestFatigue = fatigue.level;
        }
      });

      // 近期伤病
      const injuries = db.injury_records.query({
        where: { athlete_id: id },
      }).filter((r) => r.recovery_status !== "recovered");

      // 近48小时治疗记录
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const treatments = db.treatment_records.query({
        where: { athlete_id: id },
      }).filter((t) => new Date(t.treatment_date) >= twoDaysAgo);

      return {
        name: athlete.display_name,
        recent_zones: zoneCount,
        vdot: latestVdot,
        fatigue_level: latestFatigue,
        injuries: injuries.map((i) => ({ body_part: i.body_part, type: i.injury_type, severity: i.severity })),
        treatments: treatments.map((t) => ({ body_part: t.body_part, method: t.treatment_method, recovery_hours: t.recovery_period_hours })),
      };
    }).filter(Boolean);

    // 2. 构建系统提示词
    const systemPrompt = `你是一位资深运动训练计划制定专家，精通以下三大理论体系：

【丹尼尔斯跑步训练体系】
- E区（轻松跑）：59%-74% VO2max，65%-78%最大心率，用于有氧基础建设
- M区（马拉松配速）：75%-84% VO2max，配速适应训练
- T区（乳酸门槛）：86%-88% VO2max，88%-90%最大心率，提升乳酸清除能力
- I区（间歇）：接近VO2max和最大心率，提升最大摄氧量
- R区（重复）：无氧，提升速度和跑步经济性
- 80/20原则：80%训练量在E区，20%在T/I/R区
- 6秒法则：R配速+6秒=I配速，I配速+6秒=T配速（每400m）

【邦帕周期化训练理论】
- 基础期：大运动量低强度，建立有氧基础
- 强化期：逐渐增加强度，引入专项训练
- 赛前期：降低训练量，维持强度，精细化调整
- 比赛期：以赛代练，维持状态
- 过渡期：主动恢复，保持基本体能
- 3:1负荷节奏：3周加量+1周恢复
- 赛前减量：8-14天，训练量降低41%-60%

【运动心理学原则】
- 训练多样化保持运动员内在动机
- 合理的目标设置增强自我效能
- 适当的挑战性维持心流状态

【输出要求】
严格输出以下JSON格式，不要输出JSON之外的内容：
{
  "weekly_plan": [
    {
      "day": "周一",
      "date": "YYYY-MM-DD",
      "title": "训练名称",
      "zone": "E|M|T|I|R",
      "target_pace": "配速范围/km",
      "target_hr": "心率范围bpm",
      "distance": "距离km",
      "duration": "时长分钟",
      "content": "训练内容描述",
      "notes": "注意事项"
    }
  ],
  "load_analysis": {
    "total_weekly_distance": "总距离km",
    "zone_distribution": {"E": "百分比", "M": "...", "T": "...", "I": "...", "R": "..."},
    "intensity_balance": "强度平衡评估",
    "acwr_suggestion": "负荷建议",
    "notes": "总体评估"
  },
  "precautions": ["注意事项1", "注意事项2"],
  "theory_basis": {
    "daniels": "丹尼尔斯理论依据",
    "bompa": "邦帕理论依据"
  }
}

【制定原则】
- 每周最多6天训练，至少1天完全休息
- E区训练占比不低于60%
- 高强度训练（T/I/R）不连续安排，中间穿插E区或休息
- 有伤病的运动员避开伤处高冲击训练
- 有治疗记录的运动员避开治疗部位在恢复期内的高强度训练
- 输出严格JSON格式`;

    // 3. 构建用户提示词
    const athleteSummary = athleteData.map((a) => {
      let info = `【${a.name}】`;
      info += `\n近期训练区间分布：E${a.recent_zones.E}次 M${a.recent_zones.M}次 T${a.recent_zones.T}次 I${a.recent_zones.I}次 R${a.recent_zones.R}次`;
      if (a.vdot) info += `\nVDOT估算：${a.vdot}`;
      if (a.fatigue_level) info += `\n最近疲劳度：${a.fatigue_level}`;
      if (a.injuries.length > 0) info += `\n伤病：${a.injuries.map((i) => `${i.body_part}(${i.type || "未分类"},${i.severity || "未知"})`).join("、")}`;
      if (a.treatments.length > 0) info += `\n近期治疗：${a.treatments.map((t) => `${t.body_part}${t.method}，恢复期${t.recovery_hours || "未知"}小时`).join("；")}`;
      return info;
    }).join("\n\n");

    const today = new Date();
    const monday = new Date(today);
    const day = monday.getDay();
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));

    const userPrompt = `请为以下运动员制定一周训练计划：

【训练目标】${goal}
【当前阶段】${training_phase || "强化期"}
【距离目标赛事】${days_to_race ? days_to_race + "天" : "无近期赛事"}
${notes ? `【特殊注意事项】${notes}` : ""}

【本周起始日期】${monday.toISOString().split("T")[0]}

【运动员数据】
${athleteSummary}

请根据以上信息，结合丹尼尔斯、邦帕和运动心理学理论，生成一周7天的训练计划。`;

    // 4. 调用AI
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        max_tokens: 4096,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `AI服务错误: ${errText}` });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    console.log("[AI Plan] Raw response length:", text.length);
    console.log("[AI Plan] First 500 chars:", text.substring(0, 500));

    // 5. 解析JSON（多种方式尝试）
    let parsed = null;

    // 方式1：直接解析
    try { parsed = JSON.parse(text.trim()); } catch {}
    if (parsed) { console.log("[AI Plan] Parsed via direct JSON.parse"); }

    // 方式2：从markdown代码块提取
    if (!parsed) {
      const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (m) {
        try { parsed = JSON.parse(m[1].trim()); } catch (e) { console.log("[AI Plan] Code block parse failed:", e.message); }
        if (parsed) console.log("[AI Plan] Parsed via code block");
      }
    }

    // 方式3：提取第一个完整的JSON对象
    if (!parsed) {
      const m = text.match(/\{[\s\S]*\}/);
      if (m) {
        let d = 0, e = -1;
        for (let i = 0; i < m[0].length; i++) {
          if (m[0][i] === '{') d++;
          if (m[0][i] === '}') d--;
          if (d === 0) { e = i; break; }
        }
        if (e >= 0) {
          try { parsed = JSON.parse(m[0].substring(0, e + 1)); } catch (e2) { console.log("[AI Plan] Bracket match parse failed:", e2.message); }
          if (parsed) console.log("[AI Plan] Parsed via bracket matching");
        }
      }
    }

    // 方式4：清理常见问题后重试
    if (!parsed) {
      let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      // 去掉JSON前面的文字
      const jsonStart = cleaned.indexOf('{');
      if (jsonStart > 0) cleaned = cleaned.substring(jsonStart);
      // 去掉JSON后面的文字
      const lastBrace = cleaned.lastIndexOf('}');
      if (lastBrace >= 0) cleaned = cleaned.substring(0, lastBrace + 1);
      try { parsed = JSON.parse(cleaned); } catch (e3) { console.log("[AI Plan] Cleaned parse failed:", e3.message); }
      if (parsed) console.log("[AI Plan] Parsed via cleanup");
    }

    if (!parsed) {
      console.log("[AI Plan] ALL parse attempts failed. Raw text:", text.substring(0, 1000));
      return res.status(500).json({ error: "AI未返回有效结果，请重试", raw: text.substring(0, 500) });
    }

    res.json(parsed);
  } catch (err) {
    console.error("AI计划建议失败:", err);
    res.status(500).json({ error: "AI计划建议失败: " + err.message });
  }
});

export default router;
