import { useState } from "react";
import { useI18n } from "../locales/index.jsx";
import ResultView from "../components/ResultView.jsx";

export default function ResultPage({ result, error, rawJson, loading, onBack, onRestart }) {
  const { t } = useI18n();
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px" }}>
      {/* Top actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button
          onClick={onBack}
          style={{ background: "none", border: "none", color: "#534AB7", fontSize: 12, cursor: "pointer", padding: 0 }}
        >
          ← {t.backToEdit}
        </button>
        <button
          onClick={onRestart}
          style={{ background: "none", border: "none", color: "#888", fontSize: 12, cursor: "pointer", padding: 0 }}
        >
          {t.restartRecording}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "40px 0", alignItems: "center" }}>
          {t.loadingMsgs.map((msg, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.7 + i * 0.1 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#7F77DD", animation: "pulse 1s infinite", animationDelay: `${i * 0.2}s` }} />
              <span style={{ fontSize: 12, color: "#888" }}>{msg}</span>
            </div>
          ))}
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: "#FCEBEB", border: "0.5px solid #F09595", borderRadius: 8, padding: "12px 16px", fontSize: 12, color: "#A32D2D", whiteSpace: "pre-wrap" }}>
          {error}
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div>
          <ResultView result={result} />

          {/* Toggle raw JSON */}
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <button
              onClick={() => setShowRaw((v) => !v)}
              style={{ fontSize: 11, padding: "4px 10px", borderRadius: 5, border: "0.5px solid #d3d1c7", background: "transparent", cursor: "pointer", color: "#888" }}
            >
              {showRaw ? t.showCard : t.showRaw}
            </button>
          </div>

          {showRaw && (
            <pre style={{
              marginTop: 10, fontSize: 11, background: "#f8f7f4", border: "0.5px solid #d3d1c7",
              borderRadius: 8, padding: "10px 12px", whiteSpace: "pre-wrap", overflow: "auto",
              fontFamily: "monospace", lineHeight: 1.65, color: "#2c2c2a",
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
