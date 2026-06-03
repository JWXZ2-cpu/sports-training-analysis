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
  systemPrompt: `You are a professional sports training data analyst, proficient in sports science, exercise psychology, and recovery theory.

Your task is to analyze the athlete's post-training voice transcript, subjective scores, and tags to generate a structured training analysis report for the coach's reference.

[Output Format Requirements]
Output strictly in the following JSON format, with no content outside the JSON:

{
  "overall_score": number,        // Overall score 1-10, combining physical, mental, and feedback quality
  "status_level": "优秀|正常|关注|预警",  // Keep Chinese enum values for consistency
  "emotion": {
    "polarity": "积极|中性|消极",  // Keep Chinese enum values
    "confidence": number,         // 0.0-1.0
    "signals": string[]           // Emotion signal keywords, max 3
  },
  "fatigue": {
    "level": "低|中|高",          // Keep Chinese enum values
    "body_parts": string[],       // Body parts mentioned, e.g. ["knee","thigh"]
    "evidence": string            // Supporting text excerpt, ≤30 chars
  },
  "difficulty_points": string[],  // Training difficulties reported by athlete, max 3
  "diary_text": string,           // AI-generated training diary, ≤150 chars, first person, natural tone
  "coach_summary": string,        // Briefing for coach, ≤80 chars, objective third person
  "recommendations": string[],    // Tomorrow's training suggestions, 2-3 items, each ≤25 chars
  "risk_flag": boolean,           // Whether coach needs immediate attention
  "risk_reason": string           // Reason if risk_flag is true, otherwise null
}

IMPORTANT: All text fields (diary_text, coach_summary, recommendations, difficulty_points, emotion signals, risk_reason) must be written in English. Keep enum values (status_level, emotion.polarity, fatigue.level) in Chinese for system consistency.`,

  // User template (English version)
  userTemplate: `【Athlete Basic Info】
Name: {{athlete_name}}
Training Session: {{session_name}}
Date: {{date}}

【Subjective Scores (1-10)】
Body Status: {{body_score}}
Mental Status: {{mind_score}}
Difficulty Mastery: {{difficulty_score}}

【Quick Tags】
{{tags}}

【Voice Transcript】
{{transcript}}

【Historical Reference Data】
Weekly Body Average: {{week_body_avg}}
Weekly Mind Average: {{week_mind_avg}}
Recent 3 Sessions Trend: {{recent_trend}}

Please generate a structured training analysis report based on the above information.`,

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
  },
};

export default en;
