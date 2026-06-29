import { useState } from "react";
import { useI18n } from "../locales/index.jsx";
import { TEXTAREA_STYLE, INPUT_STYLE } from "../styles/sharedStyles.js";

const SCORE_NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function ScoreSelector({ value, onChange, label }) {
  return (
    <div>
      <label style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>{label}</label>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {SCORE_NUMS.map((n) => (
          <button
            key={n}
            onClick={() => onChange(String(n))}
            style={{
              width: 32, height: 32, borderRadius: 6, border: "none",
              background: value === String(n) ? "var(--color-primary)" : "var(--bg-input)",
              color: value === String(n) ? "var(--text-on-primary)" : "var(--text-secondary)",
              fontSize: 13, fontWeight: value === String(n) ? 600 : 400,
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

const PRESET_TAGS = {
  zh: ["膝盖酸痛", "状态良好", "疲劳", "肌肉酸痛", "心情好", "睡眠不足", "受伤", "进步明显"],
  en: ["Knee soreness", "Good form", "Fatigue", "Muscle soreness", "Good mood", "Lack of sleep", "Injured", "Notable progress"],
  it: ["Dolore al ginocchio", "Buona forma", "Affaticamento", "Dolori muscolari", "Buon umore", "Mancanza di sonno", "Infortunio", "Progresso notevole"],
};

const PRESET_MOODS = {
  zh: ["😊 自信", "😰 紧张", "😤 兴奋", "😐 平静", "😓 焦虑", "💪 专注", "😴 疲惫", "🤔 迷茫"],
  en: ["😊 Confident", "😰 Nervous", "😤 Excited", "😐 Calm", "😓 Anxious", "💪 Focused", "😴 Tired", "🤔 Uncertain"],
  it: ["😊 Sicuro", "😰 Nervoso", "😤 Eccitato", "😐 Calmo", "😓 Ansioso", "💪 Concentrato", "😴 Stanco", "🤔 Incerto"],
};

export default function DataConfirm({ transcript, onAnalyze, onBack }) {
  const { lang, t } = useI18n();

  const today = new Date().toISOString().split("T")[0];
  const [fields, setFields] = useState({
    athlete_name: "",
    session_name: "",
    date: today,
    body_score: "",
    mind_score: "",
    difficulty_score: "",
    tags: "",
    mood_tags: "",
    mood_description: "",
    transcript: transcript || "",
    week_body_avg: "",
    week_mind_avg: "",
    recent_trend: "",
    training_phase: "",
    cycle_week: "",
    weekly_volume_trend: "",
    target_race_date: "",
    days_to_race: "",
    recent_injury: "",
    sleep_quality: "",
    training_monotony: "",
  });

  const [selectedTags, setSelectedTags] = useState([]);
  const presetTags = PRESET_TAGS[lang] || PRESET_TAGS.zh;

  const toggleTag = (tag) => {
    setSelectedTags((prev) => {
      const next = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];
      setFields((f) => ({ ...f, tags: next.join(lang === "zh" ? "、" : ", ") }));
      return next;
    });
  };

  const updateField = (key, val) => {
    setFields((f) => ({ ...f, [key]: val }));
  };

  const canAnalyze = fields.transcript.trim() && fields.body_score && fields.mind_score;

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px" }}>
      {/* Back link */}
      <button
        onClick={onBack}
        style={{ background: "none", border: "none", color: "var(--color-primary)", fontSize: 12, cursor: "pointer", marginBottom: 16, padding: 0 }}
      >
        ← {t.backToVoice}
      </button>

      {/* Basic info */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", marginBottom: 10 }}>{t.sectionBasic}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginBottom: 3 }}>{t.fields.athlete_name}</label>
            <input value={fields.athlete_name} onChange={(e) => updateField("athlete_name", e.target.value)}
              style={INPUT_STYLE} placeholder={t.fields.athlete_name} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginBottom: 3 }}>{t.fields.session_name}</label>
            <input value={fields.session_name} onChange={(e) => updateField("session_name", e.target.value)}
              style={INPUT_STYLE} placeholder={t.fields.session_name} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginBottom: 3 }}>{t.fields.date}</label>
            <input value={fields.date} onChange={(e) => updateField("date", e.target.value)}
              style={INPUT_STYLE} type="date" />
          </div>
        </div>
      </div>

      {/* Scores */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", marginBottom: 10 }}>{t.sectionScores}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <ScoreSelector value={fields.body_score} onChange={(v) => updateField("body_score", v)} label={t.fields.body_score} />
          <ScoreSelector value={fields.mind_score} onChange={(v) => updateField("mind_score", v)} label={t.fields.mind_score} />
          <ScoreSelector value={fields.difficulty_score} onChange={(v) => updateField("difficulty_score", v)} label={t.fields.difficulty_score} />
        </div>
      </div>

      {/* Tags */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", marginBottom: 10 }}>{t.sectionTags}</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {presetTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              style={{
                padding: "5px 12px", borderRadius: 16, fontSize: 12,
                border: selectedTags.includes(tag) ? "1px solid var(--color-primary)" : "1px solid var(--border-default)",
                background: selectedTags.includes(tag) ? "var(--color-primary-bg)" : "transparent",
                color: selectedTags.includes(tag) ? "var(--color-primary)" : "var(--text-secondary)",
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 心理状态（选填） */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", marginBottom: 10 }}>
          {lang === "zh" ? "心理状态描述（选填）" : lang === "it" ? "Descrizione Stato Mentale (opzionale)" : "Mental State Description (optional)"}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {(PRESET_MOODS[lang] || PRESET_MOODS.zh).map((mood) => (
            <button
              key={mood}
              onClick={() => {
                const current = fields.mood_tags || "";
                const tags = current ? current.split(lang === "zh" ? "、" : ", ") : [];
                const next = tags.includes(mood) ? tags.filter((t) => t !== mood) : [...tags, mood];
                updateField("mood_tags", next.join(lang === "zh" ? "、" : ", "));
              }}
              style={{
                padding: "5px 12px", borderRadius: 16, fontSize: 12,
                border: (fields.mood_tags || "").includes(mood) ? "1px solid var(--color-primary)" : "1px solid var(--border-default)",
                background: (fields.mood_tags || "").includes(mood) ? "var(--color-primary-bg)" : "transparent",
                color: (fields.mood_tags || "").includes(mood) ? "var(--color-primary)" : "var(--text-secondary)",
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {mood}
            </button>
          ))}
        </div>
        <textarea
          value={fields.mood_description || ""}
          onChange={(e) => updateField("mood_description", e.target.value)}
          style={{ ...TEXTAREA_STYLE, minHeight: 60 }}
          placeholder={lang === "zh" ? "描述一下今天的心理感受，比如：对训练很有信心、有点紧张、注意力很集中..." : lang === "it" ? "Descrivi come ti senti oggi..." : "Describe how you feel today..."}
        />
      </div>

      {/* Transcript */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", marginBottom: 6 }}>{t.sectionTranscript}</div>
        <textarea
          value={fields.transcript}
          onChange={(e) => updateField("transcript", e.target.value)}
          style={{ ...TEXTAREA_STYLE, minHeight: 80 }}
          placeholder={t.placeholderTranscript}
        />
      </div>

      {/* Periodization info (optional) */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", marginBottom: 10 }}>
          {lang === "zh" ? "训练周期信息（选填）" : lang === "it" ? "Informazioni Periodizzazione (opzionale)" : "Periodization Info (optional)"}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginBottom: 3 }}>{t.fields.training_phase}</label>
            <select value={fields.training_phase} onChange={(e) => updateField("training_phase", e.target.value)}
              style={{ ...INPUT_STYLE, cursor: "pointer" }}>
              <option value="">--</option>
              {lang === "zh" ? (
                <>
                  <option value="基础期">基础期</option>
                  <option value="强化期">强化期</option>
                  <option value="赛前期">赛前期</option>
                  <option value="竞赛期">竞赛期</option>
                  <option value="过渡期">过渡期</option>
                </>
              ) : lang === "it" ? (
                <>
                  <option value="Base">Base</option>
                  <option value="Sviluppo">Sviluppo</option>
                  <option value="Pre-gara">Pre-gara</option>
                  <option value="Gara">Gara</option>
                  <option value="Transizione">Transizione</option>
                </>
              ) : (
                <>
                  <option value="Base">Base</option>
                  <option value="Build">Build</option>
                  <option value="Pre-competition">Pre-competition</option>
                  <option value="Competition">Competition</option>
                  <option value="Transition">Transition</option>
                </>
              )}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginBottom: 3 }}>{t.fields.cycle_week}</label>
            <input value={fields.cycle_week} onChange={(e) => updateField("cycle_week", e.target.value)}
              style={INPUT_STYLE} placeholder={lang === "zh" ? "如：第4周/共6周" : "e.g. Week 4/6"} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginBottom: 3 }}>{t.fields.weekly_volume_trend}</label>
            <input value={fields.weekly_volume_trend} onChange={(e) => updateField("weekly_volume_trend", e.target.value)}
              style={INPUT_STYLE} placeholder={lang === "zh" ? "如：30km→35km→40km→35km" : "e.g. 30km→35km→40km→35km"} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginBottom: 3 }}>{t.fields.target_race_date}</label>
            <input value={fields.target_race_date} onChange={(e) => updateField("target_race_date", e.target.value)}
              style={INPUT_STYLE} type="date" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginBottom: 3 }}>{t.fields.days_to_race}</label>
            <input value={fields.days_to_race} onChange={(e) => updateField("days_to_race", e.target.value)}
              style={INPUT_STYLE} type="number" placeholder="28" />
          </div>
        </div>
      </div>

      {/* Recovery & Health (optional) */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", marginBottom: 10 }}>
          {lang === "zh" ? "恢复与健康（选填）" : lang === "it" ? "Recupero e Salute (opzionale)" : "Recovery & Health (optional)"}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginBottom: 3 }}>{t.fields.recent_injury}</label>
            <input value={fields.recent_injury} onChange={(e) => updateField("recent_injury", e.target.value)}
              style={INPUT_STYLE} placeholder={lang === "zh" ? "无/左膝不适" : "None/Left knee"} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginBottom: 3 }}>{t.fields.sleep_quality}</label>
            <select value={fields.sleep_quality} onChange={(e) => updateField("sleep_quality", e.target.value)}
              style={{ ...INPUT_STYLE, cursor: "pointer" }}>
              <option value="">--</option>
              {lang === "zh" ? (
                <>
                  <option value="好">好</option>
                  <option value="一般">一般</option>
                  <option value="差">差</option>
                </>
              ) : lang === "it" ? (
                <>
                  <option value="Buona">Buona</option>
                  <option value="Discreta">Discreta</option>
                  <option value="Scarsa">Scarsa</option>
                </>
              ) : (
                <>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </>
              )}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginBottom: 3 }}>{t.fields.training_monotony}</label>
            <select value={fields.training_monotony} onChange={(e) => updateField("training_monotony", e.target.value)}
              style={{ ...INPUT_STYLE, cursor: "pointer" }}>
              <option value="">--</option>
              {lang === "zh" ? (
                <>
                  <option value="低">低</option>
                  <option value="中">中</option>
                  <option value="高">高</option>
                </>
              ) : lang === "it" ? (
                <>
                  <option value="Basso">Basso</option>
                  <option value="Medio">Medio</option>
                  <option value="Alto">Alto</option>
                </>
              ) : (
                <>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* History (optional) */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", marginBottom: 10 }}>{t.sectionHistory}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginBottom: 3 }}>{t.fields.week_body_avg}</label>
            <input value={fields.week_body_avg} onChange={(e) => updateField("week_body_avg", e.target.value)}
              style={INPUT_STYLE} placeholder="-" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginBottom: 3 }}>{t.fields.week_mind_avg}</label>
            <input value={fields.week_mind_avg} onChange={(e) => updateField("week_mind_avg", e.target.value)}
              style={INPUT_STYLE} placeholder="-" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginBottom: 3 }}>{t.fields.recent_trend}</label>
            <input value={fields.recent_trend} onChange={(e) => updateField("recent_trend", e.target.value)}
              style={INPUT_STYLE} placeholder="-" />
          </div>
        </div>
      </div>

      {/* Analyze button */}
      <button
        onClick={() => onAnalyze(fields)}
        disabled={!canAnalyze}
        style={{
          width: "100%", padding: "14px 0", borderRadius: 10, border: "none",
          background: canAnalyze ? "var(--color-primary)" : "var(--text-muted)",
          color: "var(--bg-card)", fontSize: 15, fontWeight: 500,
          cursor: canAnalyze ? "pointer" : "not-allowed",
          boxShadow: canAnalyze ? "var(--shadow-primary)" : "none",
          transition: "all 0.15s",
        }}
      >
        {t.startAnalysis}
      </button>
    </div>
  );
}




