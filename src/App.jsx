import { useState, useRef, useCallback, useEffect } from "react";
import { useI18n } from "./locales/index.jsx";
import VoiceInput from "./pages/VoiceInput.jsx";
import DataConfirm from "./pages/DataConfirm.jsx";
import ResultPage from "./pages/ResultPage.jsx";

export default function App() {
  const { lang, toggleLang, t } = useI18n();

  // Page routing: "voice" | "confirm" | "result"
  const [step, setStep] = useState("voice");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [rawJson, setRawJson] = useState(null);

  // Reset everything when language changes
  const prevLang = useRef(lang);
  useEffect(() => {
    if (prevLang.current !== lang) {
      setStep("voice");
      setTranscript("");
      setResult(null);
      setError(null);
      setRawJson(null);
      prevLang.current = lang;
    }
  }, [lang]);

  // Build prompt from fields
  const buildUserPrompt = useCallback((fields) => {
    let msg = t.userTemplate;
    Object.entries(fields).forEach(([k, v]) => {
      msg = msg.replaceAll(`{{${k}}}`, v);
    });
    return msg;
  }, [t]);

  // Handle voice input complete
  const handleVoiceDone = (text) => {
    setTranscript(text);
    setStep("confirm");
  };

  // Handle analysis
  const handleAnalyze = async (fields) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setRawJson(null);
    setStep("result");

    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: t.systemPrompt,
          user: buildUserPrompt(fields),
        }),
      });
      const data = await resp.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      const text = data.content?.map((b) => b.text || "").join("") || "";
      setRawJson(text);

      // Robust JSON extraction
      let parsed = null;
      const clean = text.replace(/```json|```/g, "").trim();
      try { parsed = JSON.parse(clean); } catch {}
      if (!parsed) {
        const match = clean.match(/\{[\s\S]*\}/);
        if (match) {
          try { parsed = JSON.parse(match[0]); } catch {}
        }
      }
      if (!parsed) {
        setError(t.errorPrefix + "AI 未返回有效 JSON" + t.errorSuffix);
        return;
      }
      setResult(parsed);
    } catch (e) {
      setError(t.errorPrefix + e.message + t.errorSuffix);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", fontSize: 13, color: "#2c2c2a", minHeight: "100vh" }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: "0.5px solid #e0dfd8",
        position: "sticky", top: 0, background: "#fff", zIndex: 10,
      }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{t.appTitle}</div>
        <button
          onClick={toggleLang}
          style={{
            padding: "5px 12px", borderRadius: 6, border: "0.5px solid #d3d1c7",
            background: "transparent", fontSize: 12, cursor: "pointer", color: "#534AB7",
            fontWeight: 500, minWidth: 36,
          }}
        >
          {t.langLabel}
        </button>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "12px 0 0" }}>
        {["voice", "confirm", "result"].map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%", fontSize: 11,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: step === s ? "#534AB7" : "#e0dfd8",
              color: step === s ? "#fff" : "#888",
              fontWeight: 500,
            }}>
              {i + 1}
            </div>
            <span style={{ fontSize: 11, color: step === s ? "#534AB7" : "#b4b2a9" }}>
              {t.steps[i]}
            </span>
            {i < 2 && <div style={{ width: 20, height: 1, background: "#e0dfd8", margin: "0 4px" }} />}
          </div>
        ))}
      </div>

      {/* Pages */}
      <div style={{ padding: "0 0 40px" }}>
        {step === "voice" && (
          <VoiceInput onDone={handleVoiceDone} />
        )}
        {step === "confirm" && (
          <DataConfirm
            transcript={transcript}
            onAnalyze={handleAnalyze}
            onBack={() => setStep("voice")}
          />
        )}
        {step === "result" && (
          <ResultPage
            result={result}
            error={error}
            rawJson={rawJson}
            loading={loading}
            onBack={() => setStep("confirm")}
            onRestart={() => {
              setStep("voice");
              setTranscript("");
              setResult(null);
              setError(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
