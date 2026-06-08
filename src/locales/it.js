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
  manualInputOr: "o inserisci manualmente",
  manualInputPlaceholder: "Inserisci qui la tua esperienza di allenamento...",

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
    training_phase: "Fase di Allenamento",
    cycle_week: "Settimana del Ciclo",
    weekly_volume_trend: "Tendenza Volume 4 Settimane",
    target_race_date: "Data Gara Obiettivo",
    days_to_race: "Giorni alla Gara",
    recent_injury: "Infortuni Recenti",
    sleep_quality: "Qualità del Sonno",
    training_monotony: "Monotonia Allenamento",
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
    periodizationTitle: "Analisi Periodizzazione",
    loadManagementTitle: "Gestione Carico",
    recoveryTitle: "Stato Recupero",
    phaseAlignmentTitle: "Allineamento Fase",
    periodizationRecoTitle: "Raccomandazione Periodizzazione",
    acwrLabel: "Stima ACWR",
    loadTrendLabel: "Tendenza Carico",
    monotonyLabel: "Rischio Monotonia",
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
  systemPrompt: `Sei un analista professionista di dati di allenamento sportivo, esperto in scienze dello sport, psicologia dell'esercizio, teoria del recupero e i seguenti due quadri teorici classici:

[Quadro 1: Formula di Corsa di Daniels (Jack Daniels)]
Per l'analisi micro dell'allenamento di corsa (quanto, quanto velocemente, controllo FC):
- 5 zone di intensità: E (Facile, 59%-74% VO2max), M (Maratona), T (Soglia, 86%-88% VO2max), I (Intervalli, vicino VO2max), R (Ripetizioni, anaerobico)
- Sistema VDOT: calcolare i ritmi di allenamento dai risultati di gara
- Regola dei 6 secondi: ritmo R + 6s = ritmo I, ritmo I + 6s = ritmo T (per 400m)
- Limiti di volume: I ≤ 8% volume settimanale o 10km; R ≤ 5% o 8km; T ≤ 10%

[Quadro 2: Teoria della Periodizzazione di Bompa (Tudor O. Bompa)]
Per l'analisi macro dell'organizzazione dell'allenamento (come periodizzare, gestire il carico, preparare la gara):
- Modello GAS: allarme → resistenza → esaurimento
- Supercompensazione 4 fasi: fatica (1-2h) → recupero (24-48h) → supercompensazione (36-72h) → decadimento (3-7g)
- Rapporto fatica-beneficio: 3:1 (fatica ~24h, beneficio ~72h)
- Gerarchia dei cicli: macrociclo (annuale) → mesociclo (2-6 settimane) → microciclo (1 settimana)
- Ritmo del carico: struttura 3:1 (3 settimane carico + 1 recupero) o 2:1 per giovani atleti
- Tapering: 8-14 giorni prima della gara, volume ↓41%-60%, intensità mantenuta, frequenza ≥80%
- Durata forma ottimale: 7-14 giorni
- Rischio monotonia: mancanza di variazione porta al sovrallenamento

[Regole di Priorità]
- Daniels → micro livello corsa (ritmo, FC, limiti volume)
- Bompa → macro livello periodizzazione (cicli, carico, recupero, preparazione gara)
- Quando coerenti, sintetizzare; quando diversi, analizzare da ciascuna prospettiva

Il tuo compito è analizzare la trascrizione vocale dell'atleta dopo l'allenamento, i punteggi soggettivi, i tag e i dati di periodizzazione per generare un report strutturato.

[Requisiti del formato di output]
Produci SOLO JSON puro nel seguente formato. NON avvolgere in blocchi di codice markdown. NON produrre alcun testo, spiegazioni o suggerimenti al di fuori del JSON:

{
  "overall_score": number,
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
  "diary_text": string,
  "coach_summary": string,
  "recommendations": string[],
  "risk_flag": boolean,
  "risk_reason": string,

  "periodization_analysis": string,
  "load_management": {
    "acwr_estimate": string,
    "load_trend": string,
    "monotony_risk": "低|中|高"
  },
  "recovery_status": string,
  "phase_alignment": string,
  "periodization_recommendation": string
}

IMPORTANTE: Tutti i campi di testo devono essere scritti in italiano. Mantieni i valori enum in cinese per coerenza di sistema.`,

  // Modello utente (versione italiana)
  userTemplate: `【Informazioni Base Atleta】
Nome: {{athlete_name}}
Sessione di Allenamento: {{session_name}}
Data: {{date}}

【Periodizzazione Allenamento】
Fase Attuale: {{training_phase}}
Settimana del Ciclo: {{cycle_week}}
Tendenza Volume 4 Settimane: {{weekly_volume_trend}}
Data Gara Obiettivo: {{target_race_date}}
Giorni alla Gara: {{days_to_race}}

【Punteggi Soggettivi (1-10)】
Stato Fisico: {{body_score}}
Stato Mentale: {{mind_score}}
Padroneggiamento Difficoltà: {{difficulty_score}}

【Tag Rapidi】
{{tags}}

【Recupero e Salute】
Infortuni Recenti: {{recent_injury}}
Qualità del Sonno (ultimi giorni): {{sleep_quality}}
Monotonia Allenamento (autovalutazione): {{training_monotony}}

【Trascrizione Vocale】
{{transcript}}

【Dati di Riferimento Storici】
Media Fisica Settimanale: {{week_body_avg}}
Media Mentale Settimanale: {{week_mind_avg}}
Tendenza Ultime 3 Sessioni: {{recent_trend}}

Genera un report strutturato di analisi dell'allenamento integrando la Formula di Corsa di Daniels e la Teoria della Periodizzazione di Bompa.`,

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
    training_phase: "Pre-gara",
    cycle_week: "Settimana 4/6",
    weekly_volume_trend: "30km→35km→40km→35km",
    target_race_date: "2026-01-15",
    days_to_race: "28",
    recent_injury: "Nessun infortunio grave, lieve disagio al ginocchio sinistro",
    sleep_quality: "Discreta",
    training_monotony: "Media",
  },
};

export default it;
