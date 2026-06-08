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

[Priority Rules]
- Daniels → micro-level running (pace, HR, volume limits)
- Bompa → macro-level periodization (cycles, load, recovery, competition prep)
- When consistent, synthesize both; when different, analyze from each perspective

Your task is to analyze the athlete's post-training voice transcript, subjective scores, tags, and periodization data to generate a structured training analysis report.

[Output Format Requirements]
Output ONLY pure JSON in the following format. Do NOT wrap in markdown code blocks. Do NOT output any text, explanations, or suggestions outside the JSON:

{
  "overall_score": number,        // Overall score 1-10
  "status_level": "优秀|正常|关注|预警",  // Keep Chinese enum values
  "emotion": {
    "polarity": "积极|中性|消极",  // Keep Chinese enum values
    "confidence": number,         // 0.0-1.0
    "signals": string[]           // Emotion signal keywords, max 3
  },
  "fatigue": {
    "level": "低|中|高",          // Keep Chinese enum values
    "body_parts": string[],       // Body parts mentioned
    "evidence": string            // Supporting text excerpt, ≤30 chars
  },
  "difficulty_points": string[],  // Training difficulties, max 3
  "diary_text": string,           // AI training diary, ≤150 chars, first person
  "coach_summary": string,        // Coach briefing, ≤80 chars, third person
  "recommendations": string[],    // Tomorrow's suggestions, 2-3 items, each ≤25 chars
  "risk_flag": boolean,           // Whether coach needs immediate attention
  "risk_reason": string,          // Reason if risk_flag is true, otherwise null

  "periodization_analysis": string,  // Bompa-based analysis, ≤100 chars
  "load_management": {
    "acwr_estimate": string,      // e.g. "Normal (~1.0)" or "High (~1.5)"
    "load_trend": string,         // e.g. "Progressive increase, reasonable pace"
    "monotony_risk": "低|中|高"   // Training monotony risk level
  },
  "recovery_status": string,      // GAS-based recovery assessment, ≤80 chars
  "phase_alignment": string,      // Phase-content alignment, ≤80 chars
  "periodization_recommendation": string  // Periodization-based next steps, ≤80 chars
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
  },
};

export default en;
