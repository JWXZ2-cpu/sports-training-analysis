// API calls migrated to services layer
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useI18n } from "../locales/index.jsx";
import { coachService } from "../services";
import { startMimoAsr } from "../utils/mimoAsr.js";
import NotificationBell from "../components/NotificationBell.jsx";

const SESSION_TYPES_MAP = {
  zh: ["间歇训练", "节奏跑", "轻松跑", "长距离跑", "恢复跑", "力量训练", "比赛"],
  en: ["Interval", "Tempo Run", "Easy Run", "Long Run", "Recovery Run", "Strength", "Race"],
};

export default function CoachSessionRecord({ onBack }) {
  const { user } = useAuth();
  const { lang, t } = useI18n();
  const coachT = t.coach || {};
  const sessionTypes = SESSION_TYPES_MAP[lang] || SESSION_TYPES_MAP.zh;
  const [rawText, setRawText] = useState("");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [sessionType, setSessionType] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [records, setRecords] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const asrRef = useRef(null);

  useEffect(() => { fetchRecords(); }, []);

  const fetchRecords = async () => {
    try {
      const data = await coachService.getSessionRecords({ limit: 10 });
      setRecords(data.records || []);
    } catch {}
  };

  const toggleRecording = () => {
    if (isRecognizing) return;

    if (isRecording) {
      if (asrRef.current) asrRef.current.stop();
      setIsRecording(false);
      setIsRecognizing(true);
    } else {
      setRawText("");
      const asr = startMimoAsr({
        language: "zh",
        onResult: (text) => {
          setIsRecognizing(false);
          setRawText(text);
        },
        onError: (msg) => {
          setIsRecognizing(false);
          setIsRecording(false);
          alert(msg);
        },
      });
      asrRef.current = asr;
      asr.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = async () => {
    if (!rawText.trim()) { alert(coachT.inputRequired || "请输入训练课内容"); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await coachService.createSessionRecord({
        raw_voice_text: rawText.trim(),
        session_date: sessionDate,
        session_type: sessionType || undefined,
      });
      setResult(data.parsed);
      setRawText("");
      setSessionType("");
      fetchRecords();
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  // 统计数据
  const today = new Date().toISOString().split("T")[0];
  const todayCount = records.filter(r => r.session_date === today).length;
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
  const weekCount = records.filter(r => r.session_date >= weekAgo).length;
  const monthCount = records.length;

  // 历史记录视图
  if (showHistory) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 70 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 16px 0" }}>
          <div>
            <button onClick={() => setShowHistory(false)} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12, cursor: "pointer", marginBottom: 8 }}>{coachT.back || "← 返回"}</button>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>{coachT.historyRecords || "训练记录历史"}</h1>
          </div>
        </div>
        <div style={{ padding: "0 16px" }}>
          {records.length > 0 ? records.map((r, i) => (
            <div key={r.id} style={{
              display: "flex", gap: 0, background: "var(--card)",
              border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, marginBottom: 12,
              overflow: "hidden", cursor: "pointer",
              animation: `fadeUp 0.4s ease ${0.35 + i * 0.05}s both`,
            }}>
              <div style={{
                width: 52, flexShrink: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 2,
                background: "#171613", borderRight: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ fontSize: 10, color: "var(--text-dim)", fontWeight: 500 }}>{r.session_date?.substring(5, 7)}{coachT.month || "月"}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>{r.session_date?.substring(8)}</div>
              </div>
              <div style={{ flex: 1, padding: "14px 16px", minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 5, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
                  {r.session_type || (coachT.trainingSession || "训练课")}
                </div>
                <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {r.parsed_data?.session_summary || r.raw_voice_text?.substring(0, 60) || (coachT.trainingRecord || "训练记录")}
                </div>
              </div>
            </div>
          )) : (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-dim)" }}>{coachT.noRecordsYet || "暂无记录"}</div>
          )}
        </div>
        <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </div>
    );
  }

  // 主视图
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 70 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 16px 0" }}>
        <div>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12, cursor: "pointer", marginBottom: 8 }}>{coachT.back || "← 返回"}</button>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>{coachT.trainingSession || "训练课记录"}</h1>
        </div>
        <NotificationBell />
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* 今日统计 */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24, animation: "fadeUp 0.4s ease 0s both" }}>
          <div style={{ flex: 1, padding: "14px 10px", background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>{todayCount}</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 5, fontWeight: 500 }}>{coachT.todayRecords || "今日记录"}</div>
          </div>
          <div style={{ flex: 1, padding: "14px 10px", background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--green)", lineHeight: 1 }}>{weekCount}</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 5, fontWeight: 500 }}>{coachT.weekRecords || "本周记录"}</div>
          </div>
          <div style={{ flex: 1, padding: "14px 10px", background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--blue)", lineHeight: 1 }}>{monthCount}</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 5, fontWeight: 500 }}>{coachT.monthRecords || "本月记录"}</div>
          </div>
        </div>

        {/* 时间轴式录入流程 */}
        <div style={{ position: "relative", paddingLeft: 28, marginBottom: 28 }}>
          {/* 时间轴线 */}
          <div style={{
            position: "absolute", left: 8, top: 12, bottom: 12,
            width: 2, background: "linear-gradient(to bottom, var(--accent) 0%, var(--text-dim) 100%)",
            borderRadius: 1,
          }} />

          {/* 步骤1：训练日期 */}
          <div style={{ position: "relative", marginBottom: 20, animation: "fadeUp 0.4s ease 0.05s both" }}>
            <div style={{
              position: "absolute", left: -28, top: 18, width: 18, height: 18,
              borderRadius: "50%", border: "3px solid var(--bg)", zIndex: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "var(--accent)", boxShadow: "0 0 8px rgba(212,164,76,0.20)",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--bg)" }} />
            </div>
            <div style={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(212,164,76,0.10)", color: "var(--accent)", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>1</span>
                {coachT.step1 || "训练日期"}
              </div>
              <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} style={inputStyle} />
            </div>
          </div>

          {/* 步骤2：训练类型 */}
          <div style={{ position: "relative", marginBottom: 20, animation: "fadeUp 0.4s ease 0.1s both" }}>
            <div style={{
              position: "absolute", left: -28, top: 18, width: 18, height: 18,
              borderRadius: "50%", border: "3px solid var(--bg)", zIndex: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: sessionType ? "var(--accent)" : "var(--text-dim)",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: sessionType ? "var(--bg)" : "transparent" }} />
            </div>
            <div style={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(212,164,76,0.10)", color: "var(--accent)", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>2</span>
                {coachT.step2 || "训练类型"}
              </div>
              <select value={sessionType} onChange={(e) => setSessionType(e.target.value)} style={inputStyle}>
                <option value="">{coachT.selectType || "选择训练类型"}</option>
                {sessionTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* 步骤3：训练课内容 */}
          <div style={{ position: "relative", marginBottom: 0, animation: "fadeUp 0.4s ease 0.15s both" }}>
            <div style={{
              position: "absolute", left: -28, top: 18, width: 18, height: 18,
              borderRadius: "50%", border: "3px solid var(--bg)", zIndex: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: rawText.trim() ? "var(--accent)" : "var(--text-dim)",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: rawText.trim() ? "var(--bg)" : "transparent" }} />
            </div>
            <div style={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(212,164,76,0.10)", color: "var(--accent)", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>3</span>
                {coachT.step3 || "训练课内容"}
              </div>
              <div style={{ marginBottom: 12 }}>
                <button onClick={toggleRecording} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "11px 16px", width: "100%",
                  border: isRecording ? "1px solid var(--red)" : "1px dashed rgba(255,255,255,0.10)",
                  borderRadius: 10, background: isRecording ? "rgba(212,92,92,0.12)" : "none",
                  color: isRecording ? "var(--red)" : "var(--text-secondary)",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 500,
                  cursor: "pointer", transition: "all 0.2s", justifyContent: "center",
                  animation: isRecording ? "recordPulse 1.5s ease infinite" : "none",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="1" width="6" height="11" rx="3" />
                    <path d="M5 10a7 7 0 0 0 14 0" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                  </svg>
                  {isRecognizing ? (coachT.recognizing || "识别中...") : isRecording ? (coachT.recordingStop || "正在录音… 点击结束") : (coachT.voiceRecord || "语音录入训练课")}
                </button>
              </div>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={coachT.voiceRecordHint || "口述今天的训练课情况，如：今天400米间歇10组，张明远最好58秒..."}
                rows={4}
                style={{
                  ...inputStyle, minHeight: 110, resize: "vertical",
                  fontFamily: "'Noto Serif SC', serif", lineHeight: 1.6,
                }}
              />
            </div>
          </div>
        </div>

        {/* 提交按钮 */}
        <button onClick={handleSubmit} disabled={loading || !rawText.trim()} style={{
          width: "100%", padding: 15, borderRadius: 10, border: "none",
          background: loading || !rawText.trim() ? "var(--text-dim)" : "linear-gradient(135deg, var(--accent) 0%, #C08830 100%)",
          color: "var(--bg)", fontFamily: "inherit", fontSize: 14, fontWeight: 600,
          cursor: loading || !rawText.trim() ? "not-allowed" : "pointer",
          transition: "all 0.2s", animation: "fadeUp 0.4s ease 0.25s both",
        }}>
          {loading ? (coachT.aiParsing || "AI 解析中...") : (coachT.confirmSubmit || "确认提交")}
        </button>

        {/* 最近记录 */}
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: "28px 0 14px", display: "flex", alignItems: "center", gap: 8, animation: "fadeUp 0.4s ease 0.3s both" }}>
          {coachT.recentRecords || "最近记录"}
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "rgba(212,164,76,0.10)", color: "var(--accent)", fontWeight: 600 }}>{(coachT.recordsCount || "{count} 条").replace("{count}", records.length)}</span>
        </div>

        {records.slice(0, 3).map((r, i) => (
          <div key={r.id} onClick={() => setShowHistory(true)} style={{
            display: "flex", gap: 0, background: "var(--card)",
            border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16,
            overflow: "hidden", marginBottom: 12, cursor: "pointer",
            transition: "border-color 0.2s, background 0.2s",
            animation: `fadeUp 0.4s ease ${0.35 + i * 0.05}s both`,
          }}>
            <div style={{
              width: 52, flexShrink: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 2,
              background: "#171613", borderRight: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ fontSize: 10, color: "var(--text-dim)", fontWeight: 500 }}>{r.session_date?.substring(5, 7)}{coachT.month || "月"}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>{r.session_date?.substring(8)}</div>
            </div>
            <div style={{ flex: 1, padding: "14px 16px", minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 5, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
                {r.session_type || (coachT.trainingSession || "训练课")}
              </div>
              <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {r.parsed_data?.session_summary || r.raw_voice_text?.substring(0, 60) || (coachT.trainingRecord || "训练记录")}
              </div>
            </div>
          </div>
        ))}

        <button onClick={() => setShowHistory(true)} style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, padding: 12, width: "100%",
          background: "none", border: "1px dashed rgba(255,255,255,0.10)",
          borderRadius: 10, color: "var(--text-dim)",
          fontFamily: "inherit", fontSize: 13, fontWeight: 500,
          cursor: "pointer", transition: "all 0.2s",
          animation: "fadeUp 0.4s ease 0.5s both",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {coachT.viewAllHistory || "查看全部历史记录"}
        </button>

        {/* 错误 */}
        {error && (
          <div style={{
            background: "rgba(212,92,92,0.12)", border: "1px solid rgba(212,92,92,0.3)",
            borderRadius: 12, padding: 14, marginTop: 16, color: "var(--red)", fontSize: 13,
          }}>❌ {error}</div>
        )}

        {/* AI解析结果 */}
        {result && (
          <div style={{
            background: "var(--card)", border: "1px solid var(--green)",
            borderRadius: 16, padding: 18, marginTop: 16,
            animation: "fadeUp 0.4s ease 0s both",
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--green)", marginBottom: 12 }}>📋 {coachT.aiParseResult || "AI 解析结果"}</div>

            {result.session_type && (
              <div style={{ marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: "var(--text-secondary)" }}>{coachT.sessionType || "训练类型"}：</span>
                <strong style={{ color: "var(--text)" }}>{result.session_type}</strong>
              </div>
            )}

            {result.session_summary && (
              <div style={{ marginBottom: 10, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{result.session_summary}</div>
            )}

            {result.athlete_records?.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)", marginBottom: 6 }}>{coachT.athleteRecords || "运动员记录"}</div>
                {result.athlete_records.map((a, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 0", borderBottom: i < result.athlete_records.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                    fontSize: 12,
                  }}>
                    <span style={{ fontWeight: 500, color: "var(--text)" }}>{a.athlete_name}</span>
                    <span style={{ color: "var(--text-secondary)", flex: 1, margin: "0 12px" }}>{a.performance}</span>
                    <span style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 500,
                      background: a.status === "优秀" || a.status === "良好" ? "rgba(107,191,110,0.12)" : a.status === "一般" ? "rgba(232,168,73,0.12)" : "rgba(212,92,92,0.12)",
                      color: a.status === "优秀" || a.status === "良好" ? "var(--green)" : a.status === "一般" ? "var(--amber)" : "var(--red)",
                    }}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}

            {result.overall_evaluation && (
              <div style={{ marginBottom: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                <span style={{ color: "var(--text-dim)" }}>{coachT.overallEvaluation || "整体评价"}：</span>{result.overall_evaluation}
              </div>
            )}

            {result.training_arrangement && (
              <div style={{ marginBottom: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                <span style={{ color: "var(--text-dim)" }}>{coachT.followUpArrangement || "后续安排"}：</span>{result.training_arrangement}
              </div>
            )}

            {result.key_observations?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {result.key_observations.map((o, i) => (
                  <span key={i} style={{
                    fontSize: 11, padding: "3px 10px", borderRadius: 12,
                    background: "rgba(212,164,76,0.10)", color: "var(--accent)",
                  }}>{o}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes recordPulse { 0%,100% { box-shadow: 0 0 10px rgba(212,92,92,0.1); } 50% { box-shadow: 0 0 25px rgba(212,92,92,0.2); } }
      `}</style>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "12px 14px", background: "#171613",
  border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10,
  color: "var(--text)", fontFamily: "inherit", fontSize: 14,
  outline: "none", transition: "border-color 0.2s", boxSizing: "border-box",
};
