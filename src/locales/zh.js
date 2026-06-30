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
    today_plan_content: "今日计划内容",
    today_plan_zone: "目标强度区间",
    today_plan_pace: "目标配速",
    today_plan_distance: "预计距离",
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
    trainingZoneLabel: "强度区间",
    vdotLabel: "VDOT估算",
    trainingQualityLabel: "训练质量",
    intensityFeedbackTitle: "强度区间分析",
    danielsRecoTitle: "丹尼尔斯理论建议",
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

【理论框架3：运动心理学（Arnold LeUnes）】
用于运动员心理状态分析（情绪、动机、自信、焦虑）：
- 焦虑三维度：躯体焦虑（肌肉紧张）、认知焦虑（消极思维）、状态自信
- 归因理论（韦纳）：成败 = f(能力, 努力, 任务难度, 运气)；将失败归因于可控因素(努力)有助于心理恢复
- 自我效能理论（班杜拉）：自信是预测表现的关键指标
- 成就目标：掌握目标(任务定向) vs 竞赛目标(自我定向)
- 内部动机vs外部动机：过度外部奖励可能损害内在动机
- 认知控制技术：思维阻断、否定消极想法、重构视角
- 受伤心理应答三阶段：沮丧→回避→决心应对
- 注意力模型：广度(宽-窄) × 方向(内-外)，唤醒过高导致注意变窄→"卡壳"
- 锻炼降低焦虑0.36个标准差，对抑郁有积极影响

【深层心理状态识别能力】
请从运动员的语音/文字反馈中识别以下心理信号：

动机状态：
- 内在动机强：主动表达训练兴趣、享受过程、自我挑战
- 动机一般：按要求完成、没有特别积极或消极的表现
- 动机下降：表达不想练、没兴趣、厌倦、"又是一样的训练"
- 动机丧失：明确表达放弃、不想继续、觉得没有意义

情绪状态：
- 积极：开心、满足、兴奋、状态好
- 中性：正常、还行、一般
- 消极：沮丧、失落、烦躁、心情差
- 焦虑：紧张、担心、睡不着、脑子里一直在想比赛
- 愤怒：不满、生气（可能对训练安排或自己的表现）

自信心状态：
- 自信：相信自己能做好、不怕挑战
- 不确定：犹豫、不确定自己能做到
- 不自信：怀疑自己、怕做不好、怕失败
- 过度自信：盲目乐观、忽视风险

注意力状态：
- 专注：能集中注意力、感受身体信号、进入心流
- 分散：容易走神、注意力不集中
- 过度关注：过度关注身体某个部位的疼痛或不适

压力来源：
- 训练压力：训练量大、难度高、跟不上
- 比赛压力：赛前紧张、怕发挥不好
- 外部压力：学业、家庭、人际关系
- 内部压力：完美主义、自我要求过高、和别人比较

恢复与倦怠：
- 恢复良好：休息充分、精神状态好
- 恢复一般：有疲劳感但可以继续
- 恢复不足：明显疲劳、精神不佳
- 职业倦怠：对训练失去热情、身心俱疲、想逃避

【三套理论的优先级规则】
- 丹尼尔斯原则 → 跑步训练微观层面（配速、心率、训练量限制）
- 邦帕原则 → 训练安排宏观层面（周期、负荷、恢复、赛前准备）
- 运动心理学原则 → 运动员心理状态分析（情绪、动机、自信、焦虑）
- 三者一致时综合引用，侧重点不同时分别从各自角度给出分析
- coach_view中的心理分析应基于运动心理学理论，结合运动员的主观评分和语音文本进行推断

【运动员端关怀语原则】
- 如果检测到消极情绪、焦虑、动机下降等信号 → 生成一句温暖的关怀语
- 如果检测到积极情绪 → 生成一句鼓励的话
- 如果情绪中性 → 不生成care_message
- care_message绝对不能暴露任何专业心理分析内容
- 不说"你有焦虑倾向"或"你动机在下降"
- 只用温暖、自然的语言表达关心，像朋友一样

你的任务是分析运动员在训练结束后提交的语音转文字内容、主观评分、标签和周期化数据，生成结构化的训练分析报告。

【极其重要的双视角原则】
本系统采用双视角输出：运动员看到的内容和教练看到的内容完全不同。
- 运动员端 = 训练日记本（只记录事实，不做专业分析，不使用专业术语）
- 教练端 = 战术分析师（提供完整的专业决策支持）

运动员端绝对不能出现：训练区间（E/M/T/I/R）、VDOT值、训练质量评级、负荷分析（ACWR）、周期化分析、风险评估、任何专业训练建议。这些内容一旦被运动员看到，可能导致"AI比教练还懂"的信任危机。

【输出格式要求】
请严格按照以下 JSON 结构输出。注意：只输出纯JSON，不要用markdown代码块包裹，不要输出任何JSON之外的文字、解释或建议：

{
  "athlete_view": {
    "summary": "string（≤30字，一句话事实描述，不用任何专业术语。好的例子：'今天按计划完成了速度耐力训练，整体状态不错'。坏的例子：'今天的I区训练表现良好，VDOT有提升趋势'）",
    "training_log": ["完成了热身10分钟", "完成了间歇跑5组", "完成了放松拉伸"],
    "highlights": ["前几组节奏控制得很稳", "整体状态比上次有进步"],
    "areas_to_work": ["最后阶段稍有掉速，下次可以注意保持节奏"],
    "encouragement": "string（一句简短积极的鼓励，≤20字）",
    "care_message": "string|null（如果检测到消极情绪、焦虑、动机下降，生成一句温暖的关怀语，如'最近训练辛苦了，记得好好休息'。如果情绪积极则生成鼓励语。如果中性则为null。绝对不能暴露心理分析内容）"
  },

  "coach_view": {
    "detailed_analysis": "string（≤100字，专业分析）",
    "zone_assessment": "string（≤50字，强度区间评估）",
    "periodization_note": "string（≤50字，周期化注意事项）",
    "psychology_analysis": "string（≤80字，基于运动心理学的心理状态分析，包括情绪极性、焦虑类型、动机水平、自信程度、归因方式等）",
    "psychology_assessment": {
      "detected_signals": ["动机下降", "焦虑"],
      "analysis": "string（≤120字，深层心理状态分析，基于运动员的语音文本识别动机状态、情绪状态、自信心、注意力、压力来源、恢复与倦怠等信号）",
      "suggestion": "string（≤80字，心理层面的建议，如调整训练多样性、进行心理干预、一对一沟通等）"
    },
    "risk_assessment": "string（≤50字，风险评估）",
    "ai_suggestion": "string（≤80字，AI建议，标注请结合实际判断）"
  },

  "emotion_display": "😊 积极",
  "fatigue_display": "低",

  "diary_text": "string（AI生成的训练日记，150字以内，第一人称，自然口吻）",

  "overall_score": number,        // 必须是 1.0-10.0 之间的数字，绝不能超过10
  "status_level": "优秀|正常|关注|预警",
  "emotion": {
    "polarity": "积极|中性|消极",
    "confidence": number,
    "signals": string[]
  },
  "fatigue": {
    "level": "低|中|高",
    "body_parts": string[],
    "evidence": string
  },
  "difficulty_points": string[],
  "training_zone": "E|M|T|I|R",
  "zone_distribution": {"E": number, "M": number, "T": number, "I": number, "R": number},
  "vdot_estimate": number,
  "training_quality": "优秀|良好|一般|需改进",
  "intensity_feedback": "string",
  "periodization_analysis": "string",
  "load_management": {
    "acwr_estimate": "string",
    "load_trend": "string",
    "monotony_risk": "低|中|高"
  },
  "recovery_status": "string",
  "phase_alignment": "string",
  "coach_summary": "string",
  "recommendations": string[],
  "daniels_recommendation": "string",
  "periodization_recommendation": "string",
  "risk_flag": boolean,
  "risk_reason": "string|null"
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

【今日训练计划】
计划内容：{{today_plan_content}}
目标强度区间：{{today_plan_zone}}
目标配速：{{today_plan_pace}}
预计距离：{{today_plan_distance}}

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

【心理状态】
情绪标签：{{mood_tags}}
心理感受描述：{{mood_description}}

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
    mood_tags: "😊 自信、💪 专注",
    mood_description: "今天对训练很有信心，注意力比较集中，最后几组虽然累但能坚持住",
    today_plan_content: "间歇跑1000m x 5，配速3:45/km，间歇90秒",
    today_plan_zone: "I（间歇训练）",
    today_plan_pace: "3:45/km",
    today_plan_distance: "8km",
  },

  // 共享 key
  loading: "加载中...",
  unknown: "未知",
  back: "返回",
  confirm: "确认",
  cancel: "取消",
  save: "保存",
  delete: "删除",
  edit: "编辑",
  close: "关闭",
  retry: "重试",
  error: {
    loadFailed: "加载失败，请重试",
    pageError: "页面遇到了问题",
    pageErrorMsg: "抱歉，页面渲染时发生了错误。你可以尝试重新加载或返回首页。",
    reload: "重新加载",
    goHome: "返回首页",
    devDetails: "错误详情（开发模式）",
  },
  time: {
    justNow: "刚刚",
    minutesAgo: "{n}分钟前",
    hoursAgo: "{n}小时前",
    daysAgo: "{n}天前",
  },

  // ============================================
  // 主教练端
  // ============================================
  coach: {
    // 导航栏
    navWorkbench: "工作台",
    navPlan: "计划",
    navRecord: "记录",
    navNotify: "通知",

    // 通用
    greetingMorning: "早上好，",
    greetingAfternoon: "下午好，",
    greetingEvening: "晚上好，",
    role: "主教练",
    save: "保存",
    cancel: "取消",
    delete: "删除",
    edit: "编辑",
    loading: "加载中...",
    noData: "暂无数据",
    confirm: "确认",
    today: "今天",
    yesterday: "昨天",
    earlier: "更早",
    normal: "正常",
    attention: "关注",
    alert: "预警",
    rest: "休息",
    unknown: "未知",
    peopleUnit: "人",
    justNow: "刚刚",
    minutesAgo: "{n}分钟前",
    hoursAgo: "{n}小时前",
    daysAgo: "{n}天前",
    saving: "保存中...",
    saveFailed: "保存失败:",
    deleteConfirm: "确定删除此计划？",
    deleteFailed: "删除失败:",
    fillTitleDate: "请填写标题和日期",
    inputRequired: "请输入训练课内容",
    getReportFailed: "获取报告失败:",
    recordingStop: "正在录音… 点击结束",
    noAIReport: "暂无AI报告",
    noRecords: "暂无记录",
    back: "← 返回",
    myProfile: "我的",

    // 工作台 Tab
    todayTraining: "今日训练",
    restDay: "休息日",
    teamAvg: "团队均分",
    alertCount: "预警",
    needAttention: "需关注运动员",
    needFollow: "需关注",
    athleteStatus: "运动员状态",
    lastTraining: "上次: {date}",
    trainingPlan: "训练计划",
    trainingRecords: "训练记录",

    // 计划 Tab
    aiAssistPlan: "AI 辅助制定计划",
    aiAssistDesc: "根据运动员数据和训练目标，智能生成一周训练计划",
    createPlan: "+ 创建计划",
    editPlan: "编辑计划",
    updatePlan: "更新计划",
    publishPlan: "发布计划",
    lastWeek: "← 上一周",
    nextWeek: "下一周 →",
    addPlan: "+ 添加",
    noPlan: "☀️ 休息日",
    todayTag: "今天",
    trainingName: "训练名称",
    trainingNameHint: "如：速度耐力课",
    trainingDate: "训练日期",
    trainingType: "训练类型",
    restDayType: "休息",
    intensityZone: "强度区间",
    targetPace: "目标配速",
    targetPaceHint: "如：4:10-4:20/km",
    targetHR: "目标心率",
    targetHRHint: "如：170-180bpm",
    estDistance: "预估距离",
    estDistanceHint: "如：8km",
    estDuration: "预估时长",
    estDurationHint: "如：50分钟",
    athletes: "适用运动员",
    allTeam: "全队",
    warmup: "热身",
    warmupHint: "如：慢跑10分钟+动态拉伸",
    notes: "备注",
    mainTraining: "主训练",
    cooldown: "放松",
    setNumber: "第{num}组",
    addSet: "+ 添加一组",
    restDayLabel: "休息",
    warmupLabel: "热身",

    // 记录 Tab
    trainingSession: "训练课",
    todayRecords: "今日记录",
    weekRecords: "本周记录",
    monthRecords: "本月记录",
    step1: "训练日期",
    step2: "训练类型",
    step3: "训练课内容",
    selectType: "选择训练类型",
    voiceRecord: "语音录入训练课",
    voiceRecordHint: "口述今天的训练课情况，如：今天400米间歇10组，张明远最好58秒...",
    aiParsing: "AI 解析中...",
    confirmSubmit: "确认提交",
    recentRecords: "最近记录",
    recordsCount: "{count} 条",
    viewAllHistory: "查看全部历史记录",
    historyRecords: "训练记录历史",
    noRecordsYet: "暂无记录",
    trainingRecord: "训练记录",
    aiParseResult: "AI 解析结果",
    sessionType: "训练类型",
    sessionSummary: "训练概要",
    athleteRecords: "运动员记录",
    overallEvaluation: "整体评价",
    followUpArrangement: "后续安排",
    keyObservations: "关键观察",
    recognizing: "识别中...",
    month: "月",

    // 通知 Tab
    notifications: "通知",
    markAllRead: "全部已读",
    unread: "未读",
    read: "已读",
    noTodayNotif: "暂无今日通知",
    noYesterdayNotif: "暂无昨日通知",
    markAllReadBtn: "全部标记已读",
    backToWorkbench: "返回工作台",

    // 运动员详情
    loadingRecords: "加载中...",
    assistantNotes: "助教备注",

    // 报告详情
    athleteFeedback: "运动员反馈",

    // AI 辅助计划
    aiSuggestionTitle: "AI辅助制定训练计划",
    trainingGoal: "训练目标",
    currentPhase: "当前阶段",
    targetAthletes: "适用运动员",
    selectAll: "全选",
    daysToRace: "距比赛天数（选填）",
    daysToRaceHint: "选填",
    specialNotes: "特别说明（选填）",
    specialNotesHint: "如：张明远膝盖有伤，避免高强度冲击训练",
    generatePlan: "🧠 生成训练计划建议",
    generating: "生成中...",
    aiAnalyzing: "AI 正在根据丹尼尔斯和邦帕理论制定训练计划...",
    analyzingDetail: "分析运动员数据 · 计算最优负荷 · 生成周计划",
    weeklyPlan: "一周训练计划建议",
    loadAnalysis: "周负荷分析",
    totalDistance: "总跑量:",
    intensityBalance: "强度平衡:",
    loadSuggestion: "负荷建议:",
    precautions: "注意事项",
    theoryBasis: "理论依据",
    daniels: "丹尼尔斯",
    bompa: "邦帕",
    adoptPlan: "✅ 采纳为本周计划",
    discardPlan: "🔄 放弃重新生成",
    heartRate: "心率:",
    duration: "时长:",
    zone: "区间",
    adopting: "采纳中...",
    planAdopted: "训练计划采纳成功！",
    planAdoptFailed: "采纳失败: ",
    confirmAdopt: "确定采纳此计划为本周训练计划？",

    // 绑定管理
    bindingManage: "绑定管理",
    headCoach: "主教练",
    currentLogin: "（当前登录）",
    bindAssistant: "绑定助教",
    bindDoctor: "绑定队医",
    none: "无",
    saveBinding: "保存绑定",
    bindingSaved: "绑定已保存",
    bindingFailed: "绑定失败:",

    // 个人资料
    accountName: "账号",
    roleLabel: "角色",
    userId: "用户ID",
    logout: "退出登录",

    // 训练类型
    sessionTypes: {
      interval: "间歇训练",
      tempo: "节奏跑",
      easy: "轻松跑",
      long: "长距离跑",
      recovery: "恢复跑",
      strength: "力量训练",
      race: "比赛",
    },

    // 星期
    weekdays: {
      mon: "周一",
      tue: "周二",
      wed: "周三",
      thu: "周四",
      fri: "周五",
      sat: "周六",
      sun: "周日",
    },
  },

  // ============================================
  // 登录页面
  // ============================================
  auth: {
    appTitle: "脉",
    appSubtitle: "MAI",
    loginTitle: "登录账号",
    registerTitle: "创建新账号",
    username: "用户名",
    usernamePlaceholder: "请输入用户名",
    password: "密码",
    passwordPlaceholder: "请输入密码",
    confirmPassword: "确认密码",
    confirmPasswordPlaceholder: "再次输入密码",
    selectRole: "选择角色",
    rememberMe: "记住我",
    forgotPassword: "忘记密码？",
    contactAdmin: "请联系管理员重置密码",
    login: "登录",
    register: "注册",
    noAccount: "还没有账号？",
    goRegister: "去注册",
    hasAccount: "已有账号？",
    goLogin: "去登录",
    loggingIn: "登录中...",
    registering: "注册中...",
    registerSuccess: "注册成功",
    registeredAs: "注册为",
    enteringSystem: "进入系统...",
    usernameRequired: "请输入用户名",
    passwordRequired: "请输入密码（至少6位）",
    passwordMismatch: "两次密码不一致",
    roleRequired: "请选择角色",
    loginFailed: "登录失败",
    registerFailed: "注册失败",
  },

  // ============================================
  // 助教端
  // ============================================
  assistant: {
    // 导航栏
    navWorkbench: "工作台",
    navRecords: "记录",
    navAlerts: "通知",

    // 通用
    greetingMorning: "早上好，",
    greetingAfternoon: "下午好，",
    greetingEvening: "晚上好，",
    role: "助教",
    restoreWeek: "恢复周",
    save: "保存",
    cancel: "取消",
    loading: "加载中...",
    noData: "暂无数据",
    unknown: "未知",
    peopleUnit: "人",
    myProfile: "我的",
    accountInfo: "账号信息",

    // 工作台
    athletes: "运动员",
    teamAvg: "团队均分",
    alertCount: "预警",
    needAttention: "需关注运动员",
    athleteStatus: "运动员状态",
    lastTraining: "上次: {date}",
    noRecords: "暂无记录",
    trainingRecords: "训练记录",
    viewAll: "查看全部",
    viewNotifications: "查看通知",

    // 记录
    all: "全部",
    noSessionRecords: "暂无训练记录",
    noFeedback: "暂无反馈摘要",
    coachViewed: "教练已阅",
    trainingSession: "训练课",

    // 通知
    notifications: "通知",
    markAllRead: "全部已读",
    alert: "预警",
    unread: "未读",
    read: "已读",
    noTodayNotif: "暂无今日通知",
    noYesterdayNotif: "暂无昨日通知",
    markAllReadBtn: "全部标记已读",
    backToWorkbench: "返回工作台",
    today: "今天",
    yesterday: "昨天",
    earlier: "更早",

    // 运动员详情
    athleteDetail: "运动员详情",
    backToWorkbenchBtn: "← 返回工作台",
    trainingRecord: "训练记录",
    loadingRecords: "加载中...",
    assistantNotes: "助教备注",
    addTrainingNote: "添加训练备注",
    voiceInputNote: "语音输入",
    submitNote: "提交备注",
    submitting: "提交中...",
    noteSubmitted: "备注已提交",
    noteFailed: "提交失败: ",
    historyNotes: "历史备注",
    observation: "观察",
    evaluation: "评价",
    backToTrainingRecords: "← 返回训练记录",
    recordingStop: "正在录音… 点击结束",
    fatigue: "疲劳",

    // 报告详情
    athleteFeedback: "运动员反馈",
    noAIReport: "暂无AI报告",
    noFeedback: "暂无反馈",
    submitNoteBtn: "提交备注",
    body: "身体",
    mind: "心理",
    notePlaceholder: "点击麦克风语音输入，或直接打字记录训练评价...",
    injuryRisk: "检测到受伤风险",

    // 个人资料
    accountName: "账号",
    roleLabel: "角色",
    userId: "用户ID",
    logout: "退出登录",

    // 通知图标配置
    notifConfig: {
      risk_alert: "预警",
      injury_alert: "预警",
      training_feedback: "训练",
      treatment_plan: "治疗",
      training_note: "备注",
      conflict_alert: "冲突",
      plan_approval: "计划",
      general: "通知",
    },
  },
};

export default zh;
