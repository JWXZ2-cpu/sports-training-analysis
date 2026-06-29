// API calls migrated to services layer
import { ZONE_COLORS } from "../styles/sharedStyles.js";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { athleteService } from "../services";
import LoadingState from "../components/LoadingState.jsx";
import BottomNav from "../components/BottomNav.jsx";

// 区间颜色
const ZONE_MAP = {
  E: { color: "var(--blue)", label: "E 轻松跑" },
  M: { color: "var(--green)", label: "M 马拉松" },
  T: { color: "var(--accent)", label: "T 节奏跑" },
  I: { color: "var(--amber)", label: "I 间歇" },
  R: { color: "var(--red)", label: "R 冲刺" },
};

// 难点排名颜色
const RANK_COLORS = [
  { bg: "rgba(212,92,92,0.12)", color: "var(--red)" },    // 1st - red
  { bg: "rgba(232,168,73,0.12)", color: "var(--amber)" },    // 2nd - amber
  { bg: "rgba(232,168,73,0.12)", color: "var(--amber)" },    // 3rd - amber
  { bg: "rgba(212,164,76,0.12)", color: "var(--accent)" },    // 4th - gold
  { bg: "rgba(212,164,76,0.12)", color: "var(--accent)" },    // 5th - gold
];

export default function AthleteSummary() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30d");

  useEffect(() => { fetchSummary(); }, []);

  const fetchSummary = async () => {
    try {
      const data = await athleteService.getSummary();
      setSummary(data);
    } catch (err) {
      console.error("获取统计失败:", err);
    } finally { setLoading(false); }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!summary) {
    return (
      <div style={{ fontFamily: "var(--font-primary)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
        <div style={{ color: "var(--text-dim)" }}>暂无数据</div>
      </div>
    );
  }

  const { overview, score_trend, fatigue_trend, zone_distribution, top_difficulties } = summary;
  const totalZone = Object.values(zone_distribution || {}).reduce((a, b) => a + b, 0);

  // 计算评分趋势状态
  const scoreTrendUp = score_trend?.length >= 2 && (score_trend[score_trend.length - 1]?.body_score || 0) > (score_trend[0]?.body_score || 0);

  // 生成 SVG 折线图路径
  const generateLinePath = (data, dataKey, maxVal, height = 120) => {
    if (!data?.length) return { line: "", area: "", points: [] };
    const max = maxVal || Math.max(...data.map(d => d[dataKey] || 0), 1);
    const stepX = 360 / (data.length - 1);
    const points = data.map((d, i) => ({
      x: i * stepX,
      y: height - ((d[dataKey] || 0) / max) * (height - 20) - 10,
    }));
    const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const area = `${line} L360,${height} L0,${height} Z`;
    return { line, area, points };
  };

  const scorePath = generateLinePath(score_trend, "body_score", null, 140);
  const fatiguePath = generateLinePath(fatigue_trend, "fatigue_value", 3, 140);

  // 圆环图数据
  const donutRadius = 45;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const zoneEntries = ["E", "M", "T", "I", "R"].map(zone => ({
    zone,
    count: zone_distribution?.[zone] || 0,
    pct: totalZone > 0 ? Math.round(((zone_distribution?.[zone] || 0) / totalZone) * 100) : 0,
  }));

  return (
    <div style={{ fontFamily: "var(--font-primary)", fontSize: 13, color: "var(--text)", minHeight: "100vh", paddingBottom: 70, background: "var(--bg)" }}>
      {/* 顶部 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 16px 0", marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>
          数据总结
        </h1>
        <div style={{
          display: "flex", gap: 4, padding: 3, background: "#171613",
          borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", flexShrink: 0,
        }}>
          <button onClick={() => setRange("30d")} style={{
            fontFamily: "var(--font-primary)", fontSize: 12, fontWeight: 500,
            padding: "6px 14px", border: range === "30d" ? "1px solid rgba(212,164,76,0.15)" : "none", borderRadius: 7,
            background: range === "30d" ? "rgba(212,164,76,0.10)" : "transparent",
            color: range === "30d" ? "var(--accent)" : "var(--text-dim)",
            cursor: "pointer", transition: "all 0.2s",
          }}>近30天</button>
          <button onClick={() => setRange("7d")} style={{
            fontFamily: "var(--font-primary)", fontSize: 12, fontWeight: 500,
            padding: "6px 14px", border: range === "7d" ? "1px solid rgba(212,164,76,0.15)" : "none", borderRadius: 7,
            background: range === "7d" ? "rgba(212,164,76,0.10)" : "transparent",
            color: range === "7d" ? "var(--accent)" : "var(--text-dim)",
            cursor: "pointer", transition: "all 0.2s",
          }}>近7天</button>
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* Hero 卡片：评分 + 三项统计 */}
        <div style={{
          background: "linear-gradient(145deg, rgba(55,45,25,0.95) 0%, rgba(38,32,20,0.95) 50%, rgba(23,22,19,0.95) 100%)",
          border: "1px solid rgba(212,164,76,0.18)", borderRadius: 16, padding: 24,
          marginBottom: 20, position: "relative", overflow: "hidden",
          animation: "fadeUp 0.4s ease 0s both",
        }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-dim)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>
            平均自评
          </div>
          <div style={{ fontSize: 48, fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.03em", lineHeight: 1 }}>
            {overview.avg_score}<span style={{ fontSize: 20, fontWeight: 400, color: "var(--text-dim)", marginLeft: 2 }}>/ 10</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.5 }}>
            近 {range === "30d" ? "30" : "7"} 天共完成 {overview.total_sessions} 次训练，整体状态{scoreTrendUp ? "稳步上升" : "保持平稳"}
          </div>
          <div style={{ display: "flex", gap: 0, marginTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 18 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--green)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{overview.total_sessions}</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 5, fontWeight: 500 }}>训练次数</div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 2, bottom: 2, width: 1, background: "rgba(255,255,255,0.06)" }} />
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--amber)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{overview.total_distance}<span style={{ fontSize: 12, fontWeight: 400, marginLeft: 2 }}>km</span></div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 5, fontWeight: 500 }}>总跑量</div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 2, bottom: 2, width: 1, background: "rgba(255,255,255,0.06)" }} />
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{scoreTrendUp ? "↑" : "→"}</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 5, fontWeight: 500 }}>评分趋势</div>
            </div>
          </div>
        </div>

        {/* 评分趋势 — SVG 折线图 */}
        {score_trend?.length > 0 && (
          <div style={{ marginBottom: 20, animation: "fadeUp 0.4s ease 0.05s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.01em" }}>评分趋势（最近 {score_trend.length} 次）</span>
              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500, background: "rgba(107,191,110,0.12)", color: "var(--green)" }}>
                {scoreTrendUp ? "↑ 上升" : "→ 平稳"}
              </span>
            </div>
            <div style={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 18px 14px", overflow: "hidden" }}>
              <svg viewBox="0 0 360 140" style={{ width: "100%", height: 140, display: "block" }} preserveAspectRatio="none">
                {/* 网格线 */}
                <line x1="0" y1="35" x2="360" y2="35" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                <line x1="0" y1="70" x2="360" y2="70" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                <line x1="0" y1="105" x2="360" y2="105" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                {/* 区域填充 */}
                <path d={scorePath.area} fill="var(--green)" opacity="0.1" />
                {/* 折线 */}
                <path d={scorePath.line} fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {/* 数据点 */}
                {scorePath.points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={i === scorePath.points.length - 1 ? 4.5 : 4} fill="var(--green)" stroke="var(--card)" strokeWidth="2" />
                ))}
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10 }}>
                {score_trend.map((d, i) => (
                  <span key={i} style={{ fontSize: 10, color: "var(--text-dim)", fontWeight: 500 }}>{d.date?.substring(5) || ""}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 疲劳度趋势 — SVG 折线图 */}
        {fatigue_trend?.length > 0 && (
          <div style={{ marginBottom: 20, animation: "fadeUp 0.4s ease 0.1s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.01em" }}>疲劳度趋势（最近 {fatigue_trend.length} 次）</span>
              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500, background: "rgba(232,168,73,0.12)", color: "var(--amber)" }}>→ 平稳</span>
            </div>
            <div style={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 18px 14px", overflow: "hidden" }}>
              <svg viewBox="0 0 360 140" style={{ width: "100%", height: 140, display: "block" }} preserveAspectRatio="none">
                <line x1="0" y1="35" x2="360" y2="35" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                <line x1="0" y1="70" x2="360" y2="70" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                <line x1="0" y1="105" x2="360" y2="105" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                <path d={fatiguePath.area} fill="var(--amber)" opacity="0.1" />
                <path d={fatiguePath.line} fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {fatiguePath.points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={i === fatiguePath.points.length - 1 ? 4.5 : 4} fill="var(--amber)" stroke="var(--card)" strokeWidth="2" />
                ))}
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10 }}>
                {fatigue_trend.map((d, i) => (
                  <span key={i} style={{ fontSize: 10, color: "var(--text-dim)", fontWeight: 500 }}>{d.date?.substring(5) || ""}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 训练区间分布 — 圆环图 + 图例 */}
        {totalZone > 0 && (
          <div style={{ marginBottom: 20, animation: "fadeUp 0.4s ease 0.15s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.01em" }}>训练区间分布（近 {range === "30d" ? "30" : "7"} 天）</span>
            </div>
            <div style={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 20 }}>
              {/* 圆环图 */}
              <div style={{ flexShrink: 0, position: "relative", width: 110, height: 110 }}>
                <svg viewBox="0 0 110 110" style={{ width: 110, height: 110, transform: "rotate(-90deg)" }}>
                  {/* 背景环 */}
                  <circle cx="55" cy="55" r={donutRadius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
                  {/* 区间弧 */}
                  {(() => {
                    let offset = 0;
                    return zoneEntries.map(({ zone, pct }) => {
                      const dashLen = (pct / 100) * donutCircumference;
                      const el = (
                        <circle
                          key={zone}
                          cx="55" cy="55" r={donutRadius}
                          fill="none"
                          stroke={ZONE_MAP[zone].color}
                          strokeWidth="10"
                          strokeDasharray={`${dashLen} ${donutCircumference}`}
                          strokeDashoffset={-offset}
                        />
                      );
                      offset += dashLen;
                      return el;
                    });
                  })()}
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>{zoneEntries.length}</span>
                  <span style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 3, fontWeight: 500 }}>区间</span>
                </div>
              </div>
              {/* 图例 */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
                {zoneEntries.map(({ zone, pct }) => (
                  <div key={zone} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: ZONE_MAP[zone].color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ZONE_MAP[zone].label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", flexShrink: 0 }}>{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 常见训练难点 TOP5 */}
        {top_difficulties?.length > 0 && (
          <div style={{ marginBottom: 20, animation: "fadeUp 0.4s ease 0.2s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.01em" }}>常见训练难点 TOP5</span>
            </div>
            <div style={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
              {top_difficulties.slice(0, 5).map((d, i) => {
                const rankColor = RANK_COLORS[i] || RANK_COLORS[4];
                const maxCount = top_difficulties[0]?.count || 1;
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 18px", borderBottom: i < Math.min(top_difficulties.length, 5) - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 8,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, flexShrink: 0,
                      background: rankColor.bg, color: rankColor.color,
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{d.text}</div>
                      <div style={{ width: "100%", height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", marginTop: 8 }}>
                        <div style={{
                          height: "100%", borderRadius: 2, background: i === 0 ? "var(--red)" : "var(--amber)",
                          width: `${Math.round((d.count / maxCount) * 100)}%`,
                          transition: "width 0.6s ease",
                        }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 500, flexShrink: 0 }}>
                      {d.count}次
                    </span>
                  </div>
                );
              })}
            </div>
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

      <BottomNav active="data" badgeCount={0} />
    </div>
  );
}

