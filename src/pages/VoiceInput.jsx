import { useState, useRef, useCallback, useEffect } from "react";
import { useI18n } from "../locales/index.jsx";
import MicButton from "../components/MicButton.jsx";

const LANG_MAP = { zh: "zh-CN", en: "en-US", it: "it-IT" };

export default function VoiceInput({ onDone }) {
  const { lang, t } = useI18n();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const hasSR = !!SR;
    const isSecure = window.isSecureContext;
    const userAgent = navigator.userAgent;

    setDebugInfo({
      hasSpeechRecognition: hasSR,
      isSecureContext: isSecure,
      protocol: window.location.protocol,
      browser: userAgent.includes("Chrome") ? "Chrome" :
               userAgent.includes("Firefox") ? "Firefox" :
               userAgent.includes("Safari") ? "Safari" : "Other",
      userAgent: userAgent.substring(0, 80) + "...",
    });

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
      setError(null);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
      // 显示具体的错误信息
      const errorMessages = {
        "not-allowed": "麦克风权限被拒绝，请在浏览器设置中允许麦克风访问",
        "no-speech": "未检测到语音，请重试",
        "audio-capture": "无法捕获音频，请检查麦克风设备",
        "network": "网络错误，语音识别服务不可用",
        "service-not-allowed": "语音识别服务不可用",
        "bad-grammar": "语音识别语法错误",
        "language-not-supported": "不支持当前语言",
      };
      setError(errorMessages[event.error] || `语音识别错误: ${event.error}`);
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
      setError(null);
      rec.lang = LANG_MAP[lang] || "zh-CN";
      try {
        rec.start();
        setListening(true);
      } catch (err) {
        console.error("Failed to start recognition:", err);
        setError("无法启动语音识别，请检查麦克风权限");
      }
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
        <div style={{ fontSize: 12, color: "#888", marginBottom: 24 }}>{t.voiceNotSupportedHint}</div>
        {/* Manual input fallback when voice is not supported */}
        <div style={{ marginTop: 24, maxWidth: 480, margin: "24px auto 0" }}>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={t.manualInputPlaceholder || "在此输入训练感受..."}
            rows={6}
            style={{
              width: "100%", padding: "12px 16px", borderRadius: 10,
              border: "0.5px solid #d3d1c7", fontSize: 13, lineHeight: 1.7,
              resize: "vertical", outline: "none", fontFamily: "inherit",
              background: "#f8f7f4", boxSizing: "border-box",
            }}
          />
          {transcript.trim() && (
            <button
              onClick={() => onDone(transcript.trim())}
              style={{
                marginTop: 12, padding: "12px 36px", borderRadius: 10, border: "none",
                background: "#534AB7", color: "#fff", fontSize: 14, fontWeight: 500,
                cursor: "pointer", boxShadow: "0 4px 12px rgba(83,74,183,0.3)",
                width: "100%",
              }}
            >
              {t.confirmAndContinue}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px", minHeight: "70vh", justifyContent: "center" }}>
      {/* Status text */}
      <div style={{ fontSize: 14, color: listening ? "#E24B4A" : "#888", marginBottom: 32, fontWeight: 500, minHeight: 20 }}>
        {listening ? t.listening : (transcript ? t.voiceRecorded : t.tapToSpeak)}
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          marginBottom: 20, maxWidth: 480, width: "100%",
          background: "#FCEBEB", borderRadius: 10, padding: "12px 16px",
          border: "1px solid #F09595", color: "#A32D2D", fontSize: 13,
          textAlign: "center",
        }}>
          ⚠️ {error}
        </div>
      )}

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

      {/* Divider */}
      <div style={{
        marginTop: 40, maxWidth: 480, width: "100%", display: "flex",
        alignItems: "center", gap: 12,
      }}>
        <div style={{ flex: 1, height: 1, background: "#e0dfd8" }} />
        <span style={{ fontSize: 11, color: "#b4b2a9" }}>{t.manualInputOr || "或手动输入"}</span>
        <div style={{ flex: 1, height: 1, background: "#e0dfd8" }} />
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
            border: "0.5px solid #d3d1c7", fontSize: 13, lineHeight: 1.7,
            resize: "vertical", outline: "none", fontFamily: "inherit",
            background: "#f8f7f4", boxSizing: "border-box",
          }}
        />
        {transcript.trim() && (
          <button
            onClick={handleConfirm}
            style={{
              marginTop: 12, padding: "12px 36px", borderRadius: 10, border: "none",
              background: "#534AB7", color: "#fff", fontSize: 14, fontWeight: 500,
              cursor: "pointer", boxShadow: "0 4px 12px rgba(83,74,183,0.3)",
              width: "100%",
            }}
          >
            {t.confirmAndContinue}
          </button>
        )}
      </div>

      {/* Hint */}
      <div style={{ marginTop: 24, fontSize: 11, color: "#b4b2a9", textAlign: "center" }}>
        {t.voiceHint}
      </div>

      {/* Debug info panel */}
      {debugInfo && (
        <div style={{
          marginTop: 32, maxWidth: 480, width: "100%",
          background: "#f8f7f4", borderRadius: 10, padding: "12px 16px",
          border: "0.5px solid #d3d1c7", fontSize: 11, color: "#666",
        }}>
          <div style={{ fontWeight: 500, marginBottom: 8, color: "#888" }}>🔧 调试信息</div>
          <div style={{ fontFamily: "monospace", lineHeight: 1.8 }}>
            <div>✅ Speech Recognition API: {debugInfo.hasSpeechRecognition ? "支持" : "❌ 不支持"}</div>
            <div>🔒 安全上下文 (HTTPS): {debugInfo.isSecureContext ? "是" : "❌ 否"}</div>
            <div>🌐 协议: {debugInfo.protocol}</div>
            <div>💻 浏览器: {debugInfo.browser}</div>
            <div style={{ fontSize: 10, color: "#999", marginTop: 4, wordBreak: "break-all" }}>
              UA: {debugInfo.userAgent}
            </div>
          </div>
          {!debugInfo.isSecureContext && (
            <div style={{
              marginTop: 10, padding: "8px 12px", background: "#FAEEDA",
              borderRadius: 6, color: "#633806", fontSize: 11,
            }}>
              ⚠️ 当前页面不是 HTTPS，语音识别可能无法工作。请确保使用 HTTPS 访问。
            </div>
          )}
          {!debugInfo.hasSpeechRecognition && (
            <div style={{
              marginTop: 10, padding: "8px 12px", background: "#FCEBEB",
              borderRadius: 6, color: "#A32D2D", fontSize: 11,
            }}>
              ❌ 您的浏览器不支持语音识别 API。请使用 Chrome 浏览器。
            </div>
          )}
        </div>
      )}
    </div>
  );
}
