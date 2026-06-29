// API calls migrated to services layer
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { doctorService } from "../services";
import LoadingState from "../components/LoadingState.jsx";
import { DoctorNav } from "./DoctorHome.jsx";

const STATUS_CONFIG = {
  no_conflict: { icon: "✅", color: "var(--green)", bg: "var(--green-dim)", border: "var(--green)", label: "无冲突" },
  minor_conflict: { icon: "⚠️", color: "var(--amber)", bg: "var(--amber-dim)", border: "var(--amber)", label: "轻微冲突" },
  major_conflict: { icon: "🔴", color: "var(--red)", bg: "var(--red-dim)", border: "var(--red)", label: "严重冲突" },
};

export default function DoctorConflictCheck({ onBack }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { runCheck(); }, []);

  const runCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await doctorService.getConflictCheck();
      setData(d);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ fontFamily: "var(--font-primary)", fontSize: 13, color: "var(--text)", minHeight: "100vh", paddingBottom: 60 }}>
      {/* 顶部 */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: "0.5px solid var(--border)",
        background: "#fff", position: "sticky", top: 0, zIndex: 10,
      }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12, cursor: "pointer" }}>← 返回</button>
        <span style={{ fontSize: 14, fontWeight: 500 }}>🔍 治疗-训练冲突检查</span>
        <button onClick={runCheck} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12, cursor: "pointer" }}>刷新</button>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px" }}>
        {loading ? (
          <LoadingState size="small" />
        ) : error ? (
          <div style={{ background: "var(--red-dim)", border: "1px solid var(--red)", borderRadius: 10, padding: "14px", color: "var(--red)" }}>❌ {error}</div>
        ) : data ? (
          <>
            {/* 摘要 */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, background: "#fff", borderRadius: 10, padding: "12px", border: "1px solid var(--border)", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>今日治疗</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>{data.results?.filter((r) => r.treatment !== "无今日治疗").length || 0}</div>
              </div>
              <div style={{ flex: 1, background: "#fff", borderRadius: 10, padding: "12px", border: "1px solid var(--border)", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>明日计划</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>{data.results?.filter((r) => r.tomorrow_plan !== "无明日计划").length || 0}</div>
              </div>
              <div style={{ flex: 1, background: data.conflict_count > 0 ? "var(--red-dim)" : "var(--green-dim)", borderRadius: 10, padding: "12px", border: `1px solid ${data.conflict_count > 0 ? "var(--red)" : "var(--green)"}`, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: data.conflict_count > 0 ? "var(--red)" : "var(--green)" }}>冲突</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: data.conflict_count > 0 ? "var(--red)" : "var(--green)" }}>{data.conflict_count + data.minor_conflict_count}</div>
              </div>
            </div>

            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 12 }}>
              检查日期：{data.check_date} → 明日：{data.tomorrow_date}
            </div>

            {/* 冲突结果列表 */}
            {data.results?.map((r, i) => {
              const config = STATUS_CONFIG[r.status] || STATUS_CONFIG.no_conflict;
              return (
                <div key={i} style={{
                  background: config.bg, borderRadius: 12, padding: "14px 16px",
                  border: `1px solid ${config.border}`, marginBottom: 10,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: config.color }}>{config.icon} {r.athlete_name}</span>
                    {r.status !== "no_conflict" && (
                      <span style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 10,
                        background: config.bg, color: config.color, border: `1px solid ${config.border}`,
                      }}>{config.label}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.8 }}>
                    <div><span style={{ color: "var(--text-secondary)" }}>今日治疗：</span>{r.treatment}</div>
                    <div><span style={{ color: "var(--text-secondary)" }}>明日计划：</span>{r.tomorrow_plan}</div>
                    <div><span style={{ color: "var(--text-secondary)" }}>分析：</span>{r.analysis}</div>
                    {r.suggestion && r.suggestion !== "无" && (
                      <div style={{ color: config.color, fontWeight: 500, marginTop: 4 }}>💡 {r.suggestion}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        ) : null}
      </div>

      <DoctorNav active={null} />
    </div>
  );
}
