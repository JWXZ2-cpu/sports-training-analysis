import { useState, useRef, useCallback, useEffect } from "react";
import { useI18n } from "../locales/index.jsx";
import { startMimoAsr } from "../utils/mimoAsr.js";
import MicButton from "../components/MicButton.jsx";

const LANG_MAP = { zh: "zh", en: "en", it: "it" };

export default function VoiceInput({ onDone }) {
  const { lang, t } = useI18n();
  const [listening, setListening] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const asrRef = useRef(null);

  useEffect(() => {
    return () => {
      if (asrRef.current) asrRef.current.stop();
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (recognizing) return;

    if (listening) {
      if (asrRef.current) asrRef.current.stop();
      setListening(false);
      setRecognizing(true);
    } else {
      setTranscript("");
      setError(null);

      const language = LANG_MAP[lang] || "zh";
      const asr = startMimoAsr({
        language,
        onResult: (text) => {
          setRecognizing(false);
          setTranscript(text);
        },
        onError: (msg) => {
          setRecognizing(false);
          setListening(false);
          setError(msg);
        },
      });

      asrRef.current = asr;
      asr.start();
      setListening(true);
    }
  }, [listening, recognizing, lang]);

  const handleConfirm = () => {
    if (transcript.trim()) {
      onDone(transcript.trim());
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px", minHeight: "70vh", justifyContent: "center" }}>
      {/* Status text */}
      <div style={{ fontSize: 14, color: listening ? "var(--red)" : recognizing ? "var(--accent)" : "var(--text-secondary)", marginBottom: 32, fontWeight: 500, minHeight: 20 }}>
        {recognizing ? "识别中..." : listening ? t.listening : (transcript ? t.voiceRecorded : t.tapToSpeak)}
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          marginBottom: 20, maxWidth: 480, width: "100%",
          background: "var(--red-dim)", borderRadius: 10, padding: "12px 16px",
          border: "1px solid rgba(212,92,92,0.2)", color: "var(--red)", fontSize: 13,
          textAlign: "center",
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Mic button */}
      <MicButton listening={listening} onClick={toggleListening} disabled={recognizing} />

      {/* Transcript display */}
      {transcript && (
        <div style={{
          marginTop: 32, maxWidth: 480, width: "100%",
          background: "var(--surface)", borderRadius: 12, padding: "16px 20px",
          border: "1px solid var(--border)", maxHeight: 200, overflow: "auto",
        }}>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 6, fontWeight: 500 }}>{t.voiceTranscript}</div>
          <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.7 }}>{transcript}</div>
        </div>
      )}

      {/* Confirm button */}
      {transcript && !listening && !recognizing && (
        <button
          onClick={handleConfirm}
          style={{
            marginTop: 24, padding: "12px 36px", borderRadius: 10, border: "none",
            background: "var(--accent)", color: "var(--bg)", fontSize: 14, fontWeight: 500,
            cursor: "pointer",
          }}
        >
          {t.confirmAndContinue}
        </button>
      )}

      {/* Divider */}
      <div style={{
        marginTop: 40, maxWidth: 480, width: "100%", display: "flex",
        alignItems: "center", gap: 12,
      }}>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{t.manualInputOr || "或手动输入"}</span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      {/* Manual text input fallback */}
      <div style={{ marginTop: 16, maxWidth: 480, width: "100%" }}>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={t.manualInputPlaceholder || "在此输入训练感受..."}
          rows={4}
          style={{
            width: "100%", padding: "12px 16px", borderRadius: 10,
            border: "1px solid var(--border)", fontSize: 13, lineHeight: 1.7,
            resize: "vertical", outline: "none", fontFamily: "inherit",
            background: "var(--card)", boxSizing: "border-box", color: "var(--text)",
          }}
        />
        {transcript.trim() && (
          <button
            onClick={handleConfirm}
            style={{
              marginTop: 12, padding: "12px 36px", borderRadius: 10, border: "none",
              background: "var(--accent)", color: "var(--bg)", fontSize: 14, fontWeight: 500,
              cursor: "pointer", width: "100%",
            }}
          >
            {t.confirmAndContinue}
          </button>
        )}
      </div>

      {/* Hint */}
      <div style={{ marginTop: 24, fontSize: 11, color: "var(--text-dim)", textAlign: "center" }}>
        {t.voiceHint}
      </div>
    </div>
  );
}
