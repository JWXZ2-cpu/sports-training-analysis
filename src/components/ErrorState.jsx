/**
 * 统一错误状态组件
 * @param {string} message - 错误信息（必填）
 * @param {function} onRetry - 重试回调（可选）
 */
import { useI18n } from "../locales/index.jsx";

export default function ErrorState({ message, onRetry }) {
  const { t } = useI18n();
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100%",
      padding: "60px 0",
    }}>
      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "32px 24px",
        maxWidth: 320,
        width: "100%",
        textAlign: "center",
      }}>
        {/* 错误图标 */}
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 16 }}>
          <circle cx="12" cy="12" r="10" stroke="var(--red)" strokeWidth="1.5" />
          <line x1="12" y1="8" x2="12" y2="12" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="16" r="1" fill="var(--red)" />
        </svg>

        {/* 错误信息 */}
        <div style={{
          fontSize: 14,
          color: "var(--text)",
          lineHeight: 1.6,
          marginBottom: onRetry ? 20 : 0,
        }}>
          {message || t.error?.loadFailed || "加载失败，请重试"}
        </div>

        {/* 重试按钮 */}
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: "none",
              background: "var(--accent)",
              color: "var(--bg)",
              fontFamily: "var(--font-primary)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "box-shadow 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 0 20px var(--accent-glow)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
          >
            {t.retry || "重试"}
          </button>
        )}
      </div>
    </div>
  );
}
