// API calls migrated to services layer
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { athleteService } from "../services";
import LoadingState from "../components/LoadingState.jsx";
import BottomNav from "../components/BottomNav.jsx";

// 状态对应的圆点颜色
const STATUS_DOTS = {
  good: { bg: "var(--green)", glow: "rgba(107,191,110,0.3)" },
  ok: { bg: "var(--amber)", glow: "rgba(232,168,73,0.3)" },
  tired: { bg: "var(--red)", glow: "rgba(212,92,92,0.3)" },
  great: { bg: "var(--accent)", glow: "var(--accent-glow)" },
  rest: { bg: "var(--text-dim)", glow: "none" },
};

// 根据评分和情绪判断状态
function getStatus(report) {
  if (!report) return "ok";
  const score = report.overall_score;
  if (score >= 8.5) return "great";
  if (score >= 7) return "good";
  if (score >= 5) return "ok";
  return "tired";
}

// 获取情绪 emoji
function getMoodEmoji(emotionDisplay) {
  if (!emotionDisplay) return "😐";
  if (emotionDisplay.includes("积极")) return "😊";
  if (emotionDisplay.includes("消极")) return "😟";
  if (emotionDisplay.includes("中性")) return "😐";
  return "🏃";
}

export default function AthleteDiary() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchReports(1); }, []);

  const fetchReports = async (pageNum) => {
    try {
      const data = await athleteService.getMyReports({ page: pageNum, limit: 10 });
      if (pageNum === 1) {
        setReports(data.reports || []);
      } else {
        setReports((prev) => [...prev, ...(data.reports || [])]);
      }
      setTotal(data.total || 0);
      setPage(pageNum);
    } catch (err) {
      console.error("获取训练记录失败:", err);
    } finally { setLoading(false); }
  };

  const loadMore = () => {
    fetchReports(page + 1);
  };

  return (
    <div className="app-shell">
      <div style={{ fontFamily: "var(--font-primary)", fontSize: 13, color: "var(--text)", minHeight: "100vh", paddingBottom: 70 }}>
        {/* 顶部 */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "12px 16px", borderBottom: "1px solid var(--border)",
          background: "var(--card)", position: "sticky", top: 0, zIndex: 10,
        }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>训练日记</span>
        </div>

        <div style={{ padding: "16px 22px" }}>
        {loading ? (
          <LoadingState size="small" />
        ) : reports.length > 0 ? (
          <div className="timeline" style={{ position: "relative", paddingLeft: 32 }}>
            {/* 竖线 */}
            <div style={{
              position: "absolute", left: 7, top: 8, bottom: 8, width: 2,
              background: "linear-gradient(to bottom, var(--accent) 0%, var(--text-dim) 30%, var(--text-dim) 100%)",
              borderRadius: 1,
            }} />

            {reports.map((r, i) => {
              const status = getStatus(r);
              const dot = STATUS_DOTS[status];
              const mood = getMoodEmoji(r.emotion_display);
              const delay = `${0.05 + i * 0.05}s`;

              return (
                <div key={r.id} style={{
                  position: "relative", marginBottom: 28,
                  animation: `fadeUp 0.4s ease ${delay} both`,
                }}>
                  {/* 圆点 */}
                  <div style={{
                    position: "absolute", left: -32, top: 8,
                    width: 12, height: 12, borderRadius: "50%",
                    border: "2.5px solid var(--bg)", zIndex: 1,
                    background: dot.bg,
                    boxShadow: dot.glow !== "none" ? `0 0 8px ${dot.glow}` : "none",
                  }} />

                  {/* 卡片 */}
                  <a href={`/athlete/report/${r.id}`} style={{
                    display: "block",
                    background: "var(--card)", border: "1px solid var(--border)",
                    borderRadius: 16, padding: 18,
                    textDecoration: "none", color: "inherit",
                    transition: "border-color 0.2s, background 0.2s",
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-light)";
                      e.currentTarget.style.background = "var(--card-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.background = "var(--card)";
                    }}
                  >
                    {/* 头部：日期 + 情绪 */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
                        {r.date} · {r.session_name || "训练"}
                      </span>
                      <span style={{ fontSize: 18 }}>{mood}</span>
                    </div>

                    {/* 正文 */}
                    <p style={{
                      fontFamily: "'Noto Serif SC', serif",
                      fontSize: 14.5, lineHeight: 1.7, color: "var(--text-secondary)",
                      margin: 0,
                    }}>
                      {r.summary || "训练已完成"}
                    </p>

                    {/* 标签 */}
                    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                      {r.risk_flag && (
                        <span style={{
                          fontSize: 11, padding: "3px 10px", borderRadius: 20,
                          background: "var(--red-dim)", color: "var(--red)", fontWeight: 500,
                        }}>队医已关注</span>
                      )}
                      {r.overall_score && (
                        <span style={{
                          fontSize: 11, padding: "3px 10px", borderRadius: 20,
                          background: "var(--blue-dim)", color: "var(--blue)", fontWeight: 500,
                        }}>评分 {r.overall_score}</span>
                      )}
                    </div>
                  </a>
                </div>
              );
            })}

            {/* 加载更多 */}
            {reports.length < total && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <button onClick={loadMore} style={{
                  padding: "8px 20px", borderRadius: 8,
                  background: "var(--accent-dim)", border: "1px solid rgba(212,164,76,0.15)",
                  color: "var(--accent)", fontSize: 12, fontWeight: 500, cursor: "pointer",
                }}>加载更多...</button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-dim)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
            <div>暂无训练记录</div>
          </div>
        )}
      </div>

      {/* fadeUp 动画 */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <BottomNav active="diary" badgeCount={0} />
      </div>
    </div>
  );
}
