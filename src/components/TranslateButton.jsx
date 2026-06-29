/**
 * 翻译按钮组件
 * 用于一键翻译 AI 分析报告
 */
import { useState } from "react";
import { useI18n } from "../locales/index.jsx";
import { translateReport } from "../services/translateService.js";

const LANG_OPTIONS = [
  { value: "zh", label: "中文", flag: "🇨🇳" },
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "it", label: "Italiano", flag: "🇮🇹" },
];

export default function TranslateButton({ report, onTranslated }) {
  const [translating, setTranslating] = useState(false);
  const [currentLang, setCurrentLang] = useState("zh");
  const [showMenu, setShowMenu] = useState(false);

  const handleTranslate = async (targetLang) => {
    if (targetLang === currentLang) {
      setShowMenu(false);
      return;
    }

    setTranslating(true);
    setShowMenu(false);

    try {
      if (targetLang === "zh") {
        // 切换回中文，使用原始数据
        onTranslated(null, "zh");
        setCurrentLang("zh");
      } else {
        const translated = await translateReport(report, targetLang);
        onTranslated(translated, targetLang);
        setCurrentLang(targetLang);
      }
    } catch (err) {
      console.error("翻译失败:", err);
    } finally {
      setTranslating(false);
    }
  };

  const currentOption = LANG_OPTIONS.find((o) => o.value === currentLang) || LANG_OPTIONS[0];

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={translating}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          borderRadius: 8,
          border: "1px solid var(--border)",
          background: translating ? "var(--accent-dim)" : "var(--card)",
          color: translating ? "var(--accent)" : "var(--text-secondary)",
          fontSize: 12,
          fontWeight: 500,
          cursor: translating ? "wait" : "pointer",
          fontFamily: "inherit",
          transition: "all 0.2s",
        }}
      >
        {translating ? (
          <span style={{
            width: 14,
            height: 14,
            border: "2px solid var(--accent)",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 5h7l2 3h6" /><path d="M2 5l5 14 3-7 4 7 5-14" />
          </svg>
        )}
        {currentOption.flag} {currentOption.label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {showMenu && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 999,
            }}
            onClick={() => setShowMenu(false)}
          />
          <div style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 4,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 4,
            zIndex: 1000,
            minWidth: 140,
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}>
            {LANG_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleTranslate(option.value)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "8px 12px",
                  border: "none",
                  borderRadius: 8,
                  background: option.value === currentLang ? "var(--accent-dim)" : "transparent",
                  color: option.value === currentLang ? "var(--accent)" : "var(--text-secondary)",
                  fontSize: 13,
                  fontWeight: option.value === currentLang ? 600 : 400,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (option.value !== currentLang) {
                    e.currentTarget.style.background = "var(--card)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (option.value !== currentLang) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <span style={{ fontSize: 16 }}>{option.flag}</span>
                {option.label}
                {option.value === currentLang && (
                  <svg style={{ marginLeft: "auto" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
