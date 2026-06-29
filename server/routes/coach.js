import { Router } from "express";
import db from "../db/index.js";
import { authenticateToken, getTeamUserIds, isUserInTeam } from "../middleware/auth.js";

const router = Router();

// 主教练权限检查
function requireHeadCoach(req, res, next) {
  if (req.user.role === "head_coach") return next();
  return res.status(403).json({ error: "只有主教练可以执行此操作" });
}

// ============================================
// POST /api/coach/session-record — 训练课语音记录
// ============================================
router.post("/session-record", authenticateToken, requireHeadCoach, async (req, res) => {
  try {
    const API_BASE_URL = process.env.API_BASE_URL;
    const API_KEY = process.env.API_KEY;
    const MODEL_NAME = process.env.MODEL_NAME;

    if (!API_KEY || !API_BASE_URL) {
      return res.status(500).json({ error: "AI服务未配置" });
    }

    const { raw_voice_text, session_date, session_type } = req.body;

    if (!raw_voice_text) {
      return res.status(400).json({ error: "语音文本不能为空" });
    }

    // 构建 AI 解析提示词
    const systemPrompt = `你是一位运动训练数据分析师。请从教练的语音记录中提取训练课信息。

严格输出以下JSON格式，不要输出JSON之外的内容：
{
  "session_type": "训练类型（如：间歇训练、节奏跑、长距离等）",
  "session_summary": "训练课简要总结，30字以内",
  "athlete_records": [
    {
      "athlete_name": "运动员姓名",
      "performance": "具体表现（成绩、数据等）",
      "status": "状态评价（优秀/良好/一般/较差/不佳）",
      "notes": "特别说明（可选）"
    }
  ],
  "overall_evaluation": "整体训练效果评价",
  "training_arrangement": "后续训练安排意向",
  "key_observations": ["关键观察点1", "关键观察点2"]
}

注意：
- 从语音文本中识别所有提到的运动员姓名
- 提取每个人的具体成绩或表现数据
- 识别教练对每个人的评价
- 提取整体评价和后续安排意向
- 如果语音中没有提到某个字段，该字段填null`;

    const userPrompt = `原始语音文本：${raw_voice_text}
${session_date ? `\n训练日期：${session_date}` : ""}
${session_type ? `\n训练类型提示：${session_type}` : ""}`;

    // 调用 AI
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        max_tokens: 2048,
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

    // 解析 JSON
    let parsed = null;
    try { parsed = JSON.parse(text.trim()); } catch {}
    if (!parsed) {
      const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (m) try { parsed = JSON.parse(m[1].trim()); } catch {}
    }
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

    // 保存到数据库
    const record = db.coach_session_records.create({
      coach_id: req.user.id,
      session_date: session_date || new Date().toISOString().split("T")[0],
      raw_voice_text,
      parsed_data: JSON.stringify(parsed),
      session_type: parsed.session_type || session_type || null,
    });

    res.json({
      message: "训练课记录已保存",
      record_id: record.id,
      parsed,
    });
  } catch (err) {
    console.error("训练课记录失败:", err);
    res.status(500).json({ error: "处理失败: " + err.message });
  }
});

// ============================================
// GET /api/coach/session-records — 获取训练课记录列表
// ============================================
router.get("/session-records", authenticateToken, requireHeadCoach, (req, res) => {
  try {
    const { limit } = req.query;
    const limitNum = parseInt(limit) || 20;

    const teamUserIds = getTeamUserIds(req.user.team_id);
    const records = db.coach_session_records.query({
      where: teamUserIds ? { coach_id: { $in: teamUserIds } } : {},
      orderBy: ["created_at", "DESC"],
    }).slice(0, limitNum).map((r) => ({
      ...r,
      parsed_data: typeof r.parsed_data === "string" ? JSON.parse(r.parsed_data) : r.parsed_data,
    }));

    res.json({ records, total: records.length });
  } catch (err) {
    console.error("获取训练课记录失败:", err);
    res.status(500).json({ error: "获取记录失败" });
  }
});

// ============================================
// GET /api/coach/session-records/:id — 获取单条记录
// ============================================
router.get("/session-records/:id", authenticateToken, requireHeadCoach, (req, res) => {
  try {
    const record = db.coach_session_records.findById(parseInt(req.params.id));
    if (!record) return res.status(404).json({ error: "记录不存在" });

    if (!isUserInTeam(record.coach_id, req.user.team_id)) {
      return res.status(403).json({ error: "无权访问该训练记录" });
    }

    res.json({
      record: {
        ...record,
        parsed_data: typeof record.parsed_data === "string" ? JSON.parse(record.parsed_data) : record.parsed_data,
      },
    });
  } catch (err) {
    console.error("获取记录失败:", err);
    res.status(500).json({ error: "获取记录失败" });
  }
});

export default router;
