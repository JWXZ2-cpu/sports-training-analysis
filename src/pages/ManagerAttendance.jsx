// API calls migrated to services layer
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { managerService } from "../services";
import LoadingState from "../components/LoadingState.jsx";
import { ManagerNav } from "./ManagerHome.jsx";

const PERIODS = [
  { value: "week", label: "本周" },
  { value: "month", label: "本月" },
  { value: "quarter", label: "本季度" },
];

export default function ManagerAttendance() {
  const { user, logout } = useAuth();
  const [period, setPeriod] = useState("month");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAttendance(); }, [period]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const d = await managerService.getAttendance({ period });
      setData(d);
    } catch (err) {
      console.error("获取出勤数据失败:", err);
    } finally { setLoading(false); }
  };

  const getBarColor = (rate) => {
    const num = parseInt(rate);
    if (num >= 85) return "var(--green)";
    if (num >= 70) return "var(--amber)";
    return "var(--red)";
  };

  return (
    <div style={{ fontFamily: "var(--font-primary)", fontSize: 13, color: "var(--text)", minHeight: "100vh", paddingBottom: 60 }}>
      {/* 顶部 */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: "0.5px solid var(--border)",
        background: "#fff", position: "sticky", top: 0, zIndex: 10,
      }}>
        <a href="/manager" style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12, cursor: "pointer", textDecoration: "none" }}>← 返回</a>
        <span style={{ fontSize: 14, fontWeight: 500 }}>📋 出勤统计</span>
        <span style={{ width: 40 }}></span>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px" }}>
        {/* 时间范围选择 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {PERIODS.map((p) => (
            <button key={p.value} onClick={() => setPeriod(p.value)} style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer",
              border: period === p.value ? "1px solid var(--accent)" : "1px solid var(--border)",
              background: period === p.value ? "var(--accent-dim)" : "transparent",
              color: period === p.value ? "var(--accent)" : "var(--text-secondary)",
              fontWeight: period === p.value ? 500 : 400,
            }}>{p.label}</button>
          ))}
        </div>

        {loading ? (
          <LoadingState size="small" />
        ) : data ? (
          <>
            {/* 团队平均出勤率 */}
            <div style={{
              background: "#fff", borderRadius: 12, padding: "16px",
              border: "1px solid var(--border)", marginBottom: 16, textAlign: "center",
            }}>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>团队平均出勤率</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "var(--accent)" }}>{data.team_avg_attendance}</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
                {data.start_date} ~ {data.end_date}
              </div>
            </div>

            {/* 运动员出勤列表 */}
            <div style={{
              background: "#fff", borderRadius: 12, padding: "14px 16px",
              border: "1px solid var(--border)",
            }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>运动员出勤详情</div>
              {data.athletes?.map((a, i) => {
                const rateNum = parseInt(a.attendance_rate) || 0;
                const barColor = getBarColor(a.attendance_rate);
                return (
                  <div key={a.athlete_id} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 0", borderBottom: i < data.athletes.length - 1 ? "1px solid var(--border)" : "none",
                  }}>
                    <span style={{ minWidth: 60, fontSize: 12, fontWeight: 500 }}>{a.athlete_name}</span>
                    <span style={{ fontSize: 11, color: "var(--text-secondary)", minWidth: 40 }}>{a.actual_sessions}/{a.expected_sessions}</span>
                    <div style={{ flex: 1, height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{
                        width: `${rateNum}%`, height: "100%",
                        background: barColor, borderRadius: 4,
                        transition: "width 0.3s ease",
                      }} />
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 500, minWidth: 36, textAlign: "right",
                      color: barColor,
                    }}>{a.attendance_rate}</span>
                  </div>
                );
              })}
            </div>

            {/* 图例 */}
            <div style={{ display: "flex", gap: 16, marginTop: 12, justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: "var(--green)" }} />
                <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>≥85% 良好</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: "var(--amber)" }} />
                <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>70-85% 一般</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: "var(--red)" }} />
                <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>&lt;70% 需关注</span>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <ManagerNav active="attendance" />
    </div>
  );
}
