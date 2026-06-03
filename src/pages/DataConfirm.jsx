import { useState } from "react";
import { useI18n } from "../locales/index.jsx";

const SCORE_NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function ScoreSelector({ value, onChange, label }) {
  return (
    <div>
      <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>{label}</label>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {SCORE_NUMS.map((n) => (
          <button
            key={n}
            onClick={() => onChange(String(n))}
            style={{
              width: 32, height: 32, borderRadius: 6, border: "none",
              background: value === String(n) ? "#534AB7" : "#f1efe8",
              color: value === String(n) ? "#fff" : "#666",
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
    transcript: transcript || "",
    week_body_avg: "",
    week_mind_avg: "",
    recent_trend: "",
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
        style={{ background: "none", border: "none", color: "#534AB7", fontSize: 12, cursor: "pointer", marginBottom: 16, padding: 0 }}
      >
        ← {t.backToVoice}
      </button>

      {/* Basic info */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#2c2c2a", marginBottom: 10 }}>{t.sectionBasic}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 3 }}>{t.fields.athlete_name}</label>
            <input value={fields.athlete_name} onChange={(e) => updateField("athlete_name", e.target.value)}
              style={INPUT_STYLE} placeholder={t.fields.athlete_name} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 3 }}>{t.fields.session_name}</label>
            <input value={fields.session_name} onChange={(e) => updateField("session_name", e.target.value)}
              style={INPUT_STYLE} placeholder={t.fields.session_name} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 3 }}>{t.fields.date}</label>
            <input value={fields.date} onChange={(e) => updateField("date", e.target.value)}
              style={INPUT_STYLE} type="date" />
          </div>
        </div>
      </div>

      {/* Scores */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#2c2c2a", marginBottom: 10 }}>{t.sectionScores}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <ScoreSelector value={fields.body_score} onChange={(v) => updateField("body_score", v)} label={t.fields.body_score} />
          <ScoreSelector value={fields.mind_score} onChange={(v) => updateField("mind_score", v)} label={t.fields.mind_score} />
          <ScoreSelector value={fields.difficulty_score} onChange={(v) => updateField("difficulty_score", v)} label={t.fields.difficulty_score} />
        </div>
      </div>

      {/* Tags */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#2c2c2a", marginBottom: 10 }}>{t.sectionTags}</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {presetTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              style={{
                padding: "5px 12px", borderRadius: 16, fontSize: 12,
                border: selectedTags.includes(tag) ? "1px solid #534AB7" : "1px solid #d3d1c7",
                background: selectedTags.includes(tag) ? "#EEEDFE" : "transparent",
                color: selectedTags.includes(tag) ? "#534AB7" : "#666",
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Transcript */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#2c2c2a", marginBottom: 6 }}>{t.sectionTranscript}</div>
        <textarea
          value={fields.transcript}
          onChange={(e) => updateField("transcript", e.target.value)}
          style={{ ...TEXTAREA_STYLE, minHeight: 80 }}
          placeholder={t.placeholderTranscript}
        />
      </div>

      {/* History (optional) */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#2c2c2a", marginBottom: 10 }}>{t.sectionHistory}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <div>
            <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 3 }}>{t.fields.week_body_avg}</label>
            <input value={fields.week_body_avg} onChange={(e) => updateField("week_body_avg", e.target.value)}
              style={INPUT_STYLE} placeholder="-" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 3 }}>{t.fields.week_mind_avg}</label>
            <input value={fields.week_mind_avg} onChange={(e) => updateField("week_mind_avg", e.target.value)}
              style={INPUT_STYLE} placeholder="-" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 3 }}>{t.fields.recent_trend}</label>
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
          background: canAnalyze ? "#534AB7" : "#d3d1c7",
          color: "#fff", fontSize: 15, fontWeight: 500,
          cursor: canAnalyze ? "pointer" : "not-allowed",
          boxShadow: canAnalyze ? "0 4px 12px rgba(83,74,183,0.3)" : "none",
          transition: "all 0.15s",
        }}
      >
        {t.startAnalysis}
      </button>
    </div>
  );
}

const INPUT_STYLE = {
  width: "100%", height: 36, background: "#f8f7f4",
  border: "0.5px solid #d3d1c7", borderRadius: 6,
  padding: "0 10px", fontSize: 12, color: "#2c2c2a",
  boxSizing: "border-box", outline: "none",
};

const TEXTAREA_STYLE = {
  width: "100%",
  fontFamily: "sans-serif",
  fontSize: 12,
  lineHeight: 1.65,
  background: "#f8f7f4",
  border: "0.5px solid #d3d1c7",
  borderRadius: 8,
  padding: "10px 12px",
  color: "#2c2c2a",
  resize: "vertical",
  boxSizing: "border-box",
  outline: "none",
};
