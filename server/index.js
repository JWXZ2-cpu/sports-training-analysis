import "dotenv/config";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, "../dist");
console.log("静态文件目录:", distPath);

const app = express();
const PORT = process.env.PORT || 3001;

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;
const MODEL_NAME = process.env.MODEL_NAME;

if (!API_KEY) {
  console.error("错误：未设置 API_KEY，请在 .env 文件中配置");
  process.exit(1);
}

if (!API_BASE_URL) {
  console.error("错误：未设置 API_BASE_URL，请在 .env 文件中配置");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// 托管前端构建产物
app.use(express.static(distPath));

app.post("/api/analyze", async (req, res) => {
  const { system, user } = req.body;

  if (!system || !user) {
    return res.status(400).json({ error: "缺少 system 或 user 参数" });
  }

  try {
    // 将 system prompt 合并到 user 消息中（部分模型不支持 system 角色）
    const combinedContent = `${system}\n\n---\n\n${user}`;

    const requestBody = {
      model: MODEL_NAME,
      max_tokens: 4096,
      messages: [
        { role: "user", content: combinedContent },
      ],
    };

    console.log("发送请求:", JSON.stringify({ ...requestBody, messages: [{ role: "user", content: "(已省略)" }] }));

    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log("API 响应:", responseText.substring(0, 500));

    if (!response.ok) {
      return res.status(response.status).json({
        error: `API 错误 (${response.status}): ${responseText}`,
      });
    }

    const data = JSON.parse(responseText);

    // 转换为前端期望的格式：从 OpenAI 格式提取 content 文本
    const text = data.choices?.[0]?.message?.content || "";
    console.log("AI 返回文本:", text.substring(0, 200));
    // 模拟 Anthropic 格式的 content 数组，保持前端解析逻辑不变
    res.json({ content: [{ text }] });
  } catch (err) {
    res.status(500).json({ error: `服务器错误: ${err.message}` });
  }
});

// SPA 兜底：非 API 路由返回 index.html
app.get("/{*splat}", (req, res) => {
  res.sendFile(join(__dirname, "../dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`后端服务运行在 http://localhost:${PORT}`);
  console.log(`API 地址: ${API_BASE_URL}`);
  console.log(`模型: ${MODEL_NAME}`);
});
