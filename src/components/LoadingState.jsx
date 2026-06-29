/**
 * 统一加载状态组件
 * @param {string} size - "small" | "medium" | "large"，默认 "medium"
 */
import { useI18n } from "../locales/index.jsx";

export default function LoadingState({ size = "medium" }) {
  const { t } = useI18n();
  const sizeMap = { small: 20, medium: 32, large: 48 };
  const s = sizeMap[size] || sizeMap.medium;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: size === "small" ? "auto" : "100%",
      padding: size === "small" ? "20px 0" : "60px 0",
    }}>
      <style>{`
        @keyframes loading-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{
        width: s,
        height: s,
        border: "3px solid var(--accent-dim)",
        borderTopColor: "var(--accent)",
        borderRadius: "50%",
        animation: "loading-spin 0.8s linear infinite",
      }} />
      <div style={{
        marginTop: size === "small" ? 8 : 14,
        fontSize: size === "small" ? 12 : 14,
        color: "var(--text-dim)",
        fontWeight: 500,
      }}>
        {t.loading || "加载中..."}
      </div>
    </div>
  );
}
