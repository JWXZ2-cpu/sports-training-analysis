import { useState, useRef, useCallback, useEffect } from "react";
import { useI18n } from "./locales/index.jsx";
import ResultView from "./components/ResultView.jsx";

export default function App() {
  const { lang, toggleLang, t } = useI18n();

  const [systemPrompt, setSystemPrompt] = useState(t.systemPrompt);
  const [userTemplate, setUserTemplate] = useState(t.userTemplate);
  const [fields, setFields] = useState(t.sampleData);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [rawJson, setRawJson] = useState(null);
  const [activeTab, setActiveTab] = useState("system");
  const [showRaw, setShowRaw] = useState(false);

  // When language changes, update prompts, template, and sample data
  const prevLang = useRef(lang);
  useEffect(() => {
    if (prevLang.current !== lang) {
      setSystemPrompt(t.systemPrompt);
      setUserTemplate(t.userTemplate);
      setFields(t.sampleData);
      setResult(null);
      setRawJson(null);
      setError(null);
      prevLang.current = lang;
    }
  }, [lang, t]);

  const buildUserPrompt = useCallback(() => {
    let msg = userTemplate;
    Object.entries(fields).forEach(([k, v]) => {
      msg = msg.replaceAll(`{{${k}}}`, v);
    });
    return msg;
  }, [userTemplate, fields]);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setRawJson(null);
    setActiveTab("result");
    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemPrompt,
          user: buildUserPrompt(),
        }),
      });
      const data = await resp.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      const text = data.content?.map((b) => b.text || "").join("") || "";
      setRawJson(text);

      // 多重容错：尝试提取 JSON
      let parsed = null;
      const clean = text.replace(/```json|```/g, "").trim();

      // 1) 直接解析
      try { parsed = JSON.parse(clean); } catch {}

      // 2) 提取第一个 { ... } 块
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

  const TAB_STYLE = (active) => ({
    padding: "7px 14px",
    fontSize: 12,
    cursor: "pointer",
    border: "none",
    borderBottom: active ? "2px solid #534AB7" : "2px solid transparent",
    background: "transparent",
    color: active ? "#534AB7" : "#888",
    fontWeight: active ? 500 : 400,
    transition: "all 0.15s",
  });

  const TEXTAREA_STYLE = {
    width: "100%",
    fontFamily: "monospace",
    fontSize: 11.5,
    lineHeight: 1.65,
    background: "#f8f7f4",
    border: "0.5px solid #d3d1c7",
    borderRadius: 8,
    padding: "10px 12px",
    color: "#2c2c2a",
    resize: "vertical",
    boxSizing: "border-box",
    outline: "none",
  };

  return (
    <div style={{ fontFamily: "sans-serif", fontSize: 13, color: "#2c2c2a" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>{t.title}</div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{t.subtitle}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Language toggle */}
          <button
            onClick={toggleLang}
            style={{
              padding: "7px 14px", borderRadius: 6, border: "0.5px solid #d3d1c7",
              background: "transparent", fontSize: 12, cursor: "pointer", color: "#534AB7",
              fontWeight: 500, minWidth: 42,
            }}
          >
            {t.langLabel}
          </button>
          <button
            onClick={handleRun}
            disabled={loading}
            style={{
              padding: "9px 20px", borderRadius: 8, border: "none",
              background: loading ? "#AFA9EC" : "#534AB7",
              color: "#fff", fontSize: 13, fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s",
            }}
          >
            {loading ? t.loadingBtn : t.runBtn}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "0.5px solid #d3d1c7", marginBottom: 14 }}>
        {[
          ["system", t.tabSystem],
          ["user", t.tabUser],
          ["data", t.tabData],
          ["result", t.tabResult],
        ].map(([id, label]) => (
          <button key={id} style={TAB_STYLE(activeTab === id)} onClick={() => setActiveTab(id)}>
            {label}
            {id === "result" && result && (
              <span style={{ marginLeft: 5, background: "#E1F5EE", color: "#0F6E56", borderRadius: 10, padding: "0 5px", fontSize: 10 }}>{t.tabDone}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: System Prompt */}
      {activeTab === "system" && (
        <div>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>{t.systemDesc}</div>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            style={{ ...TEXTAREA_STYLE, minHeight: 420 }}
          />
          <div style={{ marginTop: 8, fontSize: 11, color: "#888" }}>{t.systemHint}</div>
        </div>
      )}

      {/* Tab: User Template */}
      {activeTab === "user" && (
        <div>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>
            {t.userDesc}
            <span style={{ color: "#534AB7" }}> {Object.keys(fields).map((k) => `{{${k}}}`).join("  ")}</span>
          </div>
          <textarea
            value={userTemplate}
            onChange={(e) => setUserTemplate(e.target.value)}
            style={{ ...TEXTAREA_STYLE, minHeight: 380 }}
          />
          <div style={{ marginTop: 10, background: "#f8f7f4", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 6, fontWeight: 500 }}>{t.userPreview}</div>
            <pre style={{ fontSize: 11, color: "#444", lineHeight: 1.65, whiteSpace: "pre-wrap", margin: 0 }}>
              {buildUserPrompt()}
            </pre>
          </div>
        </div>
      )}

      {/* Tab: Test Data */}
      {activeTab === "data" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {Object.entries(fields).map(([key, val]) => (
            <div key={key} style={{ gridColumn: ["transcript", "tags", "recent_trend"].includes(key) ? "1 / -1" : undefined }}>
              <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 3 }}>{t.fields[key] || key}</label>
              {key === "transcript" ? (
                <textarea
                  value={val}
                  onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.value }))}
                  style={{ ...TEXTAREA_STYLE, minHeight: 80 }}
                  placeholder={t.placeholderTranscript}
                />
              ) : (
                <input
                  value={val}
                  onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.value }))}
                  style={{
                    width: "100%", height: 34, background: "#f8f7f4",
                    border: "0.5px solid #d3d1c7", borderRadius: 6,
                    padding: "0 10px", fontSize: 12, color: "#2c2c2a",
                    boxSizing: "border-box", outline: "none",
                  }}
                />
              )}
            </div>
          ))}
          <div style={{ gridColumn: "1 / -1", marginTop: 4 }}>
            <button
              onClick={() => setFields(t.sampleData)}
              style={{ fontSize: 11, padding: "5px 12px", borderRadius: 6, border: "0.5px solid #d3d1c7", background: "transparent", cursor: "pointer", color: "#888" }}
            >
              {t.resetBtn}
            </button>
          </div>
        </div>
      )}

      {/* Tab: Result */}
      {activeTab === "result" && (
        <div>
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "20px 0" }}>
              {t.loadingMsgs.map((msg, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.7 + i * 0.1 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#7F77DD", animation: "pulse 1s infinite", animationDelay: `${i * 0.2}s` }} />
                  <span style={{ fontSize: 12, color: "#888" }}>{msg}</span>
                </div>
              ))}
              <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
            </div>
          )}
          {error && (
            <div style={{ background: "#FCEBEB", border: "0.5px solid #F09595", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#A32D2D", whiteSpace: "pre-wrap" }}>
              {error}
              {rawJson && <pre style={{ marginTop: 8, background: "#fff5f5", padding: 8, borderRadius: 4, fontSize: 11, overflowX: "auto" }}>{rawJson}</pre>}
            </div>
          )}
          {result && !loading && (
            <div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                <button
                  onClick={() => setShowRaw((v) => !v)}
                  style={{ fontSize: 11, padding: "4px 10px", borderRadius: 5, border: "0.5px solid #d3d1c7", background: "transparent", cursor: "pointer", color: "#888" }}
                >
                  {showRaw ? t.showCard : t.showRaw}
                </button>
              </div>
              {showRaw ? (
                <pre style={{ ...TEXTAREA_STYLE, fontSize: 11, whiteSpace: "pre-wrap", overflow: "auto" }}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              ) : (
                <ResultView result={result} />
              )}
            </div>
          )}
          {!result && !loading && !error && (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#b4b2a9", fontSize: 13 }}>
              {t.emptyHint}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
