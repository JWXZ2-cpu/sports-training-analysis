/**
 * 语言切换组件
 * 显示在页面顶部，用于切换界面语言
 */
import { useI18n } from "../locales/index.jsx";

export default function LanguageSwitch() {
  const { lang, setLang, langLabels } = useI18n();

  const langs = [
    { value: "zh", label: "中" },
    { value: "en", label: "EN" },
    { value: "it", label: "IT" },
  ];

  return (
    <div style={{
      display: "flex",
      gap: 2,
      padding: 2,
      background: "var(--surface)",
      borderRadius: 8,
      border: "1px solid var(--border)",
    }}>
      {langs.map((l) => (
        <button
          key={l.value}
          onClick={() => setLang(l.value)}
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            border: "none",
            background: lang === l.value ? "var(--accent-dim)" : "transparent",
            color: lang === l.value ? "var(--accent)" : "var(--text-dim)",
            fontSize: 11,
            fontWeight: lang === l.value ? 600 : 400,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.2s",
          }}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
