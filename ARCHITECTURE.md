# 训练分析系统 — 项目架构文档

## 一、项目简介

本系统是一套面向专业运动队的**AI 驱动多角色训练分析平台**，覆盖运动员、主教练、助教、队医、管理人员五大角色。系统以"语音输入 → AI 分析 → 角色化分发"为核心数据流，整合丹尼尔斯跑步训练法、邦帕周期化训练理论和运动心理学三大理论框架，为教练团队提供科学的训练决策支持。

系统支持中/英/意三语切换，采用移动端优先的暗色主题设计（430px 响应式），适配外教和国际运动员的使用场景。

---

## 二、技术栈

| 层级 | 技术 | 版本 |
|---|---|---|
| **前端框架** | React | 19.1 |
| **构建工具** | Vite | 6.3 |
| **路由** | React Router DOM | 7.17 |
| **图表** | Recharts | — |
| **后端框架** | Express | 5.1 |
| **数据库** | 自研 JsonDB（JSON 文件存储） | — |
| **认证** | JWT（jsonwebtoken + bcryptjs） | — |
| **AI 接口** | OpenAI 兼容 API（可配置） | — |
| **语音识别** | MIMO ASR（mimo-v2.5-asr） | — |
| **FIT 解析** | fit-file-parser | — |
| **文件上传** | Multer | — |
| **国际化** | 自研 Context + locale 文件 | — |

---

## 三、系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        浏览器 (Mobile-First)                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  React 19 SPA (Vite)                                        │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │ 运动员端  │  │ 主教练端  │  │  助教端   │  │  队医端   │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │ │
│  │  │ 管理端   │  │  登录页   │  │ 共享组件  │                  │ │
│  │  └──────────┘  └──────────┘  └──────────┘                  │ │
│  │                                                             │ │
│  │  AuthContext  │  LanguageProvider (zh/en/it)                │ │
│  │  Service Layer (12 service modules)                         │ │
│  │  Utils: mimoAsr · translateCache                            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │ /api/*                             │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Express 5 Server (port 3001)                               │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │ │
│  │  │ 9 Route  │  │ JWT+RBAC │  │ Services │                  │ │
│  │  │ Modules  │  │ Middleware│  │ fit-parse│                  │ │
│  │  └──────────┘  └──────────┘  │ notify   │                  │ │
│  │                              └──────────┘                  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  JsonDB (15 tables, JSON files in data/)             │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  外部服务                                                    │ │
│  │  • LLM API (OpenAI 兼容)  • MIMO ASR  • 翻译 API            │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 四、目录结构

```
体育产品/
├── index.html                    # SPA 入口
├── package.json                  # 依赖与脚本
├── vite.config.js                # Vite 配置 (proxy /api → 3001)
├── .env.example                  # 环境变量模板
│
├── server/                       # 后端
│   ├── index.js                  # Express 入口，内联路由 (/analyze, /translate, /reports, /asr)
│   ├── db/
│   │   ├── index.js              # JsonDB 引擎 + 15 张表初始化
│   │   ├── bindings.js           # 运动员-工作人员绑定关系 DAL
│   │   └── schema.sql            # 参考 SQL Schema（仅文档）
│   ├── middleware/
│   │   ├── auth.js               # JWT 认证 + RBAC 权限中间件
│   │   └── upload.js             # Multer 文件上传配置
│   ├── routes/
│   │   ├── auth.js               # 登录/注册/用户管理
│   │   ├── sessions.js           # 训练课记录 CRUD
│   │   ├── plans.js              # 训练计划 CRUD + AI 计划生成
│   │   ├── notifications.js      # 通知系统
│   │   ├── athlete.js            # 运动员专属路由
│   │   ├── doctor.js             # 队医路由（伤病/治疗/冲突检查）
│   │   ├── assistant.js          # 助教路由（训练备注）
│   │   ├── coach.js              # 主教练路由（语音录入）
│   │   ├── manager.js            # 管理端路由（考勤/总览）
│   │   └── athlete_bindings.js   # 绑定关系 CRUD
│   └── services/
│       ├── fit-parser.js         # FIT 文件解析（Garmin/运动手表）
│       └── notification.js       # 通知服务（单播/组播/绑定通知）
│
├── src/                          # 前端
│   ├── main.jsx                  # React 入口
│   ├── App.jsx                   # 路由 + 角色守卫
│   ├── contexts/
│   │   └── AuthContext.jsx       # 认证状态管理
│   ├── locales/
│   │   ├── index.jsx             # LanguageProvider + useI18n hook
│   │   ├── zh.js                 # 中文语言包
│   │   ├── en.js                 # 英文语言包
│   │   └── it.js                 # 意大利语语言包
│   ├── services/
│   │   ├── api.js                # HTTP 客户端（自动注入 Token）
│   │   └── index.js              # 12 个 service barrel export
│   ├── utils/
│   │   ├── mimoAsr.js            # 浏览器端录音 + ASR
│   │   └── translateCache.js     # 翻译缓存（localStorage, 7天TTL）
│   ├── styles/
│   │   ├── variables.css         # CSS 变量（暗色主题）
│   │   ├── global.css            # 全局样式 + 组件类
│   │   ├── sharedStyles.js       # JS 内联样式对象
│   │   ├── auth-pages.css        # 登录页样式
│   │   ├── coach-pages.css       # 教练端样式
│   │   ├── assistant-pages.css   # 助教端样式
│   │   ├── doctor-pages.css      # 队医端样式
│   │   └── manager-pages.css     # 管理端样式
│   ├── pages/                    # 28 个页面组件
│   │   ├── Login.jsx
│   │   ├── AthleteHome.jsx       # 运动员首页（4 Tab）
│   │   ├── AthleteDiary.jsx      # 训练日记
│   │   ├── AthleteReport.jsx     # 单次报告
│   │   ├── AthleteSummary.jsx    # 数据汇总
│   │   ├── AthleteNotification.jsx
│   │   ├── MyProfile.jsx
│   │   ├── CoachHome.jsx         # 主教练首页（4 Tab）
│   │   ├── CoachAISuggestion.jsx # AI 辅助计划
│   │   ├── CoachPlanManagement.jsx
│   │   ├── CoachSessionRecord.jsx
│   │   ├── CoachNotification.jsx
│   │   ├── AssistantHome.jsx     # 助教首页（3 Tab）
│   │   ├── AssistantProfile.jsx
│   │   ├── AssistantProfileSheet.jsx
│   │   ├── AthleteDetailSheet.jsx
│   │   ├── ReportDetailSheet.jsx
│   │   ├── DoctorHome.jsx        # 队医首页
│   │   ├── DoctorAthleteDetail.jsx
│   │   ├── DoctorConflictCheck.jsx
│   │   ├── ManagerHome.jsx       # 管理端首页
│   │   ├── ManagerAttendance.jsx
│   │   ├── ManagerProfile.jsx
│   │   ├── VoiceInput.jsx        # 通用语音输入
│   │   ├── DataConfirm.jsx       # 数据确认
│   │   └── ResultPage.jsx        # 结果展示
│   └── components/               # 17 个共享组件
│       ├── CoachNav.jsx          # 教练底栏导航
│       ├── BottomNav.jsx         # 运动员底栏导航
│       ├── ResultView.jsx        # AI 报告展示（教练视角）
│       ├── AthleteResultView.jsx # AI 报告展示（运动员视角）
│       ├── FitDataCard.jsx       # 运动手表数据卡片
│       ├── NotificationBell.jsx  # 通知铃铛
│       ├── ProfileSheet.jsx      # 个人资料弹窗
│       ├── TranslateButton.jsx   # 翻译按钮
│       ├── LanguageSwitch.jsx    # 语言切换
│       ├── MicButton.jsx         # 录音按钮
│       ├── VoiceInput.jsx        # 语音输入组件
│       ├── Badge.jsx             # 标签
│       ├── ScoreBar.jsx          # 分数条
│       ├── ErrorBoundary.jsx     # 错误边界
│       ├── ErrorState.jsx        # 错误状态
│       ├── LoadingState.jsx      # 加载状态
│       └── ProtectedRoute.jsx    # 路由守卫
│
├── llmProxyMiddleWare/           # 独立工具（非主应用）
│   └── image_preprocessor.py     # VLM 图片预处理代理
│
├── design_spec.md                # 视觉设计规范
├── data_flow_design.md           # 数据流设计
├── role_permission_design.md     # 角色权限设计
├── sports_psychology_knowledge_part1.md  # 运动心理学知识库（上）
└── sports_psychology_knowledge_part2.md  # 运动心理学知识库（下）
```

---

## 五、数据库设计

系统使用自研 JsonDB 引擎，每张表对应一个 JSON 文件，支持 CRUD、条件查询（`$eq`/`$ne`/`$gte`/`$like`/`$in`）、排序、分页和文件级写锁。

### 15 张数据表

| 表名 | 说明 | 关键字段 |
|---|---|---|
| `users` | 用户账号 | username, password_hash, role, display_name |
| `athlete_profiles` | 运动员档案 | sport, vdot, max_hr, resting_hr, threshold_pace |
| `training_sessions` | 训练课记录 | athlete_id, body_score, mind_score, transcript, fit_data |
| `ai_reports` | AI 分析报告 | session_id, overall_score, status_level, emotion, fatigue, zone |
| `training_plans` | 训练计划 | plan_date, plan_type, training_zone, intensity_level, target_athletes |
| `coach_session_records` | 教练语音记录 | raw_voice_text, parsed_data, session_type |
| `training_notes` | 训练备注 | athlete_id, author_id, note_type, content |
| `injury_records` | 伤病记录 | athlete_id, body_part, injury_type, severity, diagnosis |
| `treatment_records` | 治疗记录 | athlete_id, injury_id, method, body_part |
| `treatment_plans` | 治疗计划 | athlete_id, treatment_date, method, recovery_days |
| `body_composition` | 体测数据 | athlete_id, weight, body_fat, vo2max |
| `nutrition_plans` | 营养计划 | athlete_id, daily_calories, macros |
| `supplement_records` | 补剂记录 | athlete_id, supplement_type, dosage |
| `notifications` | 通知 | type, title, content, recipient_ids, read_by |
| `athlete_bindings` | 绑定关系 | athlete_id, coach_id, assistant_id, doctor_id |

---

## 六、认证与权限

### JWT 认证流程

```
用户登录 → 服务端验证密码 → 签发 JWT (24h) → 客户端存入 localStorage
     ↓
后续请求 → Authorization: Bearer <token> → 中间件验证 → 注入 req.user
```

### 角色权限矩阵

| 功能 | 运动员 | 主教练 | 助教 | 队医 | 管理 |
|---|:---:|:---:|:---:|:---:|:---:|
| 查看自己的训练记录 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 查看他人的训练记录 | ❌ | ✅ | ✅ | ✅ | ✅ |
| 提交训练反馈（语音/文字） | ✅ | ❌ | ❌ | ❌ | ❌ |
| 创建/编辑/删除训练计划 | ❌ | ✅ | ❌ | ❌ | ❌ |
| 审批训练计划 | ❌ | ✅ | ❌ | ❌ | ❌ |
| AI 辅助生成计划 | ❌ | ✅ | ❌ | ❌ | ❌ |
| 语音录入训练课 | ❌ | ✅ | ❌ | ❌ | ❌ |
| 添加训练备注 | ❌ | ✅ | ✅ | ❌ | ❌ |
| 录入伤病/治疗记录 | ❌ | ❌ | ❌ | ✅ | ❌ |
| 上传医疗文档 | ❌ | ❌ | ❌ | ✅ | ❌ |
| 治疗-训练冲突检查 | ❌ | ✅ | ❌ | ✅ | ❌ |
| 查看考勤数据 | ❌ | ❌ | ❌ | ❌ | ✅ |
| 绑定管理 | ❌ | ✅ | ❌ | ❌ | ❌ |
| 查看 AI 专业报告 | 简化版 | 完整版 | 完整版 | 完整版 | ❌ |

---

## 七、AI 集成架构

### 7.1 三大 AI 应用场景

#### A) 训练分析（运动员提交 → AI 生成报告）

```
运动员语音/文字输入
       ↓
客户端: 组装 systemPrompt + userTemplate (含训练数据)
       ↓
POST /api/analyze → LLM API → 结构化 JSON
       ↓
POST /api/reports → 分数归一化(1-100→1-10) + 风险标记 → 存入 ai_reports
       ↓
双视角输出:
  ├─ 运动员视角: summary, training_log, highlights, encouragement, care_message
  └─ 教练视角: detailed_analysis, zone_assessment, psychology_analysis, risk_assessment
```

#### B) AI 计划生成（主教练发起）

```
主教练选择: 训练目标 + 周期阶段 + 适用运动员
       ↓
POST /api/plans/ai-plan-suggestion
       ↓
服务端: 收集每位运动员近 7 次训练数据 + VDOT + 伤病情况
       ↓
组装 Daniels + Bompa + 运动心理学理论 prompt → LLM API
       ↓
输出: 周计划 (每日训练 + 强度区间 + 配速 + 心率) + 负荷分析 + 注意事项
```

#### C) 语音文本解析（教练/队医）

```
语音录入 → MIMO ASR (mimo-v2.5-asr) → 文字转录
       ↓
POST /api/coach/session-record 或 /api/doctor/parse-voice
       ↓
LLM 解析为结构化 JSON (训练类型/运动员记录 或 伤病/治疗数据)
```

### 7.2 理论框架整合

AI 分析 prompt 内嵌三大经典理论：

| 理论 | 来源 | 应用层面 |
|---|---|---|
| **丹尼尔斯跑步训练法** | Jack Daniels | 微观：配速、心率、5 区训练、VDOT |
| **邦帕周期化训练理论** | Tudor O. Bompa | 宏观：周期、负荷、恢复、赛前减量 |
| **运动心理学** | Arnold LeUnes | 心理：情绪、动机、自信、焦虑、倦怠 |

### 7.3 翻译机制

系统采用两层翻译策略：

1. **静态 UI 翻译**：`locales/{zh,en,it}.js` + `useI18n()` hook
2. **动态内容翻译**：`POST /api/translate` → AI 翻译 → 客户端 localStorage 缓存（7 天 TTL）

---

## 八、核心业务逻辑

### 8.1 治疗-训练冲突检查

系统最复杂的算法（`GET /api/doctor/conflict-check`）：

```
1. 获取今日治疗记录 + 明日训练计划
2. 建立"身体部位 → 训练区域"映射表
   例: 膝盖 → [腿部, 下肢, 跑步, 深蹲, 跳跃]
3. 对每位运动员:
   检查治疗部位是否与训练区域重叠
   + 恢复期是否延伸至明日
4. 冲突分级:
   - no_conflict: 无重叠
   - minor_conflict: 部分重叠但恢复期短
   - major_conflict: 高风险重叠 → 自动生成高优先级通知
```

### 8.2 通知触发机制

| 事件 | 通知对象 |
|---|---|
| 运动员提交训练反馈 | 绑定的主教练、助教、队医 |
| AI 检测到风险 | 主教练、助教、运动员 |
| 伤病预警 | 队医 |
| 治疗计划提交 | 主教练、助教 |
| 助教提交训练备注 | 主教练 |
| 治疗-训练冲突 | 主教练、助教 |
| 计划待审批 | 主教练 |
| 体测数据异常 | 主教练、队医 |

### 8.3 伤病预警多因素分析

`GET /api/doctor/injury-alerts` 综合以下因素：

- AI 报告中的风险标记 (`risk_flag`)
- 连续 3 天以上高疲劳
- 近期报告中反复出现的部位疼痛
- 未康复的伤病记录

---

## 九、国际化架构

### 9.1 实现机制

```
LanguageProvider (React Context)
  ├─ lang: "zh" | "en" | "it"  (存入 localStorage)
  ├─ t: 当前语言的完整 locale 对象
  ├─ setLang(lang): 切换语言
  └─ toggleLang(): 循环切换 zh → en → it

组件层:
  const { lang, t } = useI18n();
  const coachT = t.coach || {};
  // 使用: coachT.key || "中文回退"
```

### 9.2 语言包结构

每个 locale 文件包含：
- 顶层 key：UI 文本、字段标签、枚举映射
- `coach` 子对象：主教练端 ~150 key
- `assistant` 子对象：助教端 ~60 key
- `auth` 子对象：登录页 ~30 key
- 共享 key：`loading`、`unknown`、`error.*`、`time.*`

### 9.3 动态内容翻译

AI 报告、通知正文等动态内容通过 `translateService` API 翻译，结果缓存在 localStorage（7 天过期）。

---

## 十、API 端点总览

### 认证 `/api/auth`

| Method | Path | 说明 |
|---|---|---|
| POST | `/register` | 注册 |
| POST | `/login` | 登录 |
| GET | `/me` | 当前用户信息 |
| PUT | `/profile` | 更新个人资料 |
| GET | `/users` | 用户列表 |
| GET | `/athletes` | 运动员列表 |

### 训练 `/api/sessions`

| Method | Path | 说明 |
|---|---|---|
| GET | `/` | 训练记录列表 |
| GET | `/overview/team` | 团队总览 |
| GET | `/:id` | 训练详情 |
| POST | `/` | 创建训练记录 |

### 计划 `/api/plans`

| Method | Path | 说明 |
|---|---|---|
| GET | `/` | 计划列表 |
| GET | `/today` | 今日计划 |
| POST | `/` | 创建计划 |
| PUT | `/:id` | 更新计划 |
| DELETE | `/:id` | 删除计划 |
| POST | `/:id/approve` | 审批计划 |
| POST | `/ai-plan-suggestion` | AI 生成计划 |

### 通知 `/api/notifications`

| Method | Path | 说明 |
|---|---|---|
| GET | `/` | 通知列表 |
| GET | `/unread-count` | 未读数 |
| PUT | `/:id/read` | 标记已读 |
| PUT | `/read-all` | 全部已读 |

### 运动员 `/api/athlete`

| Method | Path | 说明 |
|---|---|---|
| GET | `/my-plan/this-week` | 本周计划 |
| GET | `/my-reports` | 历史报告 |
| GET | `/my-reports/:id` | 报告详情 |
| GET | `/summary` | 数据汇总 |
| POST | `/upload-fit` | 上传 FIT 文件 |

### 队医 `/api/doctor`

| Method | Path | 说明 |
|---|---|---|
| POST | `/treatment` | 录入治疗 |
| POST | `/parse-voice` | 语音解析 |
| GET | `/treatments` | 治疗记录 |
| POST | `/injury` | 录入伤病 |
| GET | `/injuries` | 伤病记录 |
| GET | `/injury-alerts` | 伤病预警 |
| GET | `/athlete/:id/health` | 运动员健康数据 |
| POST | `/upload-check` | 上传检查报告 |
| GET | `/conflict-check` | 冲突检查 |
| GET | `/tomorrow-plans` | 明日计划 |
| GET | `/today-treatments` | 今日治疗 |

### 助教 `/api/assistant`

| Method | Path | 说明 |
|---|---|---|
| POST | `/notes` | 提交备注 |
| GET | `/notes` | 我的备注 |
| GET | `/coach/notes` | 全部备注（主教练） |

### 教练 `/api/coach`

| Method | Path | 说明 |
|---|---|---|
| POST | `/session-record` | 语音录入训练课 |
| GET | `/session-records` | 训练课记录 |

### 管理 `/api/manager`

| Method | Path | 说明 |
|---|---|---|
| GET | `/dashboard` | 管理仪表盘 |
| GET | `/attendance` | 考勤统计 |
| GET | `/team-status` | 团队状态 |

### 绑定 `/api/bindings`

| Method | Path | 说明 |
|---|---|---|
| GET | `/` | 全部绑定关系 |
| POST | `/` | 创建绑定 |
| PUT | `/:athleteId` | 更新绑定 |
| DELETE | `/:athleteId` | 删除绑定 |

### 内联路由 `/api/*`

| Method | Path | 说明 |
|---|---|---|
| GET | `/health` | 健康检查 |
| POST | `/analyze` | AI 训练分析 |
| POST | `/translate` | AI 翻译 |
| POST | `/reports` | 保存报告 |
| POST | `/asr` | 语音识别 |

---

## 十一、前端路由表

```
/login                              → 登录页（全角色）
/                                   → 根据角色自动跳转

/athlete                            → 运动员首页
/athlete/report/:id                 → 训练报告
/athlete/diary                      → 训练日记
/athlete/summary                    → 数据汇总
/athlete/profile                    → 个人资料
/athlete/notify                     → 通知中心

/coach                              → 主教练首页（4 Tab）
/coach/ai-suggestion                → AI 辅助计划

/assistant                          → 助教首页（3 Tab）
/assistant/profile                  → 个人资料

/doctor                             → 队医首页
/doctor/athlete/:id                 → 运动员详情
/doctor/conflict-check              → 冲突检查

/manager                            → 管理端首页
/manager/attendance                 → 考勤管理
/manager/profile                    → 个人资料
```

---

## 十二、设计规范

- **主题**：暗色（#0D0C0A 背景）+ 金色强调色（#D4A44C）
- **字体**：Outfit（英文/数字）+ Noto Serif SC（中文）
- **布局**：移动端优先，max-width 430px，底部导航栏
- **交互**：Sheet 弹窗（从底部滑出）、fadeUp 动画、脉冲录音效果
- **状态色**：绿色（优秀/积极）、琥珀色（关注/中等）、红色（预警/高风险）
- **训练区间色**：E（绿）、M（蓝）、T（琥珀）、I（橙）、R（红）
