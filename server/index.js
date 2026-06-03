import "dotenv/config";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, "../dist");

const app = express();
const PORT = process.env.PORT || 3001;

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;
const MODEL_NAME = process.env.MODEL_NAME;

// 检查配置（不崩溃，只警告）
if (!API_KEY || !API_BASE_URL) {
  console.warn("⚠️ 警告：未设置 API 环境变量，API 功能将不可用");
  console.warn("请在 Railway Variables 或 .env 中设置：API_BASE_URL, API_KEY, MODEL_NAME");
}

app.use(cors());
app.use(express.json());

// 根路由直接返回首页
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "../dist/index.html"));
});

// 托管前端构建产物
app.use(express.static(distPath));

// 健康检查
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!API_KEY,
    hasBaseUrl: !!API_BASE_URL,
    model: MODEL_NAME || "未配置",
  });
});

app.post("/api/analyze", async (req, res) => {
  if (!API_KEY || !API_BASE_URL) {
    return res.status(500).json({
      error: "服务器未配置 API 环境变量，请在 Railway Variables 中设置 API_BASE_URL、API_KEY、MODEL_NAME",
    });
  }

  const { system, user } = req.body;

  if (!system || !user) {
    return res.status(400).json({ error: "缺少 system 或 user 参数" });
  }

  try {
    const combinedContent = `${system}\n\n---\n\n${user}`;

    const requestBody = {
      model: MODEL_NAME,
      max_tokens: 4096,
      messages: [{ role: "user", content: combinedContent }],
    };

    console.log("发送请求到:", `${API_BASE_URL}/chat/completions`);

    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: `API 错误 (${response.status}): ${responseText}`,
      });
    }

    const data = JSON.parse(responseText);
    const text = data.choices?.[0]?.message?.content || "";
    res.json({ content: [{ text }] });
  } catch (err) {
    res.status(500).json({ error: `服务器错误: ${err.message}` });
  }
});

// SPA 兜底
app.get("/{*splat}", (req, res) => {
  res.sendFile(join(__dirname, "../dist/index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ 服务运行在 http://0.0.0.0:${PORT}`);
  console.log(`API 地址: ${API_BASE_URL || "未配置"}`);
  console.log(`模型: ${MODEL_NAME || "未配置"}`);
});
