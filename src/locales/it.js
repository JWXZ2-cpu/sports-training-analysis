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
    today_plan_content: "Piano di Oggi",
    today_plan_zone: "Zona Obiettivo",
    today_plan_pace: "Ritmo Obiettivo",
    today_plan_distance: "Distanza Stimata",
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
    trainingZoneLabel: "Zona Allenamento",
    vdotLabel: "Stima VDOT",
    trainingQualityLabel: "Qualità Allenamento",
    intensityFeedbackTitle: "Analisi Zona Intensità",
    danielsRecoTitle: "Raccomandazione Daniels",
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

[Quadro 3: Psicologia dello Sport (Arnold LeUnes)]
Per l'analisi dello stato mentale dell'atleta (emozione, motivazione, fiducia, ansia):
- Ansia 3 dimensioni: ansia somatica (tensione muscolare), ansia cognitiva (pensieri negativi), fiducia-stato
- Teoria dell'attribuzione (Weiner): successo/fallimento = f(abilità, sforzo, difficoltà compito, fortuna)
- Teoria dell'auto-efficacia (Bandura): la fiducia è un predittore chiave della performance
- Obiettivi di achievement: obiettivi di padronanza vs obiettivi di prestazione
- Motivazione intrinseca vs estrinseca: ricompense eccessive possono danneggiare la motivazione intrinseca
- Controllo cognitivo: blocco del pensiero, contrasto pensieri negativi, ristrutturazione
- Risposta infortunio 3 fasi: depressione → negazione → determinazione ad affrontare
- Modello attenzione: ampiezza (largo-stretto) × direzione (interno-esterno)

[Riconoscimento Stati Psicologici Profondi]
Identificare questi segnali psicologici dal testo/voce dell'atleta:
Motivazione: forte intrinseca / normale / in calo / persa
Emozione: positivo / neutro / negativo / ansioso / arrabbiato
Fiducia: sicuro / incerto / carente / eccessivo
Attenzione: focalizzato / distratto / iper-focalizzato
Pressione: allenamento / gara / esterna / interna
Recupero: ben recuperato / normale / insufficiente / burnout

[Regole di Priorità]
- Daniels → micro livello corsa (ritmo, FC, limiti volume)
- Bompa → macro livello periodizzazione (cicli, carico, recupero, preparazione gara)
- Psicologia dello Sport → analisi stato mentale atleta (emozione, motivazione, fiducia, ansia)
- Quando coerenti, sintetizzare tutti; quando diversi, analizzare da ciascuna prospettiva

[Regole Messaggio Cura Atleta]
- Se emozione negativa/ansia/calo motivazione → messaggio di cura caldo
- Se emozione positiva → messaggio incoraggiante
- Se neutro → care_message null
- NON esporre mai analisi psicologica professionale nel care_message

Il tuo compito è analizzare la trascrizione vocale dell'atleta dopo l'allenamento, i punteggi soggettivi, i tag e i dati di periodizzazione per generare un report strutturato.

[PRINCIPIO DUALE CRITICO]
Questo sistema usa un'output a doppia vista: ciò che gli atleti vedono e ciò che gli allenatori vedono è completamente diverso.
- Vista atleta = diario di allenamento (solo fatti, nessuna analisi professionale, nessun termine tecnico)
- Vista allenatore = analista tattico (supporto decisionale professionale completo)

Gli atleti NON devono MAI vedere: zone di allenamento (E/M/T/I/R), valori VDOT, valutazioni qualità, analisi carico (ACWR), analisi periodizzazione, valutazioni rischi, consigli professionali.

[Requisiti del formato di output]
Produci SOLO JSON puro nel seguente formato:

{
  "athlete_view": {
    "summary": "string (≤30 caratteri, descrizione fattuale, nessun termine tecnico)",
    "training_log": ["Completato riscaldamento 10min", "Completati 5 intervalli", "Completato defaticamento"],
    "highlights": ["Controllo ritmo stabile nei primi set", "Miglioramento rispetto alla volta scorsa"],
    "areas_to_work": ["Lieve calo ritmo alla fine, mantenere il ritmo la prossima volta"],
    "encouragement": "string (breve incoraggiamento positivo, ≤20 caratteri)",
    "care_message": "string|null (messaggio di cura se emozione negativa rilevata, incoraggiante se positivo, null se neutro)"
  },

  "coach_view": {
    "detailed_analysis": "string (≤100 caratteri, analisi professionale)",
    "zone_assessment": "string (≤50 caratteri, valutazione zona intensità)",
    "periodization_note": "string (≤50 caratteri, note periodizzazione)",
    "psychology_analysis": "string (≤80 caratteri, analisi stato mentale basata sulla psicologia dello sport)",
    "psychology_assessment": {
      "detected_signals": ["calo_motivazione", "ansia"],
      "analysis": "string (≤120 caratteri, analisi profonda dello stato psicologico)",
      "suggestion": "string (≤80 caratteri, suggerimenti di intervento psicologico)"
    },
    "risk_assessment": "string (≤50 caratteri, valutazione rischio)",
    "ai_suggestion": "string (≤80 caratteri, suggerimento AI, nota: usare giudizio professionale)"
  },

  "emotion_display": "😊 Positivo",
  "fatigue_display": "Basso",

  "diary_text": "string (diario allenamento AI, ≤150 caratteri, prima persona)",

  "overall_score": number,        // Deve essere 1.0-10.0, MAI superare 10
  "status_level": "优秀|正常|关注|预警",
  "emotion": {"polarity": "积极|中性|消极", "confidence": number, "signals": string[]},
  "fatigue": {"level": "低|中|高", "body_parts": string[], "evidence": string},
  "difficulty_points": string[],
  "training_zone": "E|M|T|I|R",
  "zone_distribution": {"E": number, "M": number, "T": number, "I": number, "R": number},
  "vdot_estimate": number,
  "training_quality": "优秀|良好|一般|需改进",
  "intensity_feedback": "string",
  "periodization_analysis": "string",
  "load_management": {"acwr_estimate": "string", "load_trend": "string", "monotony_risk": "低|中|高"},
  "recovery_status": "string",
  "phase_alignment": "string",
  "coach_summary": "string",
  "recommendations": string[],
  "daniels_recommendation": "string",
  "periodization_recommendation": "string",
  "risk_flag": boolean,
  "risk_reason": "string|null"
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

【Piano di Allenamento di Oggi】
Contenuto: {{today_plan_content}}
Zona Obiettivo: {{today_plan_zone}}
Ritmo Obiettivo: {{today_plan_pace}}
Distanza Stimata: {{today_plan_distance}}

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

【Stato Mentale】
Tag Umore: {{mood_tags}}
Descrizione Umore: {{mood_description}}

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
    today_plan_content: "Intervalli 1000m x 5, ritmo 3:45/km, recupero 90s",
    today_plan_zone: "I (Intervalli)",
    today_plan_pace: "3:45/km",
    today_plan_distance: "8km",
  },

  // Chiavi condivise
  loading: "Caricamento...",
  unknown: "Sconosciuto",
  back: "Indietro",
  confirm: "Conferma",
  cancel: "Annulla",
  save: "Salva",
  delete: "Elimina",
  edit: "Modifica",
  close: "Chiudi",
  retry: "Riprova",
  error: {
    loadFailed: "Caricamento fallito, riprova",
    pageError: "Si è verificato un problema",
    pageErrorMsg: "Spiacente, si è verificato un errore durante il rendering. Puoi provare a ricare o tornare alla pagina iniziale.",
    reload: "Ricarica",
    goHome: "Vai alla Home",
    devDetails: "Dettagli Errore (Modalità Sviluppo)",
  },
  time: {
    justNow: "Ora",
    minutesAgo: "{n}min fa",
    hoursAgo: "{n}h fa",
    daysAgo: "{n}g fa",
  },

  // ============================================
  // Allenatore Principale
  // ============================================
  coach: {
    // Navigazione
    navWorkbench: "Home",
    navPlan: "Piano",
    navRecord: "Registro",
    navNotify: "Avvisi",

    // Generale
    greetingMorning: "Buongiorno,",
    greetingAfternoon: "Buon pomeriggio,",
    greetingEvening: "Buonasera,",
    role: "Allenatore Principale",
    save: "Salva",
    cancel: "Annulla",
    delete: "Elimina",
    edit: "Modifica",
    loading: "Caricamento...",
    noData: "Nessun dato",
    confirm: "Conferma",
    today: "Oggi",
    yesterday: "Ieri",
    earlier: "Prima",
    normal: "Normale",
    attention: "Attenzione",
    alert: "Avviso",
    rest: "Riposo",
    unknown: "Sconosciuto",
    peopleUnit: "atleti",
    myProfile: "Profilo",
    justNow: "Ora",
    minutesAgo: "{n}min fa",
    hoursAgo: "{n}h fa",
    daysAgo: "{n}g fa",
    saving: "Salvataggio...",
    saveFailed: "Salvataggio fallito:",
    deleteConfirm: "Sei sicuro di voler eliminare?",
    deleteFailed: "Eliminazione fallita:",
    fillTitleDate: "Inserisci titolo e data",
    inputRequired: "Inserisci il contenuto",
    getReportFailed: "Report fallito:",
    recordingStop: "Registrazione... Tocca per fermare",
    noAIReport: "Nessun report AI",
    noRecords: "Nessun registro",
    back: "← Indietro",

    // Scheda Home
    todayTraining: "Allenamento di Oggi",
    restDay: "Giorno di Riposo",
    teamAvg: "Media Squadra",
    alertCount: "Avvisi",
    needAttention: "Atleti da Monitorare",
    needFollow: "Da Monitorare",
    athleteStatus: "Stato Atleti",
    lastTraining: "Ultimo: {date}",
    trainingPlan: "Piano di Allenamento",
    trainingRecords: "Registro Allenamenti",

    // Scheda Piano
    aiAssistPlan: "Piano Assistito da AI",
    aiAssistDesc: "Inserisci obiettivi e fase di allenamento, l'AI genererà suggerimenti professionali",
    createPlan: "+ Crea Piano",
    editPlan: "Modifica Piano",
    updatePlan: "Aggiorna Piano",
    publishPlan: "Pubblica Piano",
    lastWeek: "‹ Settimana Precedente",
    nextWeek: "Settimana Successiva ›",
    addPlan: "+ Aggiungi",
    noPlan: "☀️ Giorno di Riposo",
    todayTag: "Oggi",
    trainingName: "Nome Allenamento",
    trainingNameHint: "es: Sessione Velocità e Resistenza",
    trainingDate: "Data Allenamento",
    trainingType: "Tipo Allenamento",
    restDayType: "Riposo",
    intensityZone: "Zona Intensità",
    targetPace: "Ritmo Obiettivo",
    targetPaceHint: "es: 4:10-4:20/km",
    targetHR: "FC Obiettivo",
    targetHRHint: "es: 170-180bpm",
    estDistance: "Distanza Stimata",
    estDistanceHint: "es: 8km",
    estDuration: "Durata Stimata",
    estDurationHint: "es: 50min",
    athletes: "Atleti",
    allTeam: "Tutta la Squadra",
    warmup: "Riscaldamento",
    warmupHint: "es: 10min corsa leggera",
    notes: "Note",
    mainTraining: "Allenamento Principale",
    cooldown: "Defaticamento",
    setNumber: "Serie {num}",
    addSet: "+ Aggiungi Serie",
    restDayLabel: "Riposo",
    warmupLabel: "Riscaldamento",

    // Scheda Registro
    trainingSession: "Sessione",
    todayRecords: "Oggi",
    weekRecords: "Questa Settimana",
    monthRecords: "Questo Mese",
    step1: "Data Allenamento",
    step2: "Tipo Allenamento",
    step3: "Contenuto Sessione",
    selectType: "Seleziona tipo",
    voiceRecord: "Registra Sessione Vocale",
    voiceRecordHint: "Descrivi la sessione di oggi, es: intervalli 400m 10 serie, Marco Rossi miglior tempo 58s...",
    aiParsing: "Analisi AI...",
    confirmSubmit: "Conferma Invio",
    recentRecords: "Registri Recenti",
    recordsCount: "{count} registri",
    viewAllHistory: "Vedi Tutta la Cronologia",
    historyRecords: "Cronologia Allenamenti",
    noRecordsYet: "Nessun registro",
    trainingRecord: "Registro",
    aiParseResult: "Risultato Analisi AI",
    sessionType: "Tipo Sessione",
    sessionSummary: "Riepilogo",
    athleteRecords: "Registri Atleti",
    overallEvaluation: "Valutazione Complessiva",
    followUpArrangement: "Prossimi Passi",
    keyObservations: "Osservazioni Chiave",
    recognizing: "Riconoscimento...",
    month: "/",

    // Scheda Notifiche
    notifications: "Notifiche",
    markAllRead: "Segna Tutto Letto",
    unread: "Non Letto",
    read: "Letto",
    noTodayNotif: "Nessuna notifica oggi",
    noYesterdayNotif: "Nessuna notifica ieri",
    markAllReadBtn: "Segna Tutto Come Letto",
    backToWorkbench: "Torna alla Home",

    // Dettaglio atleta
    loadingRecords: "Caricamento...",
    assistantNotes: "Note Assistente",

    // Dettaglio report
    athleteFeedback: "Feedback Atleta",

    // Piano AI
    aiSuggestionTitle: "Piano Allenamento Assistito da AI",
    trainingGoal: "Obiettivo Allenamento",
    currentPhase: "Fase Attuale",
    targetAthletes: "Atleti Destinatari",
    selectAll: "Seleziona Tutti",
    daysToRace: "Giorni alla Gara (opzionale)",
    daysToRaceHint: "Opzionale",
    specialNotes: "Note Speciali (opzionale)",
    specialNotesHint: "es: Marco Rossi ha un infortunio al ginocchio, evitare ad alto impatto",
    generatePlan: "🧠 Genera Piano di Allenamento",
    generating: "Generazione...",
    aiAnalyzing: "L'AI sta creando il piano basato su Daniels e Bompa...",
    analyzingDetail: "Analisi dati atleti · Calcolo carico ottimale · Generazione piano settimanale",
    weeklyPlan: "Piano Settimanale",
    loadAnalysis: "Analisi Carico Settimanale",
    totalDistance: "Distanza Totale:",
    intensityBalance: "Bilanciamento Intensità:",
    loadSuggestion: "Suggerimento Carico:",
    precautions: "Precauzioni",
    theoryBasis: "Basi Teoriche",
    daniels: "Daniels",
    bompa: "Bompa",
    adoptPlan: "✅ Adotta come Piano Settimanale",
    discardPlan: "🔄 Scarta e Rigenera",
    heartRate: "FC:",
    duration: "Durata:",
    zone: "Zona",
    adopting: "Adozione...",
    planAdopted: "Piano adottato con successo!",
    planAdoptFailed: "Adozione fallita: ",
    confirmAdopt: "Sei sicuro di adottare questo piano?",

    // Gestione vincoli
    bindingManage: "Gestione Vincoli",
    headCoach: "Allenatore Principale",
    currentLogin: "(Login Attuale)",
    bindAssistant: "Collega Assistente",
    bindDoctor: "Collega Medico",
    none: "Nessuno",
    saveBinding: "Salva Vincoli",
    bindingSaved: "Vincoli salvati",
    bindingFailed: "Salvataggio vincoli fallito:",

    // Profilo
    accountName: "Account",
    roleLabel: "Ruolo",
    userId: "ID Utente",
    logout: "Esci",

    // Tipi sessione
    sessionTypes: {
      interval: "Intervalli",
      tempo: "Corsa Ritmo",
      easy: "Corsa Facile",
      long: "Corsa Lunga",
      recovery: "Recupero",
      strength: "Allenamento Forza",
      race: "Gara",
    },

    // Giorni settimana
    weekdays: {
      mon: "Lun",
      tue: "Mar",
      wed: "Mer",
      thu: "Gio",
      fri: "Ven",
      sat: "Sab",
      sun: "Dom",
    },
  },

  // ============================================
  // Pagina di Login
  // ============================================
  auth: {
    appTitle: "Sistema di Analisi Allenamento",
    appSubtitle: "Analisi Allenamento Sportivo",
    loginTitle: "Accedi al tuo account",
    registerTitle: "Crea un nuovo account",
    username: "Nome utente",
    usernamePlaceholder: "Inserisci il tuo nome utente",
    password: "Password",
    passwordPlaceholder: "Inserisci la tua password",
    confirmPassword: "Conferma Password",
    confirmPasswordPlaceholder: "Re-inserisci la tua password",
    selectRole: "Seleziona Ruolo",
    rememberMe: "Ricordami",
    forgotPassword: "Password dimenticata?",
    contactAdmin: "Contatta l'amministratore per reimpostare la password",
    login: "Accedi",
    register: "Registrati",
    noAccount: "Non hai un account? ",
    goRegister: "Registrati",
    hasAccount: "Hai già un account? ",
    goLogin: "Accedi",
    loggingIn: "Accesso in corso...",
    registering: "Registrazione in corso...",
    registerSuccess: "Registrazione completata",
    registeredAs: "Registrato come",
    enteringSystem: "Accesso al sistema...",
    usernameRequired: "Inserisci il nome utente",
    passwordRequired: "Inserisci la password (min 6 caratteri)",
    passwordMismatch: "Le password non corrispondono",
    roleRequired: "Seleziona un ruolo",
    loginFailed: "Accesso fallito",
    registerFailed: "Registrazione fallita",
  },

  // ============================================
  // Fine Assistente
  // ============================================
  assistant: {
    // Navigazione
    navWorkbench: "Home",
    navRecords: "Registro",
    navAlerts: "Avvisi",

    // Generale
    greetingMorning: "Buongiorno,",
    greetingAfternoon: "Buon pomeriggio,",
    greetingEvening: "Buonasera,",
    role: "Assistente Allenatore",
    restoreWeek: "Settimana di Recupero",
    save: "Salva",
    cancel: "Annulla",
    loading: "Caricamento...",
    noData: "Nessun dato",
    unknown: "Sconosciuto",
    peopleUnit: "atleti",
    myProfile: "Profilo",
    accountInfo: "Informazioni Account",

    // Banco di lavoro
    athletes: "Atleti",
    teamAvg: "Media Squadra",
    alertCount: "Avvisi",
    needAttention: "Atleti da Monitorare",
    athleteStatus: "Stato Atleti",
    lastTraining: "Ultimo: {date}",
    noRecords: "Nessun registro",
    trainingRecords: "Registro Allenamenti",
    viewAll: "Vedi Tutto",
    viewNotifications: "Vedi Notifiche",

    // Registro
    all: "Tutti",
    noSessionRecords: "Nessun registro sessione",
    noFeedback: "Nessun riepilogo feedback",
    coachViewed: "Visto dall'Allenatore",
    trainingSession: "Sessione",

    // Notifiche
    notifications: "Notifiche",
    markAllRead: "Segna Tutto Come Letto",
    alert: "Avviso",
    unread: "Non Letto",
    read: "Letto",
    noTodayNotif: "Nessuna notifica oggi",
    noYesterdayNotif: "Nessuna notifica ieri",
    markAllReadBtn: "Segna Tutto Come Letto",
    backToWorkbench: "Torna alla Home",
    today: "Oggi",
    yesterday: "Ieri",
    earlier: "Prima",

    // Dettaglio atleta
    athleteDetail: "Dettaglio Atleta",
    backToWorkbenchBtn: "← Torna alla Home",
    trainingRecord: "Registro Allenamento",
    loadingRecords: "Caricamento...",
    assistantNotes: "Note dell'Assistente",
    addTrainingNote: "Aggiungi Nota",
    voiceInputNote: "Input Vocale Nota",
    submitNote: "Invia Nota",
    submitting: "Invio in corso...",
    noteSubmitted: "Nota inviata",
    noteFailed: "Invio fallito: ",
    historyNotes: "Note Storiche",
    observation: "Osservazione",
    evaluation: "Valutazione",
    backToTrainingRecords: "← Torna al Registro",
    noSessionRecords: "Nessun registro allenamento",
    recordingStop: "Registrazione... Tocca per fermare",
    fatigue: "Affaticamento",

    // Dettaglio report
    athleteFeedback: "Feedback Atleta",
    noAIReport: "Nessun report AI ancora",
    noFeedback: "Nessun feedback",
    submitNoteBtn: "Invia Nota",
    body: "Fisico",
    mind: "Mentale",
    notePlaceholder: "Tocca il microfono per registrare, o scrivi la tua valutazione...",
    injuryRisk: "Rischio infortunio rilevato",

    // Profilo
    accountName: "Account",
    roleLabel: "Ruolo",
    userId: "ID Utente",
    logout: "Esci",

    // Configurazione icone notifiche
    notifConfig: {
      risk_alert: "Avviso",
      injury_alert: "Avviso",
      training_feedback: "Allenamento",
      treatment_plan: "Trattamento",
      training_note: "Nota",
      conflict_alert: "Conflitto",
      plan_approval: "Piano",
      general: "Generale",
    },
  },
};

export default it;
