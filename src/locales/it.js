const it = {
  lang: "it",
  langLabel: "IT",

  // Nuova UI
  appTitle: "Analisi Allenamento",
  steps: ["Input Vocale", "Conferma Dati", "Risultato"],

  // Pagina input vocale
  tapToSpeak: "Tocca il microfono per iniziare la registrazione",
  listening: "Registrazione in corso, parla...",
  voiceRecorded: "Registrazione completa, tocca conferma per continuare",
  voiceTranscript: "Trascrizione Vocale",
  confirmAndContinue: "Conferma e Continua",
  voiceHint: "Descrivi la tua esperienza di allenamento, le condizioni fisiche, le difficoltà, ecc.",
  voiceNotSupported: "Riconoscimento vocale non supportato",
  voiceNotSupportedHint: "Usa Chrome o Edge",

  // Pagina conferma dati
  backToVoice: "Registra di nuovo",
  sectionBasic: "Informazioni Base",
  sectionScores: "Punteggi Soggettivi (1-10)",
  sectionTags: "Tag Rapidi",
  sectionTranscript: "Trascrizione Vocale",
  sectionHistory: "Dati Storici (opzionale)",
  startAnalysis: "Avvia Analisi",

  // Pagina risultato
  backToEdit: "Modifica Dati",
  restartRecording: "Nuova Registrazione",

  // Barra superiore (legacy)
  title: "Workbench Prompt Analisi Allenamento",
  subtitle: "Modifica template · Inserisci dati · Testa i risultati AI in tempo reale",

  // Pulsanti
  runBtn: "Avvia Analisi ▶",
  loadingBtn: "Analisi in corso...",
  resetBtn: "Ripristina dati di esempio",
  showRaw: "Mostra JSON grezzo",
  showCard: "Mostra vista schede",

  // Etichette tab
  tabSystem: "Prompt di Sistema",
  tabUser: "Modello Utente",
  tabData: "Dati di Test",
  tabResult: "Risultato Analisi",
  tabDone: "✓",

  // Tab Prompt di Sistema
  systemDesc: "Definisci il ruolo dell'AI, il formato di output e lo schema JSON. Questa è la struttura principale del prompt.",
  systemHint: "Suggerimento: le annotazioni dei campi nello schema JSON guidano l'AI a produrre output più precisi. Clicca 'Avvia Analisi' per verificare dopo la modifica.",

  // Tab Modello Utente
  userDesc: "Inserisci dati dinamici con {{variabile}}. Variabili disponibili:",
  userPreview: "Anteprima (variabili compilate)",

  // Tab Dati di Test
  placeholderTranscript: "Incolla il contenuto della trascrizione vocale...",

  // Tab Risultato — animazione di caricamento
  loadingMsgs: ["Chiamata al motore AI...", "Analisi semantica vocale...", "Generazione struttura report..."],

  // Tab Risultato — stato vuoto
  emptyHint: "Clicca 'Avvia Analisi' in alto a destra per visualizzare i risultati",

  // Messaggi di errore
  errorPrefix: "Analisi fallita: ",
  errorSuffix: "\n\nL'output grezzo è mostrato in 'JSON grezzo'",

  // Etichette campi
  fields: {
    athlete_name: "Nome Atleta",
    session_name: "Sessione di Allenamento",
    date: "Data",
    body_score: "Punteggio Fisico",
    mind_score: "Punteggio Mentale",
    difficulty_score: "Padroneggiamento Difficoltà",
    tags: "Tag",
    transcript: "Trascrizione Vocale",
    week_body_avg: "Media Fisica Settimanale",
    week_mind_avg: "Media Mentale Settimanale",
    recent_trend: "Tendenza Recente",
  },

  // Etichette schede risultato
  result: {
    overallScore: "Punteggio Complessivo",
    riskAlert: "⚠ Attenzione Immediata Necessaria",
    emotionFatigue: "Emozione e Affaticamento",
    emotionPrefix: "Emozione",
    fatiguePrefix: "Affaticamento",
    difficultyTitle: "Difficoltà di Allenamento",
    diaryTitle: "Diario di Allenamento",
    coachTitle: "Briefing per l'Allenatore",
    recoTitle: "Raccomandazioni per Domani",
  },

  // Mappatura enum: livello stato
  statusLevel: {
    优秀: "Eccellente",
    正常: "Normale",
    关注: "Attenzione",
    预警: "Allerta",
  },

  // Mappatura enum: polarità emozione
  polarity: {
    积极: "Positivo",
    中性: "Neutro",
    消极: "Negativo",
  },

  // Mappatura enum: livello affaticamento
  fatigue: {
    低: "Basso",
    中: "Medio",
    高: "Alto",
  },

  // Colori stato
  statusColor: {
    优秀: { bg: "#E1F5EE", text: "#0F6E56", border: "#9FE1CB" },
    正常: { bg: "#E6F1FB", text: "#0C447C", border: "#85B7EB" },
    关注: { bg: "#FAEEDA", text: "#633806", border: "#FAC775" },
    预警: { bg: "#FCEBEB", text: "#791F1F", border: "#F09595" },
    Eccellente: { bg: "#E1F5EE", text: "#0F6E56", border: "#9FE1CB" },
    Normale: { bg: "#E6F1FB", text: "#0C447C", border: "#85B7EB" },
    Attenzione: { bg: "#FAEEDA", text: "#633806", border: "#FAC775" },
    Allerta: { bg: "#FCEBEB", text: "#791F1F", border: "#F09595" },
  },

  polarityColor: {
    积极: "#1D9E75",
    中性: "#888780",
    消极: "#E24B4A",
    Positivo: "#1D9E75",
    Neutro: "#888780",
    Negativo: "#E24B4A",
  },

  fatigueColor: {
    低: "#1D9E75",
    中: "#BA7517",
    高: "#E24B4A",
    Basso: "#1D9E75",
    Medio: "#BA7517",
    Alto: "#E24B4A",
  },

  // Prompt di sistema (versione italiana)
  systemPrompt: `Sei un analista professionista di dati di allenamento sportivo, esperto in scienze dello sport, psicologia dell'esercizio e teoria del recupero.

Il tuo compito è analizzare la trascrizione vocale dell'atleta dopo l'allenamento, i punteggi soggettivi e i tag, per generare un report strutturato di analisi dell'allenamento come riferimento per l'allenatore.

[Requisiti del formato di output]
Produci l'output rigorosamente nel seguente formato JSON, senza alcun contenuto al di fuori del JSON:

{
  "overall_score": number,        // Punteggio complessivo 1-10
  "status_level": "优秀|正常|关注|预警",  // Mantieni i valori enum cinesi per coerenza
  "emotion": {
    "polarity": "积极|中性|消极",  // Mantieni i valori enum cinesi
    "confidence": number,         // 0.0-1.0
    "signals": string[]           // Parole chiave dei segnali emotivi, max 3
  },
  "fatigue": {
    "level": "低|中|高",          // Mantieni i valori enum cinesi
    "body_parts": string[],       // Parti del corpo menzionate
    "evidence": string            // Estratto di testo a supporto, ≤30 caratteri
  },
  "difficulty_points": string[],  // Difficoltà riportate dall'atleta, max 3
  "diary_text": string,           // Diario generato dall'AI, ≤150 caratteri, prima persona, tono naturale
  "coach_summary": string,        // Briefing per l'allenatore, ≤80 caratteri, terza persona oggettiva
  "recommendations": string[],    // Suggerimenti per domani, 2-3 elementi, ciascuno ≤25 caratteri
  "risk_flag": boolean,           // Se l'allenatore necessita attenzione immediata
  "risk_reason": string           // Motivo se risk_flag è true, altrimenti null
}

IMPORTANTE: Tutti i campi di testo (diary_text, coach_summary, recommendations, difficulty_points, segnali emotivi, risk_reason) devono essere scritti in italiano. Mantieni i valori enum (status_level, emotion.polarity, fatigue.level) in cinese per coerenza di sistema.`,

  // Modello utente (versione italiana)
  userTemplate: `【Informazioni Base Atleta】
Nome: {{athlete_name}}
Sessione di Allenamento: {{session_name}}
Data: {{date}}

【Punteggi Soggettivi (1-10)】
Stato Fisico: {{body_score}}
Stato Mentale: {{mind_score}}
Padroneggiamento Difficoltà: {{difficulty_score}}

【Tag Rapidi】
{{tags}}

【Trascrizione Vocale】
{{transcript}}

【Dati di Riferimento Storici】
Media Fisica Settimanale: {{week_body_avg}}
Media Mentale Settimanale: {{week_mind_avg}}
Tendenza Ultime 3 Sessioni: {{recent_trend}}

Genera un report strutturato di analisi dell'allenamento basato sulle informazioni sopra.`,

  // Dati di esempio (versione italiana)
  sampleData: {
    athlete_name: "Marco Rossi",
    session_name: "Sessione Velocità e Resistenza",
    date: "2025-12-18",
    body_score: "7",
    mind_score: "8",
    difficulty_score: "5",
    tags: "Dolore al ginocchio, buona forma generale",
    transcript: "L'allenamento di oggi è andato bene, ho rallentato un po' negli ultimi due set. Il ginocchio fa un po' male, ma il mio stato mentale è buono. Ho ancora bisogno di praticare di più l'accelerazione — non ho ancora padroneggiato completamente il ritmo. Per il resto è andato tutto bene.",
    week_body_avg: "7.1",
    week_mind_avg: "7.4",
    recent_trend: "7→6→7 (ultimi 3 punteggi fisici)",
  },
};

export default it;
