import { useState, useRef, useCallback, useEffect } from "react";
import { startMimoAsr } from "../utils/mimoAsr.js";

/**
 * 通用语音输入组件
 * 支持两种样式：默认矩形按钮 / MiMo圆形按钮
 */
export default function VoiceInput({
  onConfirm,
  placeholder = "点击麦克风按钮开始语音输入",
  buttonText = "开始录音",
  language = "zh",
  rows = 3,
  variant = "default", // "default" | "mimo"
}) {
  const [listening, setListening] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const asrRef = useRef(null);
  const timerRef = useRef(null);

  // 清理
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (asrRef.current) asrRef.current.stop();
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (listening) {
      // 停止录音
      if (asrRef.current) asrRef.current.stop();
      setListening(false);
      setRecognizing(true);
      clearInterval(timerRef.current);
    } else {
      // 开始录音
      setTranscript("");
      setError(null);
      setSeconds(0);
      setRecognizing(false);

      const langMap = { "zh-CN": "zh", "en-US": "en", "zh": "zh", "en": "en" };
      const lang = langMap[language] || "zh";

      const asr = startMimoAsr({
        language: lang,
        onResult: (text) => {
          setRecognizing(false);
          setTranscript(text);
        },
        onError: (msg) => {
          setRecognizing(false);
          setError(msg);
          setListening(false);
          clearInterval(timerRef.current);
        },
      });

      asrRef.current = asr;
      asr.start();
      setListening(true);

      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
  }, [listening, language]);

  const handleConfirm = () => {
    if (transcript.trim()) {
      onConfirm(transcript.trim());
      setTranscript("");
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  // MiMo 风格的录音界面
  if (variant === "mimo") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* 错误提示 */}
        {error && (
          <div style={{
            padding: "8px 12px", borderRadius: 8, marginBottom: 16,
            background: "var(--red-dim)", border: "1px solid rgba(212,92,92,0.2)",
            fontSize: 11, color: "var(--red)", width: "100%", maxWidth: 300,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* 录音按钮 + 光环 */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* 三层光环 */}
          {!listening && (
            <>
              <div style={RING_STYLE(108, 0.25, "2.5s")} />
              <div style={RING_STYLE(132, 0.15, "2.5s", "0.4s")} />
              <div style={RING_STYLE(156, 0.08, "2.5s", "0.8s")} />
            </>
          )}
          {listening && (
            <>
              <div style={{ ...RING_STYLE(108, 0.25, "2.5s"), borderColor: "var(--red)" }} />
              <div style={{ ...RING_STYLE(132, 0.15, "2.5s", "0.4s"), borderColor: "var(--red)" }} />
              <div style={{ ...RING_STYLE(156, 0.08, "2.5s", "0.8s"), borderColor: "var(--red)" }} />
            </>
          )}

          {/* 主按钮 */}
          <button
            onClick={toggleListening}
            disabled={recognizing}
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              border: "none",
              cursor: recognizing ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: listening
                ? "linear-gradient(135deg, var(--red), #B84040)"
                : recognizing
                  ? "var(--text-dim)"
                  : "linear-gradient(135deg, var(--accent), #C08830)",
              color: "var(--bg)",
              transition: "transform 0.2s ease, box-shadow 0.3s ease",
              zIndex: 2,
              boxShadow: listening
                ? "0 0 50px rgba(212,92,92,0.3)"
                : "none",
              animation: listening ? "recordPulse 1.5s ease infinite" : "none",
            }}
            onMouseEnter={(e) => {
              if (!listening && !recognizing) {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 0 40px rgba(212,164,76,0.2)";
              }
            }}
            onMouseLeave={(e) => {
              if (!listening && !recognizing) {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="1" width="6" height="11" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0" />
              <line x1="12" y1="17" x2="12" y2="21" />
              <line x1="8" y1="21" x2="16" y2="21" />
            </svg>
          </button>
        </div>

        {/* 声波动画 */}
        <div style={{
          display: listening ? "flex" : "none",
          alignItems: "center", justifyContent: "center",
          gap: 3, height: 40, marginTop: 20,
        }}>
          {Array.from({ length: 13 }).map((_, i) => (
            <div key={i} style={{
              width: 3, borderRadius: 2, background: "var(--red)", opacity: 0.7,
              height: [12, 20, 28, 16, 32, 22, 18, 26, 14, 24, 20, 30, 16][i],
              animation: "waveAnim 0.8s ease-in-out infinite alternate",
              animationDelay: `${[0, 0.1, 0.15, 0.2, 0.05, 0.25, 0.12, 0.18, 0.08, 0.22, 0.06, 0.16, 0.1][i]}s`,
            }} />
          ))}
        </div>

        {/* 录音计时器 */}
        {listening && (
          <div style={{
            fontSize: 22, fontWeight: 600, color: "var(--red)",
            marginTop: 12, letterSpacing: "0.05em",
            fontVariantNumeric: "tabular-nums",
          }}>
            {formatTime(seconds)}
          </div>
        )}

        {/* 状态文字 */}
        <p style={{
          marginTop: 24, fontSize: 14, fontWeight: 400,
          color: listening ? "var(--red)" : recognizing ? "var(--accent)" : "var(--text-secondary)",
          transition: "color 0.3s",
        }}>
          {recognizing ? "识别中..." : listening ? "正在录音… 点击结束" : (transcript ? "录音完成" : "点击记录今天的训练感受")}
        </p>

        {/* 识别结果文本框 */}
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{ ...TEXTAREA_STYLE, marginTop: 16 }}
        />

        {/* 确认按钮 */}
        {transcript.trim() && !listening && !recognizing && (
          <button onClick={handleConfirm} style={{ ...CONFIRM_BTN, marginTop: 12 }}>
            确认提交
          </button>
        )}

        {/* 动画样式 */}
        <style>{`
          @keyframes ringPulse {
            0% { transform: scale(0.85); opacity: 0.3; }
            100% { transform: scale(1.15); opacity: 0; }
          }
          @keyframes recordPulse {
            0%, 100% { box-shadow: 0 0 30px rgba(212,92,92,0.25); }
            50% { box-shadow: 0 0 60px rgba(212,92,92,0.4); }
          }
          @keyframes waveAnim {
            from { transform: scaleY(0.4); }
            to { transform: scaleY(1); }
          }
        `}</style>
      </div>
    );
  }

  // 默认风格（其他角色使用）
  return (
    <div style={{ width: "100%" }}>
      {/* 错误提示 */}
      {error && (
        <div style={{
          padding: "8px 12px", borderRadius: 8, marginBottom: 8,
          background: "var(--red-dim)", border: "1px solid rgba(212,92,92,0.2)",
          fontSize: 11, color: "var(--red)",
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* 录音按钮 */}
      <button onClick={toggleListening} disabled={recognizing} style={{
        ...MIC_BTN,
        background: recognizing
          ? "var(--text-dim)"
          : listening
            ? "linear-gradient(135deg, var(--red), var(--red))"
            : "linear-gradient(135deg, var(--accent), var(--accent))",
        cursor: recognizing ? "wait" : "pointer",
      }}>
        <span style={{ fontSize: 20, marginRight: 8 }}>{recognizing ? "⏳" : listening ? "⏹" : "🎤"}</span>
        {recognizing ? "识别中..." : listening ? "停止录音" : buttonText}
      </button>

      {/* 实时识别状态 */}
      {listening && (
        <div style={{ fontSize: 11, color: "var(--red)", marginTop: 6, textAlign: "center" }}>
          🔴 正在录音，请说话...
        </div>
      )}

      {/* 输入框：语音识别结果 或 手动输入 */}
      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{ ...TEXTAREA_STYLE, marginTop: 8 }}
      />

      {/* 确认按钮 */}
      {transcript.trim() && !listening && !recognizing && (
        <button onClick={handleConfirm} style={CONFIRM_BTN}>
          确认提交
        </button>
      )}
    </div>
  );
}

// 光环样式
function RING_STYLE(size, opacity, duration, delay = "0s") {
  return {
    position: "absolute",
    width: size,
    height: size,
    borderRadius: "50%",
    border: "1.5px solid var(--accent)",
    opacity,
    animation: `ringPulse ${duration} ease-out ${delay} infinite`,
    pointerEvents: "none",
  };
}


const MIC_BTN = {
  width: "100%", padding: "10px 0", borderRadius: 10,
  border: "none", color: "var(--bg)", fontSize: 13, fontWeight: 500,
  cursor: "pointer", display: "flex", alignItems: "center",
  justifyContent: "center", transition: "all 0.2s",
};

const CONFIRM_BTN = {
  marginTop: 8, width: "100%", padding: "10px 0", borderRadius: 10,
  border: "none", background: "var(--accent)", color: "var(--bg)",
  fontSize: 13, fontWeight: 500, cursor: "pointer",
};

const TEXTAREA_STYLE = {
  width: "100%", padding: "12px 14px", borderRadius: 10,
  border: "1px solid var(--border)", background: "var(--card)",
  color: "var(--text)", fontFamily: "'Noto Serif SC', serif",
  fontSize: 14, lineHeight: 1.7, resize: "vertical",
  outline: "none", boxSizing: "border-box",
};
