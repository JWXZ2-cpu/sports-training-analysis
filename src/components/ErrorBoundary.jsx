import { Component } from "react";
import zh from "../locales/zh.js";
import en from "../locales/en.js";

const LOCALES = { zh, en };

function getT() {
  const lang = localStorage.getItem("app_lang") || "zh";
  return LOCALES[lang] || zh;
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const t = getT();
      return (
        <div style={{
          minHeight: "100vh",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          fontFamily: "var(--font-primary)",
        }}>
          <div style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "40px 32px",
            maxWidth: 400,
            width: "100%",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: "0 0 12px" }}>
              {t.error?.pageError || "页面遇到了问题"}
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 28px", lineHeight: 1.6 }}>
              {t.error?.pageErrorMsg || "抱歉，页面渲染时发生了错误。你可以尝试重新加载或返回首页。"}
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details style={{
                textAlign: "left",
                marginBottom: 24,
                padding: 14,
                background: "var(--red-dim)",
                border: "1px solid var(--red)",
                borderRadius: 10,
                fontSize: 12,
                color: "var(--red)",
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                maxHeight: 200,
                overflow: "auto",
              }}>
                <summary style={{ cursor: "pointer", marginBottom: 8, fontWeight: 600 }}>
                  {t.error?.devDetails || "错误详情（开发模式）"}
                </summary>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </details>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={this.handleReload}
                style={{
                  flex: 1,
                  padding: "14px 0",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg, var(--accent) 0%, #C08830 100%)",
                  color: "var(--bg)",
                  fontFamily: "inherit",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "box-shadow 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 0 30px var(--accent-glow)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
              >
                {t.error?.reload || "重新加载"}
              </button>
              <button
                onClick={this.handleGoHome}
                style={{
                  flex: 1,
                  padding: "14px 0",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--text-secondary)",
                  fontFamily: "inherit",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                {t.error?.goHome || "返回首页"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
