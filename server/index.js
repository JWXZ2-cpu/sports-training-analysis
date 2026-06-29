import "dotenv/config";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// 初始化数据库
import db from "./db/index.js";

// 路由
import authRoutes from "./routes/auth.js";
import sessionRoutes from "./routes/sessions.js";
import planRoutes from "./routes/plans.js";
import notificationRoutes from "./routes/notifications.js";
import athleteRoutes from "./routes/athlete.js";
import doctorRoutes from "./routes/doctor.js";
import assistantRoutes from "./routes/assistant.js";
import coachRoutes from "./routes/coach.js";
import managerRoutes from "./routes/manager.js";
import bindingRoutes from "./routes/athlete_bindings.js";
import teamRoutes from "./routes/teams.js";
import { authenticateToken } from "./middleware/auth.js";
import { notifyRiskAlert, notifyInjuryAlert } from "./services/notification.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, "../dist");

const app = express();
const PORT = process.env.PORT || 3001;

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;
const MODEL_NAME = process.env.MODEL_NAME;

if (!API_KEY || !API_BASE_URL) {
  console.warn("⚠️ 警告：未设置 API 环境变量，AI分析功能将不可用");
}

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// 静态文件
app.use("/uploads", express.static(join(__dirname, "../uploads")));

// API 路由
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/athlete", athleteRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/coach", coachRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/bindings", bindingRoutes);
app.use("/api/teams", teamRoutes);

// 健康检查
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!API_KEY,
    hasBaseUrl: !!API_BASE_URL,
    model: MODEL_NAME || "未配置",
    db: "JSON文件存储",
  });
});

// AI 分析接口
app.post("/api/analyze", authenticateToken, async (req, res) => {
  if (!API_KEY || !API_BASE_URL) {
    return res.status(500).json({ error: "服务器未配置 API 环境变量" });
  }

  const { system, user } = req.body;
  if (!system || !user) {
    return res.status(400).json({ error: "缺少 system 或 user 参数" });
  }

  try {
    const combinedContent = `${system}\n\n---\n\n${user}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 2 分钟超时

    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        max_tokens: 4096,
        messages: [{ role: "user", content: combinedContent }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseText = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({ error: `API 错误 (${response.status}): ${responseText}` });
    }

    const data = JSON.parse(responseText);
    const text = data.choices?.[0]?.message?.content || "";
    res.json({ content: [{ text }] });
  } catch (err) {
    if (err.name === "AbortError") {
      console.error("[AI] 请求超时 (120s)");
      return res.status(504).json({ error: "AI 分析超时，请稍后重试" });
    }
    console.error("[AI] 请求失败:", err.message);
    res.status(500).json({ error: `服务器错误: ${err.message}` });
  }
});

// 翻译接口
app.post("/api/translate", authenticateToken, async (req, res) => {
  if (!API_KEY || !API_BASE_URL) {
    return res.status(500).json({ error: "服务器未配置 API 环境变量" });
  }

  const { text, target_lang } = req.body;
  if (!text || !target_lang) {
    return res.status(400).json({ error: "缺少 text 或 target_lang 参数" });
  }

  const langNames = { en: "English", it: "Italiano", zh: "中文" };
  const targetName = langNames[target_lang] || target_lang;

  try {
    const prompt = `Translate the following Chinese text to ${targetName}. Keep the same meaning and tone. Only output the translated text, nothing else.

Text to translate:
${text}`;

    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({ error: `API 错误 (${response.status}): ${responseText}` });
    }

    const data = JSON.parse(responseText);
    const translatedText = data.choices?.[0]?.message?.content?.trim() || text;
    res.json({ translated_text: translatedText });
  } catch (err) {
    console.error("翻译失败:", err);
    res.status(500).json({ error: `翻译失败: ${err.message}` });
  }
});

// 保存AI报告接口
app.post("/api/reports", authenticateToken, (req, res) => {
  try {
    const { session_id, report } = req.body;

    if (!session_id || !report) {
      return res.status(400).json({ error: "缺少 session_id 或 report" });
    }

    const session = db.training_sessions.findById(session_id);
    if (!session) {
      return res.status(404).json({ error: "训练记录不存在" });
    }

    // 修正评分范围：统一为 1-10 分制
    let overallScore = report.overall_score;
    if (overallScore > 10) {
      // AI 用了 1-100 分制，转换为 1-10
      overallScore = Math.round((overallScore / 10) * 10) / 10;
      console.log(`[Score Fix] AI 返回 ${report.overall_score}，已转换为 ${overallScore}`);
    }

    const saved = db.ai_reports.create({
      session_id,
      athlete_id: session.athlete_id,
      overall_score: overallScore,
      status_level: report.status_level,
      emotion_json: JSON.stringify(report.emotion || {}),
      fatigue_json: JSON.stringify(report.fatigue || {}),
      difficulty_points: JSON.stringify(report.difficulty_points || []),
      training_zone: report.training_zone,
      zone_distribution_json: JSON.stringify(report.zone_distribution || {}),
      vdot_estimate: report.vdot_estimate,
      training_quality: report.training_quality,
      intensity_feedback: report.intensity_feedback,
      periodization_analysis: report.periodization_analysis,
      load_management_json: JSON.stringify(report.load_management || {}),
      recovery_status: report.recovery_status,
      phase_alignment: report.phase_alignment,
      treatment_coordination: report.treatment_schedule_coordination,
      body_region_conflict: report.body_region_conflict_check,
      coordination_suggestion: report.coordination_suggestion,
      diary_text: report.diary_text,
      coach_summary: report.coach_summary,
      recommendations: JSON.stringify(report.recommendations || []),
      daniels_recommendation: report.daniels_recommendation,
      periodization_recommendation: report.periodization_recommendation,
      risk_flag: report.risk_flag ? 1 : 0,
      risk_reason: report.risk_reason,
      data_consistency_json: JSON.stringify(report.data_consistency || { is_consistent: true, inconsistencies: [] }),
      raw_ai_response: JSON.stringify(report),
    });

    // 通知：AI报告预警
    if (report.risk_flag) {
      const athlete = db.users.findById(session.athlete_id);
      if (athlete) {
        notifyRiskAlert(athlete.display_name, session.athlete_id, report.risk_reason || "需关注");
        // 如果涉及伤病，通知队医
        if (report.risk_reason && /伤|痛|疼|不适/.test(report.risk_reason)) {
          notifyInjuryAlert(athlete.display_name, session.athlete_id, report.risk_reason);
        }
      }
    }

    res.json({ message: "报告已保存", report_id: saved.id });
  } catch (err) {
    console.error("保存报告失败:", err);
    res.status(500).json({ error: "保存报告失败" });
  }
});

// ASR 语音识别接口
app.post("/api/asr", authenticateToken, async (req, res) => {
  const MIMO_API_KEY = process.env.MIMO_API_KEY || process.env.API_KEY;
  const MIMO_ASR_URL = `${process.env.API_BASE_URL || "https://token-plan-cn.xiaomimimo.com/v1"}/chat/completions`;

  if (!MIMO_API_KEY) {
    return res.status(500).json({ error: "服务器未配置 MIMO_API_KEY" });
  }

  const { audioBase64, mimeType, language } = req.body;

  if (!audioBase64) {
    return res.status(400).json({ error: "缺少 audioBase64 参数" });
  }

  try {
    const response = await fetch(MIMO_ASR_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MIMO_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mimo-v2.5-asr",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "input_audio",
                input_audio: {
                  data: `data:${mimeType || "audio/mpeg"};base64,${audioBase64}`,
                },
              },
            ],
          },
        ],
        asr_options: {
          language: language || "auto",
        },
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error("[ASR] API error:", response.status, responseText);
      return res.status(response.status).json({ error: `ASR 服务错误 (${response.status})` });
    }

    const data = JSON.parse(responseText);
    const text = data.choices?.[0]?.message?.content || "";

    res.json({ text: text.trim() });
  } catch (err) {
    console.error("[ASR] 请求失败:", err);
    res.status(500).json({ error: `语音识别失败: ${err.message}` });
  }
});

// 托管前端构建产物
app.use(express.static(distPath));

// API 404 兜底（必须在 SPA 之前）
app.use("/api", (req, res) => {
  res.status(404).json({ error: `接口不存在: ${req.method} ${req.path}` });
});

// SPA 兜底（只处理非 API 请求）
app.get("/{*splat}", (req, res) => {
  res.sendFile(join(__dirname, "../dist/index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ 服务运行在 http://0.0.0.0:${PORT}`);
  console.log(`API 地址: ${API_BASE_URL || "未配置"}`);
  console.log(`模型: ${MODEL_NAME || "未配置"}`);
  console.log(`数据库: JSON文件存储 (data/)`);
});
