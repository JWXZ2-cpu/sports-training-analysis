import { useState } from "react";
import { useI18n } from "../locales/index.jsx";

// FitData locale keys
const FIT_DATA = {
  zh: {
    title: "手表训练数据",
    distance: "距离：",
    duration: "用时：",
    pace: "配速：",
    cadence: "步频：",
    heartRate: "心率：",
    avg: "平均",
    max: "最大",
    power: "功率：",
    hideLaps: "收起分圈详情",
    showLaps: "查看分圈详情 ›",
    lap: "圈",
    minutes: "分钟",
    hours: "小时",
  },
  en: {
    title: "Watch Training Data",
    distance: "Distance: ",
    duration: "Duration: ",
    pace: "Pace: ",
    cadence: "Cadence: ",
    heartRate: "HR: ",
    avg: "Avg",
    max: "Max",
    power: "Power: ",
    hideLaps: "Hide Lap Details",
    showLaps: "Show Lap Details ›",
    lap: "Lap",
    minutes: "min",
    hours: "h",
  },
  it: {
    title: "Dati Allenamento Orologio",
    distance: "Distanza: ",
    duration: "Durata: ",
    pace: "Ritmo: ",
    cadence: "Cadenza: ",
    heartRate: "FC: ",
    avg: "Media",
    max: "Max",
    power: "Potenza: ",
    hideLaps: "Nascondi Dettagli Giri",
    showLaps: "Mostra Dettagli Giri ›",
    lap: "Giro",
    minutes: "min",
    hours: "h",
  },
};

// 手表数据卡片组件（运动员端和教练端共用）
export default function FitDataCard({ fitData, showDetails = true }) {
  const [showLaps, setShowLaps] = useState(false);
  const { lang } = useI18n();
  const fd = FIT_DATA[lang] || FIT_DATA.zh;
  if (!fitData) return null;

  const formatPace = (secPerKm) => {
    if (!secPerKm) return "--";
    const min = Math.floor(secPerKm / 60);
    const sec = secPerKm % 60;
    return `${min}:${sec.toString().padStart(2, "0")}/km`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "--";
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}${fd.minutes}`;
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    return `${h}${fd.hours}${m}${fd.minutes}`;
  };

  return (
    <div style={{
      background: "#fff", borderRadius: 12, padding: "14px 16px",
      border: "1px solid var(--accent-dim)", marginBottom: 12,
    }}>
      <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 500, marginBottom: 8 }}>
        📱 {fd.title}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 6 }}>{fitData.device}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: 12 }}>
        <div><span style={{ color: "var(--text-secondary)" }}>{fd.distance}</span>{(fitData.total_distance_meters / 1000).toFixed(2)}km</div>
        <div><span style={{ color: "var(--text-secondary)" }}>{fd.duration}</span>{formatDuration(fitData.total_duration_seconds)}</div>
        <div><span style={{ color: "var(--text-secondary)" }}>{fd.pace}</span>{formatPace(fitData.avg_pace_sec_per_km)}</div>
        <div><span style={{ color: "var(--text-secondary)" }}>{fd.cadence}</span>{fitData.avg_cadence || "--"}spm</div>
        <div><span style={{ color: "var(--text-secondary)" }}>{fd.heartRate}</span>{fd.avg}{fitData.avg_heart_rate || "--"} / {fd.max}{fitData.max_heart_rate || "--"}</div>
        <div><span style={{ color: "var(--text-secondary)" }}>{fd.power}</span>{fitData.avg_power || "--"}W</div>
      </div>

      {/* 分圈详情 */}
      {showDetails && fitData.laps?.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <button onClick={() => setShowLaps(!showLaps)} style={{
            background: "none", border: "none", color: "var(--accent)",
            fontSize: 11, cursor: "pointer", padding: 0,
          }}>
            {showLaps ? fd.hideLaps : fd.showLaps}
          </button>
          {showLaps && (
            <div style={{ marginTop: 6, fontSize: 11 }}>
              {fitData.laps.map((lap, i) => (
                <div key={i} style={{
                  display: "flex", gap: 8, padding: "4px 0",
                  borderBottom: i < fitData.laps.length - 1 ? "1px solid var(--border)" : "none",
                }}>
                  <span style={{ minWidth: 28, color: "var(--text-secondary)" }}>{fd.lap}{lap.lap_number}</span>
                  <span>{(lap.distance_meters / 1000).toFixed(2)}km</span>
                  <span>{formatPace(lap.avg_pace_sec_per_km)}</span>
                  <span>{lap.avg_heart_rate || "--"}bpm</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
