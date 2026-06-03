const zh = {
  lang: "zh",
  langLabel: "中",

  // 新 UI
  appTitle: "训练分析",
  steps: ["语音输入", "数据确认", "分析结果"],

  // 语音输入页
  tapToSpeak: "点击麦克风开始录音",
  listening: "正在录音，请说话...",
  voiceRecorded: "录音完成，可点击确认继续",
  voiceTranscript: "语音转录",
  confirmAndContinue: "确认并继续",
  voiceHint: "请描述你今天的训练感受、身体状态、遇到的难点等",
  voiceNotSupported: "浏览器不支持语音识别",
  voiceNotSupportedHint: "请使用 Chrome 或 Edge 浏览器",

  // 数据确认页
  backToVoice: "返回重录",
  sectionBasic: "基本信息",
  sectionScores: "主观评分（1-10）",
  sectionTags: "快速标签",
  sectionTranscript: "语音转录",
  sectionHistory: "历史参考数据（选填）",
  startAnalysis: "开始分析",

  // 结果页
  backToEdit: "返回修改数据",
  restartRecording: "重新录音",

  // 顶栏（旧）
  title: "训练分析 Prompt 工作台",
  subtitle: "编辑模板 · 填入数据 · 实时测试 AI 效果",

  // 按钮
  runBtn: "运行分析 ▶",
  loadingBtn: "AI 分析中...",
  resetBtn: "重置为示例数据",
  showRaw: "查看原始 JSON",
  showCard: "显示卡片视图",

  // Tab 标签
  tabSystem: "系统提示词",
  tabUser: "用户模板",
  tabData: "测试数据",
  tabResult: "分析结果",
  tabDone: "✓",

  // 系统提示词 Tab
  systemDesc: "定义 AI 的角色、输出格式与 JSON schema。这是 Prompt 的核心骨架。",
  systemHint: "提示：JSON schema 中的字段注释会引导 AI 输出更精准。修改后点击「运行分析」立即验证效果。",

  // 用户模板 Tab
  userDesc: "用 {{变量名}} 插入动态数据。可用变量：",
  userPreview: "预览（变量已填入）",

  // 测试数据 Tab
  placeholderTranscript: "粘贴语音转文字内容...",

  // 结果 Tab — 加载动画
  loadingMsgs: ["调用 AI 分析引擎...", "语音语义解析中...", "生成报告结构..."],

  // 结果 Tab — 空状态
  emptyHint: "点击右上角「运行分析」查看结果",

  // 错误信息
  errorPrefix: "解析失败：",
  errorSuffix: "\n\n原始输出已在「原始 JSON」中显示",

  // 字段标签
  fields: {
    athlete_name: "运动员姓名",
    session_name: "训练课程",
    date: "训练日期",
    body_score: "身体评分",
    mind_score: "心理评分",
    difficulty_score: "难点掌握",
    tags: "标注标签",
    transcript: "语音转录",
    week_body_avg: "本周身体均分",
    week_mind_avg: "本周心理均分",
    recent_trend: "近期趋势",
  },

  // 结果卡片标签
  result: {
    overallScore: "综合评分",
    riskAlert: "⚠ 需立即关注",
    emotionFatigue: "情绪与疲劳",
    emotionPrefix: "情绪",
    fatiguePrefix: "疲劳",
    difficultyTitle: "训练难点",
    diaryTitle: "训练日记",
    coachTitle: "教练简报",
    recoTitle: "明日训练建议",
  },

  // 枚举映射：状态
  statusLevel: {
    优秀: "优秀",
    正常: "正常",
    关注: "关注",
    预警: "预警",
  },

  // 枚举映射：情绪极性
  polarity: {
    积极: "积极",
    中性: "中性",
    消极: "消极",
  },

  // 枚举映射：疲劳
  fatigue: {
    低: "低",
    中: "中",
    高: "高",
  },

  // 状态颜色
  statusColor: {
    优秀: { bg: "#E1F5EE", text: "#0F6E56", border: "#9FE1CB" },
    正常: { bg: "#E6F1FB", text: "#0C447C", border: "#85B7EB" },
    关注: { bg: "#FAEEDA", text: "#633806", border: "#FAC775" },
    预警: { bg: "#FCEBEB", text: "#791F1F", border: "#F09595" },
  },

  polarityColor: {
    积极: "#1D9E75",
    中性: "#888780",
    消极: "#E24B4A",
  },

  fatigueColor: {
    低: "#1D9E75",
    中: "#BA7517",
    高: "#E24B4A",
  },

  // 系统提示词
  systemPrompt: `你是一名专业的运动训练数据分析师，精通运动科学、运动心理学与体能恢复理论。

你的任务是分析运动员在训练结束后提交的语音转文字内容、主观评分和标签，生成结构化的训练分析报告，供教练参考决策。

【输出格式要求】
请严格按照以下 JSON 结构输出，不要输出任何 JSON 之外的内容：

{
  "overall_score": number,        // 综合评分 1-10，综合身体、心理与反馈质量
  "status_level": "优秀|正常|关注|预警",
  "emotion": {
    "polarity": "积极|中性|消极",
    "confidence": number,         // 0.0-1.0
    "signals": string[]           // 情绪信号关键词，最多3个
  },
  "fatigue": {
    "level": "低|中|高",
    "body_parts": string[],       // 提及的身体部位，如["膝盖","大腿"]
    "evidence": string            // 支撑判断的原文片段，≤30字
  },
  "difficulty_points": string[],  // 运动员反馈的训练难点，最多3项
  "diary_text": string,           // AI生成的训练日记，150字以内，第一人称，自然口吻
  "coach_summary": string,        // 给教练的简报，80字以内，客观第三人称
  "recommendations": string[],    // 明日训练建议，2-3条，每条≤25字
  "risk_flag": boolean,           // 是否需要教练立即关注
  "risk_reason": string           // risk_flag为true时填写原因，否则为null
}`,

  // 用户模板
  userTemplate: `【运动员基本信息】
姓名：{{athlete_name}}
训练课程：{{session_name}}
日期：{{date}}

【主观评分（1-10）】
身体状态：{{body_score}}
心理状态：{{mind_score}}
难点掌握：{{difficulty_score}}

【快速标注标签】
{{tags}}

【语音转文字内容】
{{transcript}}

【历史参考数据】
本周身体均分：{{week_body_avg}}
本周心理均分：{{week_mind_avg}}
近3次训练评分趋势：{{recent_trend}}

请根据以上信息，生成结构化训练分析报告。`,

  // 示例数据
  sampleData: {
    athlete_name: "张明远",
    session_name: "速度耐力课",
    date: "2025-12-18",
    body_score: "7",
    mind_score: "8",
    difficulty_score: "5",
    tags: "膝盖酸痛、状态良好",
    transcript: "今天跑的感觉还行，最后两组有点掉速，膝盖有点酸，心理状态挺好的，加速跑那块还需要多练，感觉节奏还没完全掌握，其他的都还可以吧",
    week_body_avg: "7.1",
    week_mind_avg: "7.4",
    recent_trend: "7→6→7（近3次身体）",
  },
};

export default zh;
