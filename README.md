# 🏋️ 训练分析系统 | Sports Training Analysis

一个基于 AI 的运动训练数据分析工具，运动员通过语音或文字描述训练感受，系统自动生成结构化的训练分析报告，帮助教练快速了解运动员状态并做出决策。

🔗 **在线体验**: https://sports-training-analysis-production-81ef.up.railway.app/

---

## ✨ 功能特性

| 功能 | 说明 |
|------|------|
| 🎤 语音输入 | 运动员通过麦克风描述训练感受，自动转写为文字 |
| 📝 数据确认 | 确认/编辑转录内容，填写评分和标签 |
| 🤖 AI 分析 | 调用大模型 API 生成结构化训练报告 |
| 📊 可视化报告 | 卡片式展示情绪、疲劳度、训练难点、建议等 |
| 🌐 多语言支持 | 支持中文、英文、意大利语 |
| ⚠️ 风险预警 | 自动识别需要教练立即关注的异常情况 |

---

## 🖼️ 使用流程

```
步骤 1：语音输入          步骤 2：数据确认          步骤 3：分析结果
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │ 姓名：张明远     │     │ 🟢 优秀  综合 8 │
│    🎤 录音按钮   │ ──▶ │ 身体评分：7     │ ──▶ │ 情绪：积极       │
│                 │     │ 心理评分：8     │     │ 疲劳：中（膝盖） │
│  或手动输入文本  │     │ 语音转录：...    │     │ 训练日记：...    │
│                 │     │                 │     │ 教练简报：...    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 🛠️ 技术栈

- **前端**: React 19 + Vite 6
- **后端**: Express 5 (API 代理)
- **AI 模型**: 小米 MIMO-v2.5
- **语音识别**: Web Speech API (浏览器原生)
- **部署**: Railway

---

## 📁 项目结构

```
├── server/
│   └── index.js              # Express 后端，API 代理
├── src/
│   ├── App.jsx               # 主应用（三步骤流程控制）
│   ├── main.jsx              # 入口文件
│   ├── components/
│   │   ├── MicButton.jsx     # 录音按钮组件
│   │   ├── Badge.jsx         # 标签徽章组件
│   │   ├── ResultView.jsx    # 结果卡片组件
│   │   └── ScoreBar.jsx      # 评分进度条组件
│   ├── pages/
│   │   ├── VoiceInput.jsx    # 语音输入页
│   │   ├── DataConfirm.jsx   # 数据确认页
│   │   └── ResultPage.jsx    # 分析结果页
│   └── locales/
│       ├── index.jsx         # i18n 上下文
│       ├── zh.js             # 中文语言包
│       ├── en.js             # 英文语言包
│       └── it.js             # 意大利语语言包
├── .env                      # API 配置（不提交到 Git）
├── index.html                # HTML 入口
├── vite.config.js            # Vite 配置
└── package.json
```

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/JWXZ2-cpu/sports-training-analysis.git
cd sports-training-analysis
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 API Key

在项目根目录创建 `.env` 文件：

```env
API_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1
API_KEY=你的API密钥
MODEL_NAME=mimo-v2.5
```

> 💡 API Key 从小米 AI 开放平台获取：https://xiaoai.mi.com/

### 4. 启动项目

**方式一：同时启动前后端（推荐）**

```bash
npm run dev:all
```

**方式二：分别启动（需要两个终端）**

```bash
# 终端 1 - 后端
npm run dev:server

# 终端 2 - 前端
npm run dev
```

### 5. 访问应用

打开浏览器访问 **http://localhost:5173**

---

## 🌐 部署到 Railway

### 方式一：从 GitHub 部署

1. Fork 本仓库
2. 登录 [Railway](https://railway.app/)
3. 点击 **New Project** → **Deploy from GitHub**
4. 选择你 Fork 的仓库
5. 在 **Variables** 中添加环境变量：
   - `API_BASE_URL`
   - `API_KEY`
   - `MODEL_NAME`
6. Railway 会自动构建和部署

### 方式二：使用 Railway CLI

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 初始化项目
railway init

# 添加环境变量
railway variables set API_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1
railway variables set API_KEY=你的API密钥
railway variables set MODEL_NAME=mimo-v2.5

# 部署
railway up
```

---

## 📊 AI 输出结构

系统会返回以下 JSON 结构的分析报告：

```json
{
  "overall_score": 8,
  "status_level": "优秀",
  "emotion": {
    "polarity": "积极",
    "confidence": 0.85,
    "signals": ["自信", "满足"]
  },
  "fatigue": {
    "level": "中",
    "body_parts": ["膝盖"],
    "evidence": "膝盖有点酸"
  },
  "difficulty_points": ["加速跑节奏", "最后两组掉速"],
  "diary_text": "今天的速度耐力课整体感觉不错...",
  "coach_summary": "运动员身体状态良好，心理积极，膝盖轻微不适...",
  "recommendations": ["适当降低跑量", "加强膝盖热身", "节奏跑专项训练"],
  "risk_flag": false,
  "risk_reason": null
}
```

| 字段 | 说明 |
|------|------|
| `overall_score` | 综合评分 1-10 |
| `status_level` | 状态等级：优秀 / 正常 / 关注 / 预警 |
| `emotion` | 情绪分析（极性、置信度、信号词） |
| `fatigue` | 疲劳评估（程度、身体部位、原文证据） |
| `difficulty_points` | 运动员反馈的训练难点 |
| `diary_text` | AI 生成的训练日记 |
| `coach_summary` | 给教练的简报 |
| `recommendations` | 明日训练建议 |
| `risk_flag` | 是否需要教练立即关注 |
| `risk_reason` | 风险原因 |

---

## 🌍 多语言支持

系统支持三种语言，点击右上角按钮切换：

| 语言 | 说明 |
|------|------|
| 🇨🇳 中文 | 默认语言 |
| 🇬🇧 English | 英文界面 + 英文 AI 输出 |
| 🇮🇹 Italiano | 意大利语界面 + 意大利语 AI 输出 |

---

## 🔧 常见问题

### 语音识别不工作？

- 推荐使用 **Chrome** 或 **Edge** 浏览器
- 确保使用 **HTTPS** 访问（localhost 除外）
- 检查麦克风权限是否已授权
- 页面底部有调试信息面板，可查看详细状态

### API 返回 401 错误？

- 检查 `.env` 文件中的 API Key 是否正确
- 确认 API Key 是否已过期
- 重启后端服务器使配置生效

### 如何更换 AI 模型？

修改 `.env` 文件中的配置，支持任何兼容 OpenAI API 格式的服务：

```env
API_BASE_URL=https://你的API地址/v1
API_KEY=你的API密钥
MODEL_NAME=模型名称
```

---

## 📄 开源协议

MIT License

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
