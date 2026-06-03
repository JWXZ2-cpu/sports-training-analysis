import { useState, useRef, useCallback, useEffect } from "react";
import { useI18n } from "../locales/index.jsx";
import MicButton from "../components/MicButton.jsx";

const LANG_MAP = { zh: "zh-CN", en: "en-US", it: "it-IT" };

export default function VoiceInput({ onDone }) {
  const { lang, t } = useI18n();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = LANG_MAP[lang] || "zh-CN";

    recognition.onresult = (event) => {
      let final = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }
      setTranscript(final + interim);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, [lang]);

  const toggleListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;

    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      setTranscript("");
      rec.lang = LANG_MAP[lang] || "zh-CN";
      rec.start();
      setListening(true);
    }
  }, [listening, lang]);

  const handleConfirm = () => {
    if (transcript.trim()) {
      onDone(transcript.trim());
    }
  };

  if (!supported) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎤</div>
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>{t.voiceNotSupported}</div>
        <div style={{ fontSize: 12, color: "#888" }}>{t.voiceNotSupportedHint}</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px", minHeight: "70vh", justifyContent: "center" }}>
      {/* Status text */}
      <div style={{ fontSize: 14, color: listening ? "#E24B4A" : "#888", marginBottom: 32, fontWeight: 500, minHeight: 20 }}>
        {listening ? t.listening : (transcript ? t.voiceRecorded : t.tapToSpeak)}
      </div>

      {/* Mic button */}
      <MicButton listening={listening} onClick={toggleListening} />

      {/* Transcript display */}
      {transcript && (
        <div style={{
          marginTop: 32, maxWidth: 480, width: "100%",
          background: "#f8f7f4", borderRadius: 12, padding: "16px 20px",
          border: "0.5px solid #d3d1c7", maxHeight: 200, overflow: "auto",
        }}>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 6, fontWeight: 500 }}>{t.voiceTranscript}</div>
          <div style={{ fontSize: 13, color: "#2c2c2a", lineHeight: 1.7 }}>{transcript}</div>
        </div>
      )}

      {/* Confirm button */}
      {transcript && !listening && (
        <button
          onClick={handleConfirm}
          style={{
            marginTop: 24, padding: "12px 36px", borderRadius: 10, border: "none",
            background: "#534AB7", color: "#fff", fontSize: 14, fontWeight: 500,
            cursor: "pointer", boxShadow: "0 4px 12px rgba(83,74,183,0.3)",
          }}
        >
          {t.confirmAndContinue}
        </button>
      )}

      {/* Hint */}
      <div style={{ marginTop: 40, fontSize: 11, color: "#b4b2a9", textAlign: "center" }}>
        {t.voiceHint}
      </div>
    </div>
  );
}
