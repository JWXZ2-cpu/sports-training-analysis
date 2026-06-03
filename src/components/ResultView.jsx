import Badge from "./Badge.jsx";
import { useI18n } from "../locales/index.jsx";

export default function ResultView({ result }) {
  const { t } = useI18n();
  if (!result) return null;

  // Look up colors using the raw AI value; fall back to the "normal" style
  const sc = t.statusColor[result.status_level] || t.statusColor["正常"];
  const displayStatus = t.statusLevel[result.status_level] || result.status_level;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 8, padding: "6px 14px" }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: sc.text }}>{displayStatus}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 11, color: "#888" }}>{t.result.overallScore}</span>
          <span style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.1 }}>{result.overall_score}</span>
        </div>
        {result.risk_flag && (
          <div style={{ background: "#FCEBEB", border: "1px solid #F09595", borderRadius: 8, padding: "6px 12px", marginLeft: "auto" }}>
            <span style={{ fontSize: 12, color: "#A32D2D", fontWeight: 500 }}>{t.result.riskAlert}</span>
            <div style={{ fontSize: 11, color: "#A32D2D", marginTop: 2 }}>{result.risk_reason}</div>
          </div>
        )}
      </div>

      {/* Emotion & Fatigue */}
      <div style={{ background: "#f8f7f4", borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 2, fontWeight: 500 }}>{t.result.emotionFatigue}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <Badge
            text={`${t.result.emotionPrefix} ${t.polarity[result.emotion.polarity] || result.emotion.polarity}`}
            style={{
              background: (t.polarityColor[result.emotion.polarity] || "#888") + "18",
              color: t.polarityColor[result.emotion.polarity] || "#888",
              borderColor: (t.polarityColor[result.emotion.polarity] || "#888") + "44",
            }}
          />
          <Badge
            text={`${t.result.fatiguePrefix} ${t.fatigue[result.fatigue.level] || result.fatigue.level}`}
            style={{
              background: (t.fatigueColor[result.fatigue.level] || "#888") + "18",
              color: t.fatigueColor[result.fatigue.level] || "#888",
              borderColor: (t.fatigueColor[result.fatigue.level] || "#888") + "44",
            }}
          />
          {result.fatigue.body_parts?.map((p) => (
            <Badge key={p} text={p} style={{ background: "#FAEEDA", color: "#633806", borderColor: "#FAC775" }} />
          ))}
        </div>
        {result.fatigue.evidence && (
          <div style={{ fontSize: 11, color: "#888", fontStyle: "italic", borderLeft: "2px solid #EF9F27", paddingLeft: 8, marginTop: 2 }}>
            "{result.fatigue.evidence}"
          </div>
        )}
      </div>

      {/* Emotion signals */}
      {result.emotion.signals?.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {result.emotion.signals.map((s) => (
            <Badge key={s} text={s} style={{ background: "#EEEDFE", color: "#3C3489", borderColor: "#CECBF6" }} />
          ))}
        </div>
      )}

      {/* Difficulty points */}
      {result.difficulty_points?.length > 0 && (
        <div style={{ background: "#f8f7f4", borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 6, fontWeight: 500 }}>{t.result.difficultyTitle}</div>
          {result.difficulty_points.map((d, i) => (
            <div key={i} style={{ fontSize: 12, color: "#444", padding: "3px 0", display: "flex", alignItems: "flex-start", gap: 6 }}>
              <span style={{ color: "#7F77DD", fontSize: 10, marginTop: 3 }}>●</span>{d}
            </div>
          ))}
        </div>
      )}

      {/* Diary */}
      <div style={{ border: "0.5px solid #e0dfd8", borderRadius: 8, padding: "10px 12px" }}>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 5, fontWeight: 500 }}>{t.result.diaryTitle}</div>
        <div style={{ fontSize: 12, color: "#333", lineHeight: 1.75 }}>{result.diary_text}</div>
      </div>

      {/* Coach summary */}
      <div style={{ border: "0.5px solid #9FE1CB", borderRadius: 8, padding: "10px 12px", background: "#f4fcf9" }}>
        <div style={{ fontSize: 11, color: "#0F6E56", marginBottom: 5, fontWeight: 500 }}>{t.result.coachTitle}</div>
        <div style={{ fontSize: 12, color: "#085041", lineHeight: 1.75 }}>{result.coach_summary}</div>
      </div>

      {/* Recommendations */}
      {result.recommendations?.length > 0 && (
        <div style={{ background: "#f8f7f4", borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 6, fontWeight: 500 }}>{t.result.recoTitle}</div>
          {result.recommendations.map((r, i) => (
            <div key={i} style={{ fontSize: 12, color: "#333", padding: "3px 0", display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ color: "#1D9E75", fontSize: 11, marginTop: 2, minWidth: 14 }}>{i + 1}.</span>{r}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
