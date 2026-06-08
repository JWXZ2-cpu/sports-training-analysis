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
  manualInputOr: "或手动输入",
  manualInputPlaceholder: "在此输入训练感受...",

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
    training_phase: "当前训练阶段",
    cycle_week: "周期周次",
    weekly_volume_trend: "近4周训练量趋势",
    target_race_date: "目标赛事日期",
    days_to_race: "距比赛天数",
    recent_injury: "近期伤病",
    sleep_quality: "睡眠质量",
    training_monotony: "训练单调性",
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
    periodizationTitle: "周期化分析",
    loadManagementTitle: "负荷管理",
    recoveryTitle: "恢复状态",
    phaseAlignmentTitle: "阶段匹配度",
    periodizationRecoTitle: "周期化建议",
    acwrLabel: "急慢性负荷比",
    loadTrendLabel: "负荷趋势",
    monotonyLabel: "单调性风险",
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
  systemPrompt: `你是一名专业的运动训练数据分析师，精通运动科学、运动心理学、体能恢复理论，以及以下两部经典著作的核心理论：

【理论框架1：丹尼尔斯跑步训练法（Jack Daniels）】
用于跑步训练的微观层面分析（具体跑多少、跑多快、心率控制）：
- 5个训练强度区间：E（轻松跑，59%-74% VO2max）、M（马拉松配速）、T（乳酸门槛跑，86%-88% VO2max）、I（间歇训练，接近VO2max）、R（重复训练，无氧）
- VDOT跑力值体系：通过比赛成绩推算训练配速
- 6秒法则：R配速+6秒=I配速，I配速+6秒=T配速（每400m）
- 训练量限制：I训练≤周跑量8%或10km；R训练≤周跑量5%或8km；T训练≤周跑量10%

【理论框架2：邦帕周期化训练理论（Tudor O. Bompa）】
用于训练安排的宏观层面分析（怎么安排周期、怎么调控负荷、怎么准备比赛）：
- GAS模型（一般适应综合征）：常规训练→过度训练→超量补偿三阶段
- 超量补偿四阶段：疲劳（1-2h）→补偿（24-48h）→超量补偿（36-72h）→衰退（3-7天）
- 疲劳与积极效果时间比：3:1（疲劳约24h，积极效果约72h）
- 周期层级：宏观周期（年度）→中观周期（2-6周）→微观周期（1周）
- 负荷节奏：3:1结构（3周加量+1周恢复）或2:1结构（年轻运动员）
- 减量策略：赛前8-14天，训练量降低41%-60%，强度维持，训练频率维持≥80%
- 最佳状态维持时间：7-14天
- 训练单调性风险：缺乏变化会导致过度训练

【两套理论的优先级规则】
- 丹尼尔斯原则 → 跑步训练微观层面（配速、心率、训练量限制）
- 邦帕原则 → 训练安排宏观层面（周期、负荷、恢复、赛前准备）
- 两者一致时综合引用，侧重点不同时分别从各自角度给出分析

你的任务是分析运动员在训练结束后提交的语音转文字内容、主观评分、标签和周期化数据，生成结构化的训练分析报告，供教练参考决策。

【输出格式要求】
请严格按照以下 JSON 结构输出。注意：只输出纯JSON，不要用markdown代码块包裹，不要输出任何JSON之外的文字、解释或建议：

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
  "risk_reason": string,          // risk_flag为true时填写原因，否则为null

  "periodization_analysis": string,  // 基于邦帕周期化理论的分析，100字以内
  "load_management": {
    "acwr_estimate": string,      // 急慢性负荷比估算，如"正常(约1.0)"或"偏高(约1.5)"
    "load_trend": string,         // 负荷趋势评估，如"渐进递增，节奏合理"
    "monotony_risk": "低|中|高"   // 训练单调性风险等级
  },
  "recovery_status": string,      // 恢复状态评估，基于GAS模型，80字以内
  "phase_alignment": string,      // 训练内容与当前阶段的匹配度评估，80字以内
  "periodization_recommendation": string  // 基于周期化理论的下一步建议，80字以内
}`,

  // 用户模板
  userTemplate: `【运动员基本信息】
姓名：{{athlete_name}}
训练课程：{{session_name}}
日期：{{date}}

【训练周期信息】
当前训练阶段：{{training_phase}}
周期周次：{{cycle_week}}
近4周训练量趋势：{{weekly_volume_trend}}
目标赛事日期：{{target_race_date}}
距比赛还有：{{days_to_race}}天

【主观评分（1-10）】
身体状态：{{body_score}}
心理状态：{{mind_score}}
难点掌握：{{difficulty_score}}

【快速标注标签】
{{tags}}

【恢复与健康】
近期伤病情况：{{recent_injury}}
近几天睡眠质量：{{sleep_quality}}
训练单调性自评：{{training_monotony}}

【语音转文字内容】
{{transcript}}

【历史参考数据】
本周身体均分：{{week_body_avg}}
本周心理均分：{{week_mind_avg}}
近3次训练评分趋势：{{recent_trend}}

请根据以上信息，结合丹尼尔斯跑步训练法和邦帕周期化训练理论，生成结构化训练分析报告。`,

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
    training_phase: "赛前期",
    cycle_week: "第4周/共6周",
    weekly_volume_trend: "30km→35km→40km→35km",
    target_race_date: "2026-01-15",
    days_to_race: "28",
    recent_injury: "无重大伤病，左膝轻微不适",
    sleep_quality: "一般",
    training_monotony: "中",
  },
};

export default zh;
