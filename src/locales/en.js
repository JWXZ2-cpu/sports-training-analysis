const en = {
  lang: "en",
  langLabel: "EN",

  // New UI
  appTitle: "Training Analysis",
  steps: ["Voice Input", "Data Confirm", "Analysis"],

  // Voice input page
  tapToSpeak: "Tap the microphone to start recording",
  listening: "Recording, please speak...",
  voiceRecorded: "Recording complete, tap confirm to continue",
  voiceTranscript: "Voice Transcript",
  confirmAndContinue: "Confirm & Continue",
  voiceHint: "Describe your training experience, body condition, difficulties, etc.",
  voiceNotSupported: "Speech recognition not supported",
  voiceNotSupportedHint: "Please use Chrome or Edge browser",
  manualInputOr: "or type manually",
  manualInputPlaceholder: "Type your training experience here...",

  // Data confirm page
  backToVoice: "Re-record",
  sectionBasic: "Basic Info",
  sectionScores: "Subjective Scores (1-10)",
  sectionTags: "Quick Tags",
  sectionTranscript: "Voice Transcript",
  sectionHistory: "Historical Data (optional)",
  startAnalysis: "Start Analysis",

  // Result page
  backToEdit: "Edit Data",
  restartRecording: "New Recording",

  // Top bar (legacy)
  title: "Training Analysis Prompt Workbench",
  subtitle: "Edit templates · Fill data · Test AI results in real-time",

  // Buttons
  runBtn: "Run Analysis ▶",
  loadingBtn: "Analyzing...",
  resetBtn: "Reset to Sample Data",
  showRaw: "View Raw JSON",
  showCard: "Show Card View",

  // Tab labels
  tabSystem: "System Prompt",
  tabUser: "User Template",
  tabData: "Test Data",
  tabResult: "Analysis Result",
  tabDone: "✓",

  // System prompt tab
  systemDesc: "Define AI role, output format and JSON schema. This is the core skeleton of the prompt.",
  systemHint: "Tip: Field annotations in the JSON schema guide AI to produce more accurate output. Click 'Run Analysis' to verify after editing.",

  // User template tab
  userDesc: "Insert dynamic data with {{variable}}. Available variables:",
  userPreview: "Preview (variables filled)",

  // Test data tab
  placeholderTranscript: "Paste voice-to-text content...",

  // Result tab — loading animation
  loadingMsgs: ["Calling AI analysis engine...", "Parsing voice semantics...", "Generating report structure..."],

  // Result tab — empty state
  emptyHint: "Click 'Run Analysis' in the top right to view results",

  // Error messages
  errorPrefix: "Parse failed: ",
  errorSuffix: "\n\nRaw output is shown in 'Raw JSON'",

  // Field labels
  fields: {
    athlete_name: "Athlete Name",
    session_name: "Training Session",
    date: "Date",
    body_score: "Body Score",
    mind_score: "Mind Score",
    difficulty_score: "Difficulty Mastery",
    tags: "Tags",
    transcript: "Voice Transcript",
    week_body_avg: "Weekly Body Avg",
    week_mind_avg: "Weekly Mind Avg",
    recent_trend: "Recent Trend",
    training_phase: "Training Phase",
    cycle_week: "Cycle Week",
    weekly_volume_trend: "4-Week Volume Trend",
    target_race_date: "Target Race Date",
    days_to_race: "Days to Race",
    recent_injury: "Recent Injury",
    sleep_quality: "Sleep Quality",
    training_monotony: "Training Monotony",
    today_plan_content: "Today's Plan",
    today_plan_zone: "Target Zone",
    today_plan_pace: "Target Pace",
    today_plan_distance: "Est. Distance",
  },

  // Result card labels
  result: {
    overallScore: "Overall Score",
    riskAlert: "⚠ Immediate Attention Required",
    emotionFatigue: "Emotion & Fatigue",
    emotionPrefix: "Emotion",
    fatiguePrefix: "Fatigue",
    difficultyTitle: "Training Difficulties",
    diaryTitle: "Training Diary",
    coachTitle: "Coach Briefing",
    recoTitle: "Tomorrow's Recommendations",
    periodizationTitle: "Periodization Analysis",
    loadManagementTitle: "Load Management",
    recoveryTitle: "Recovery Status",
    phaseAlignmentTitle: "Phase Alignment",
    periodizationRecoTitle: "Periodization Recommendation",
    acwrLabel: "ACWR Estimate",
    loadTrendLabel: "Load Trend",
    monotonyLabel: "Monotony Risk",
    trainingZoneLabel: "Training Zone",
    vdotLabel: "VDOT Estimate",
    trainingQualityLabel: "Training Quality",
    intensityFeedbackTitle: "Intensity Zone Analysis",
    danielsRecoTitle: "Daniels' Recommendation",
  },

  // Enum mapping: status level
  statusLevel: {
    优秀: "Excellent",
    正常: "Normal",
    关注: "Attention",
    预警: "Alert",
  },

  // Enum mapping: emotion polarity
  polarity: {
    积极: "Positive",
    中性: "Neutral",
    消极: "Negative",
  },

  // Enum mapping: fatigue level
  fatigue: {
    低: "Low",
    中: "Medium",
    高: "High",
  },

  // Status colors (same keys as zh — used for lookup)
  statusColor: {
    优秀: { bg: "#E1F5EE", text: "#0F6E56", border: "#9FE1CB" },
    正常: { bg: "#E6F1FB", text: "#0C447C", border: "#85B7EB" },
    关注: { bg: "#FAEEDA", text: "#633806", border: "#FAC775" },
    预警: { bg: "#FCEBEB", text: "#791F1F", border: "#F09595" },
    Excellent: { bg: "#E1F5EE", text: "#0F6E56", border: "#9FE1CB" },
    Normal: { bg: "#E6F1FB", text: "#0C447C", border: "#85B7EB" },
    Attention: { bg: "#FAEEDA", text: "#633806", border: "#FAC775" },
    Alert: { bg: "#FCEBEB", text: "#791F1F", border: "#F09595" },
  },

  polarityColor: {
    积极: "#1D9E75",
    中性: "#888780",
    消极: "#E24B4A",
    Positive: "#1D9E75",
    Neutral: "#888780",
    Negative: "#E24B4A",
  },

  fatigueColor: {
    低: "#1D9E75",
    中: "#BA7517",
    高: "#E24B4A",
    Low: "#1D9E75",
    Medium: "#BA7517",
    High: "#E24B4A",
  },

  // System prompt (English version)
  systemPrompt: `You are a professional sports training data analyst, proficient in sports science, exercise psychology, recovery theory, and the following two classic training frameworks:

[Framework 1: Daniels' Running Formula (Jack Daniels)]
For micro-level running training analysis (how much, how fast, heart rate control):
- 5 training intensity zones: E (Easy, 59%-74% VO2max), M (Marathon pace), T (Threshold, 86%-88% VO2max), I (Interval, near VO2max), R (Repetition, anaerobic)
- VDOT system: calculate training paces from race results
- 6-second rule: R pace + 6s = I pace, I pace + 6s = T pace (per 400m)
- Volume limits: I ≤ 8% weekly volume or 10km; R ≤ 5% or 8km; T ≤ 10%

[Framework 2: Bompa's Periodization Theory (Tudor O. Bompa)]
For macro-level training arrangement (how to periodize, manage load, prepare for competition):
- GAS model: alarm → resistance → exhaustion stages
- Supercompensation 4 phases: fatigue (1-2h) → recovery (24-48h) → supercompensation (36-72h) → decay (3-7d)
- Fatigue-to-benefit ratio: 3:1 (fatigue ~24h, benefit ~72h)
- Period hierarchy: macrocycle (annual) → mesocycle (2-6 weeks) → microcycle (1 week)
- Load rhythm: 3:1 structure (3 weeks loading + 1 week recovery) or 2:1 for young athletes
- Tapering: 8-14 days before competition, volume ↓41%-60%, intensity maintained, frequency ≥80%
- Peak form duration: 7-14 days
- Training monotony risk: lack of variation leads to overtraining

[Framework 3: Sports Psychology (Arnold LeUnes)]
For athlete mental state analysis (emotion, motivation, confidence, anxiety):
- Anxiety 3 dimensions: somatic anxiety (muscle tension), cognitive anxiety (negative thoughts), state confidence
- Attribution theory (Weiner): success/failure = f(ability, effort, task difficulty, luck); attributing failure to controllable factors (effort) aids recovery
- Self-efficacy theory (Bandura): confidence is a key predictor of performance
- Achievement goals: mastery goals (task orientation) vs performance goals (ego orientation)
- Intrinsic vs extrinsic motivation: excessive external rewards may harm intrinsic motivation
- Cognitive control: thought stopping, countering negative thoughts, reframing
- Injury response 3 stages: depression → denial → coping determination
- Attention model: breadth (wide-narrow) × direction (internal-external), high arousal narrows attention → "choking"
- Exercise reduces anxiety by 0.36 SD, positive effect on depression

[Deep Psychological State Recognition]
Identify these psychological signals from athlete's voice/text:

Motivation: strong intrinsic / normal / declining / lost
Emotion: positive / neutral / negative / anxious / angry
Confidence: confident / uncertain / lacking / overconfident
Attention: focused / distracted / hyper-focused
Pressure: training / competition / external / internal
Recovery: well-recovered / normal / insufficient / burnout

[Priority Rules]
- Daniels → micro-level running (pace, HR, volume limits)
- Bompa → macro-level periodization (cycles, load, recovery, competition prep)
- Sports Psychology → athlete mental state analysis (emotion, motivation, confidence, anxiety)
- When consistent, synthesize all; when different, analyze from each perspective

[Athlete Care Message Rules]
- If negative emotion/anxiety/motivation decline detected → generate warm care message
- If positive emotion → generate encouraging message
- If neutral → set care_message to null
- NEVER expose professional psychological analysis in care_message
- Use warm, natural language like a friend would

Your task is to analyze the athlete's post-training voice transcript, subjective scores, tags, and periodization data to generate a structured training analysis report.

[CRITICAL DUAL-VIEW PRINCIPLE]
This system uses dual-view output: what athletes see and what coaches see are completely different.
- Athlete view = training diary (record facts only, no professional analysis, no technical terms)
- Coach view = tactical analyst (full professional decision support)

Athletes must NEVER see: training zones (E/M/T/I/R), VDOT values, training quality ratings, load analysis (ACWR), periodization analysis, risk assessments, or any professional training advice. Showing these to athletes may cause a trust crisis where they think "AI knows better than the coach."

[Output Format Requirements]
Output ONLY pure JSON in the following format. Do NOT wrap in markdown code blocks. Do NOT output any text, explanations, or suggestions outside the JSON:

{
  "athlete_view": {
    "summary": "string (≤30 chars, factual description, NO professional terms)",
    "training_log": ["Completed 10min warmup", "Completed 5x interval runs", "Completed cooldown stretch"],
    "highlights": ["Rhythm control was steady in first few sets", "Overall improvement from last session"],
    "areas_to_work": ["Slight pace drop at the end, can focus on maintaining rhythm next time"],
    "encouragement": "string (short positive encouragement, ≤20 chars)",
    "care_message": "string|null (warm care message if negative emotion detected, encouraging if positive, null if neutral. NEVER expose psychological analysis)"
  },

  "coach_view": {
    "detailed_analysis": "string (≤100 chars, professional analysis)",
    "zone_assessment": "string (≤50 chars, intensity zone assessment)",
    "periodization_note": "string (≤50 chars, periodization notes)",
    "psychology_analysis": "string (≤80 chars, sports psychology-based mental state analysis)",
    "psychology_assessment": {
      "detected_signals": ["motivation_decline", "anxiety"],
      "analysis": "string (≤120 chars, deep psychological state analysis based on athlete's voice text)",
      "suggestion": "string (≤80 chars, psychological intervention suggestions)"
    },
    "risk_assessment": "string (≤50 chars, risk assessment)",
    "ai_suggestion": "string (≤80 chars, AI suggestion, note: please use professional judgment)"
  },

  "emotion_display": "😊 Positive",
  "fatigue_display": "Low",

  "diary_text": "string (AI training diary, ≤150 chars, first person, natural tone)",

  "overall_score": number,        // Must be 1.0-10.0, NEVER exceed 10
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
}

IMPORTANT: All text fields must be written in English. Keep enum values in Chinese for system consistency.`,

  // User template (English version)
  userTemplate: `【Athlete Basic Info】
Name: {{athlete_name}}
Training Session: {{session_name}}
Date: {{date}}

【Training Periodization】
Current Phase: {{training_phase}}
Cycle Week: {{cycle_week}}
4-Week Volume Trend: {{weekly_volume_trend}}
Target Race Date: {{target_race_date}}
Days to Race: {{days_to_race}}

【Today's Training Plan】
Plan Content: {{today_plan_content}}
Target Zone: {{today_plan_zone}}
Target Pace: {{today_plan_pace}}
Est. Distance: {{today_plan_distance}}

【Subjective Scores (1-10)】
Body Status: {{body_score}}
Mental Status: {{mind_score}}
Difficulty Mastery: {{difficulty_score}}

【Quick Tags】
{{tags}}

【Recovery & Health】
Recent Injuries: {{recent_injury}}
Sleep Quality (recent days): {{sleep_quality}}
Training Monotony (self-assessed): {{training_monotony}}

【Mental State】
Mood Tags: {{mood_tags}}
Mood Description: {{mood_description}}

【Voice Transcript】
{{transcript}}

【Historical Reference Data】
Weekly Body Average: {{week_body_avg}}
Weekly Mind Average: {{week_mind_avg}}
Recent 3 Sessions Trend: {{recent_trend}}

Please generate a structured training analysis report based on the above information, integrating Daniels' Running Formula and Bompa's Periodization Theory.`,

  // Sample data (English version)
  sampleData: {
    athlete_name: "Zhang Mingyuan",
    session_name: "Speed Endurance Session",
    date: "2025-12-18",
    body_score: "7",
    mind_score: "8",
    difficulty_score: "5",
    tags: "Knee soreness, feeling good overall",
    transcript: "Today's run felt okay, I slowed down a bit in the last two sets. My knee is a bit sore, but my mental state is pretty good. I still need more practice on the acceleration part — I haven't fully mastered the rhythm yet. Everything else was fine.",
    week_body_avg: "7.1",
    week_mind_avg: "7.4",
    recent_trend: "7→6→7 (recent 3 body scores)",
    training_phase: "Pre-competition",
    cycle_week: "Week 4/6",
    weekly_volume_trend: "30km→35km→40km→35km",
    target_race_date: "2026-01-15",
    days_to_race: "28",
    recent_injury: "No major injury, mild left knee discomfort",
    sleep_quality: "Fair",
    training_monotony: "Medium",
    today_plan_content: "Interval 1000m x 5, pace 3:45/km, rest 90s",
    today_plan_zone: "I (Interval)",
    today_plan_pace: "3:45/km",
    today_plan_distance: "8km",
  },

  // Shared keys
  loading: "Loading...",
  unknown: "Unknown",
  back: "Back",
  confirm: "Confirm",
  cancel: "Cancel",
  save: "Save",
  delete: "Delete",
  edit: "Edit",
  close: "Close",
  retry: "Retry",
  error: {
    loadFailed: "Load failed, please retry",
    pageError: "Something went wrong",
    pageErrorMsg: "Sorry, an error occurred while rendering. You can try reloading or returning to the home page.",
    reload: "Reload",
    goHome: "Go Home",
    devDetails: "Error Details (Dev Mode)",
  },
  time: {
    justNow: "Just now",
    minutesAgo: "{n}min ago",
    hoursAgo: "{n}h ago",
    daysAgo: "{n}d ago",
  },

  // ============================================
  // 主教练端
  // ============================================
  coach: {
    // 导航栏
    navWorkbench: "Home",
    navPlan: "Plan",
    navRecord: "Record",
    navNotify: "Alerts",

    // 通用
    greetingMorning: "Good morning,",
    greetingAfternoon: "Good afternoon,",
    greetingEvening: "Good evening,",
    role: "Head Coach",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    loading: "Loading...",
    noData: "No data",
    confirm: "Confirm",
    today: "Today",
    yesterday: "Yesterday",
    earlier: "Earlier",
    normal: "Normal",
    attention: "Attention",
    alert: "Alert",
    rest: "Rest",
    unknown: "Unknown",
    peopleUnit: "athletes",
    myProfile: "My",
    justNow: "Just now",
    minutesAgo: "{n}min ago",
    hoursAgo: "{n}h ago",
    daysAgo: "{n}d ago",
    saving: "Saving...",
    saveFailed: "Save failed:",
    deleteConfirm: "Are you sure to delete?",
    deleteFailed: "Delete failed:",
    fillTitleDate: "Please fill in title and date",
    inputRequired: "Please enter content",
    getReportFailed: "Get report failed:",
    back: "← Back",
    recordingStop: "Recording... Tap to stop",
    noAIReport: "No AI report yet",
    noRecords: "No records",
    noTodayNotif: "No notifications today",
    noYesterdayNotif: "No notifications yesterday",

    // 工作台 Tab
    todayTraining: "Today's Training",
    restDay: "Rest Day",
    teamAvg: "Team Avg",
    alertCount: "Alerts",
    needAttention: "Athletes Need Attention",
    needFollow: "Needs Attention",
    athleteStatus: "Athlete Status",
    lastTraining: "Last: {date}",
    noRecords: "No records",
    trainingPlan: "Training Plan",
    trainingRecords: "Training Records",

    // 计划 Tab
    aiAssistPlan: "AI Assisted Planning",
    aiAssistDesc: "Enter training goals and phase, AI will generate professional training plan suggestions",
    createPlan: "+ Create Plan",
    editPlan: "Edit Plan",
    updatePlan: "Update Plan",
    publishPlan: "Publish Plan",
    lastWeek: "‹ Last Week",
    nextWeek: "Next Week ›",
    addPlan: "+ Add",
    noPlan: "☀️ Rest Day",
    todayTag: "Today",
    trainingName: "Training Name",
    trainingNameHint: "e.g: Speed Endurance Session",
    trainingDate: "Training Date",
    trainingType: "Training Type",
    restDayType: "Rest",
    intensityZone: "Intensity Zone",
    targetPace: "Target Pace",
    targetPaceHint: "e.g: 4:10-4:20/km",
    targetHR: "Target HR",
    targetHRHint: "e.g: 170-180bpm",
    estDistance: "Est. Distance",
    estDistanceHint: "e.g: 8km",
    estDuration: "Est. Duration",
    estDurationHint: "e.g: 50min",
    athletes: "Athletes",
    allTeam: "All Team",
    warmup: "Warmup",
    warmupHint: "e.g: 10min easy jog",
    notes: "Notes",
    restDayLabel: "Rest",
    warmupLabel: "Warmup",
    saveFailed: "Save failed: ",
    deleteConfirm: "Are you sure to delete?",
    deleteFailed: "Delete failed: ",
    fillTitleDate: "Please fill in title and date",

    // 记录 Tab
    trainingSession: "Training Session",
    todayRecords: "Today",
    weekRecords: "This Week",
    monthRecords: "This Month",
    step1: "Training Date",
    step2: "Training Type",
    step3: "Session Content",
    selectType: "Select training type",
    voiceRecord: "Voice Record Session",
    voiceRecordHint: "Describe today's training session, e.g: 400m intervals 10 sets, Zhang Mingyuan best 58s...",
    aiParsing: "AI Parsing...",
    submit: "Submit",
    recentRecords: "Recent Records",
    recordsCount: "{count} records",
    viewAllHistory: "View All History",
    historyRecords: "Training History",
    noRecordsYet: "No records",
    trainingRecord: "Training Record",
    aiParseResult: "AI Parse Result",
    sessionType: "Session Type",
    sessionSummary: "Session Summary",
    athleteRecords: "Athlete Records",
    overallEvaluation: "Overall Evaluation",
    followUpArrangement: "Follow-up Arrangement",
    keyObservations: "Key Observations",
    recognizing: "Recognizing...",
    confirmSubmit: "Submit",
    month: "month",
    mainTraining: "Main Training",
    cooldown: "Cooldown",
    setNumber: "Set {num}",
    addSet: "+ Add Set",
    addNote: "Add Note",
    submitNote: "Submit Note",
    noteSaved: "Note saved",
    noteFailed: "Note failed:",

    // 通知 Tab
    notifications: "Notifications",
    markAllRead: "Mark All Read",
    alert: "Alert",
    unread: "Unread",
    read: "Read",
    noTodayNotif: "No notifications today",
    noYesterdayNotif: "No notifications yesterday",
    markAllReadBtn: "Mark All Read",
    backToWorkbench: "Back to Workbench",
    today: "Today",
    yesterday: "Yesterday",
    earlier: "Earlier",

    // 运动员详情
    trainingRecords: "Training Records",
    loadingRecords: "Loading...",
    assistantNotes: "Assistant Notes",

    // 报告详情
    athleteFeedback: "Athlete Feedback",
    noAIReport: "No AI report yet",

    // AI 辅助计划
    aiSuggestionTitle: "AI Assisted Training Plan",
    back: "← Back",
    trainingGoal: "Training Goal",
    currentPhase: "Current Phase",
    targetAthletes: "Target Athletes",
    selectAll: "Select All",
    daysToRace: "Days to Race (optional)",
    daysToRaceHint: "Optional",
    specialNotes: "Special Notes (optional)",
    specialNotesHint: "e.g: Zhang Mingyuan has knee injury, avoid high-impact training",
    generatePlan: "🧠 Generate Training Plan",
    generating: "Generating...",
    aiAnalyzing: "AI is creating training plan based on Daniels and Bompa theory...",
    analyzingDetail: "Analyzing athlete data · Calculating optimal load · Generating weekly plan",
    weeklyPlan: "Weekly Training Plan",
    loadAnalysis: "Weekly Load Analysis",
    totalDistance: "Total Distance:",
    intensityBalance: "Intensity Balance:",
    loadSuggestion: "Load Suggestion:",
    precautions: "Precautions",
    theoryBasis: "Theoretical Basis",
    daniels: "Daniels",
    bompa: "Bompa",
    adoptPlan: "✅ Adopt as Weekly Plan",
    discardPlan: "🔄 Discard & Regenerate",
    heartRate: "HR:",
    duration: "Duration:",
    zone: "Zone",
    adopting: "Adopting...",
    planAdopted: "Training plan adopted successfully!",
    planAdoptFailed: "Adopt failed: ",
    confirmAdopt: "Are you sure to adopt this plan as weekly training plan?",

    // 绑定管理
    bindingManage: "Binding Management",
    headCoach: "Head Coach",
    currentLogin: "(Current Login)",
    bindAssistant: "Bind Assistant",
    bindDoctor: "Bind Doctor",
    none: "None",
    saveBinding: "Save Binding",
    saving: "Saving...",
    bindingSaved: "Binding saved",
    bindingFailed: "Binding failed:",

    // 个人资料
    accountName: "Account",
    roleLabel: "Role",
    userId: "User ID",
    logout: "Logout",

    // 计划弹窗
    editPlan: "Edit Plan",
    createPlanTitle: "Create Plan",
    mainTraining: "Main Training",
    addSet: "+ Add Set",
    cooldown: "Cooldown",
    athletes: "Athletes",
    allTeam: "All Team",
    warmup: "Warmup",
    warmupHint: "e.g: 10min easy jog",
    setNumber: "Set {num}",
    pace: "Pace",
    rest: "Rest",
    addSet: "+ Add Set",
    notes: "Notes",
    updatePlan: "Update Plan",
    publishPlan: "Publish Plan",
    saveFailed: "Save failed: ",
    deleteConfirm: "Are you sure to delete?",
    deleteFailed: "Delete failed: ",
    fillTitleDate: "Please fill in title and date",

    // 训练类型
    sessionTypes: {
      interval: "Interval",
      tempo: "Tempo Run",
      easy: "Easy Run",
      long: "Long Run",
      recovery: "Recovery Run",
      strength: "Strength Training",
      race: "Race",
    },

    // 星期
    weekdays: {
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
      sun: "Sun",
    },
  },

  // ============================================
  // 登录页面
  // ============================================
  auth: {
    appTitle: "脉",
    appSubtitle: "MAI",
    loginTitle: "Sign in to your account",
    registerTitle: "Create new account",
    username: "Username",
    usernamePlaceholder: "Enter your username",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Re-enter your password",
    selectRole: "Select Role",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    contactAdmin: "Please contact admin to reset password",
    login: "Sign In",
    register: "Sign Up",
    noAccount: "Don't have an account? ",
    goRegister: "Register",
    hasAccount: "Already have an account? ",
    goLogin: "Sign In",
    loggingIn: "Signing in...",
    registering: "Signing up...",
    registerSuccess: "Registration successful",
    registeredAs: "Registered as",
    enteringSystem: "Entering system...",
    usernameRequired: "Please enter username",
    passwordRequired: "Please enter password (min 6 characters)",
    passwordMismatch: "Passwords do not match",
    roleRequired: "Please select a role",
    loginFailed: "Login failed",
    registerFailed: "Registration failed",
  },

  // ============================================
  // 报告详情标签
  // ============================================
  result: {
    overallScore: "Overall Score",
    trainingQualityLabel: "Training Quality",
    trainingZoneLabel: "Zone",
    vdotLabel: "VDOT Est.",
    riskAlert: "Immediate Attention Required",
    emotionPrefix: "Emotion",
    fatiguePrefix: "Fatigue",
    recoTitle: "Recommendations",
    coachTitle: "Coach Briefing",
    diaryTitle: "Training Diary",
    recoveryTitle: "Recovery Status",
    intensityFeedbackTitle: "Intensity Details",
    loadManagementTitle: "Load & Recovery",
    acwrLabel: "ACWR",
    loadTrendLabel: "Load Trend",
    monotonyLabel: "Monotony Risk",
    danielsRecoTitle: "Daniels Recommendation",
    periodizationRecoTitle: "Bompa Periodization",
    psychologyTitle: "Psychological Analysis",
    difficultyTitle: "Training Difficulties",
    noData: "No training records",
    backToHome: "← Back to Home",
    back: "Back",
    reportTitle: "Training Report",
  },

  // ============================================
  // 状态等级映射
  // ============================================
  statusLevel: {
    "优秀": "Excellent",
    "正常": "Normal",
    "关注": "Attention",
    "预警": "Alert",
  },

  // ============================================
  // 情绪极性映射
  // ============================================
  polarity: {
    "积极": "Positive",
    "中性": "Neutral",
    "消极": "Negative",
  },

  // ============================================
  // 疲劳等级映射
  // ============================================
  fatigue: {
    "低": "Low",
    "中": "Medium",
    "高": "High",
  },

  // ============================================
  // 助教端
  // ============================================
  assistant: {
    // 导航栏
    navWorkbench: "Home",
    navRecords: "Records",
    navAlerts: "Alerts",

    // 通用
    greetingMorning: "Good morning,",
    greetingAfternoon: "Good afternoon,",
    greetingEvening: "Good evening,",
    role: "Assistant Coach",
    restoreWeek: "Recovery Week",
    save: "Save",
    cancel: "Cancel",
    loading: "Loading...",
    noData: "No data",
    unknown: "Unknown",
    peopleUnit: "athletes",
    myProfile: "My",
    accountInfo: "Account Info",

    // 工作台
    athletes: "Athletes",
    teamAvg: "Team Avg",
    alertCount: "Alerts",
    needAttention: "Athletes Need Attention",
    athleteStatus: "Athlete Status",
    lastTraining: "Last: {date}",
    noRecords: "No records",
    trainingRecords: "Training Records",
    viewAll: "View All",
    viewNotifications: "View Notifications",

    // 记录
    all: "All",
    noSessionRecords: "No session records",
    noFeedback: "No feedback summary",
    coachViewed: "Coach Viewed",
    trainingSession: "Training",

    // 通知
    notifications: "Notifications",
    markAllRead: "Mark All Read",
    alert: "Alert",
    unread: "Unread",
    read: "Read",
    noTodayNotif: "No notifications today",
    noYesterdayNotif: "No notifications yesterday",
    markAllReadBtn: "Mark All Read",
    backToWorkbench: "Back to Workbench",
    today: "Today",
    yesterday: "Yesterday",
    earlier: "Earlier",

    // 运动员详情
    athleteDetail: "Athlete Detail",
    backToWorkbenchBtn: "← Back to Workbench",
    trainingRecord: "Training Records",
    loadingRecords: "Loading...",
    assistantNotes: "Assistant Notes",
    addTrainingNote: "Add Training Note",
    voiceInputNote: "Voice Input",
    submitNote: "Submit Note",
    submitting: "Submitting...",
    noteSubmitted: "Note submitted",
    noteFailed: "Note failed: ",
    historyNotes: "History Notes",
    observation: "Observation",
    evaluation: "Evaluation",
    backToTrainingRecords: "← Back to Training Records",
    noSessionRecords: "No training records",
    recordingStop: "Recording... Tap to stop",
    fatigue: "Fatigue",

    // 报告详情
    athleteFeedback: "Athlete Feedback",
    noAIReport: "No AI report yet",
    noFeedback: "No feedback yet",
    submitNoteBtn: "Submit Note",
    body: "Body",
    mind: "Mind",
    notePlaceholder: "Click microphone to record, or type your evaluation...",
    injuryRisk: "Injury risk detected",
    trainingSession: "Training",

    // 个人资料
    accountName: "Account",
    roleLabel: "Role",
    userId: "User ID",
    logout: "Logout",

    // 通知图标配置
    notifConfig: {
      risk_alert: "Alert",
      injury_alert: "Alert",
      training_feedback: "Training",
      treatment_plan: "Treatment",
      training_note: "Note",
      conflict_alert: "Conflict",
      plan_approval: "Plan",
      general: "General",
    },
  },
};

export default en;
