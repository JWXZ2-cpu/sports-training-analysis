import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useI18n } from "../locales/index.jsx";
import { athleteService } from "../services";
import LoadingState from "../components/LoadingState.jsx";

const RACE_OPTIONS = [
  { value: "1km", label: "1km", labelEn: "1km" },
  { value: "5km", label: "5km", labelEn: "5km" },
  { value: "10km", label: "10km", labelEn: "10km" },
  { value: "half", label: "半马 (21.1km)", labelEn: "Half Marathon (21.1km)" },
  { value: "full", label: "全马 (42.2km)", labelEn: "Full Marathon (42.2km)" },
];

const ZONE_LABELS = {
  zh: { E: "E 轻松跑", M: "M 马拉松配速", T: "T 乳酸阈", I: "I 间歇", R: "R 重复" },
  en: { E: "E Easy", M: "M Marathon", T: "T Threshold", I: "I Interval", R: "R Repetition" },
  it: { E: "E Facile", M: "M Maratona", T: "T Soglia", I: "I Intervalli", R: "R Ripetizioni" },
};

export default function AthleteOnboarding({ onComplete, isUpdate = false }) {
  const { user, authFetch } = useAuth();
  const { lang, t } = useI18n();
  const [mode, setMode] = useState("pb"); // "pb" | "conconi"
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // PB 表单
  const [raceType, setRaceType] = useState("10km");
  const [raceTime, setRaceTime] = useState("");
  const [maxHR, setMaxHR] = useState("190");

  // Conconi 表单
  const [conconi, setConconi] = useState({
    aerobicThresholdHR: "",
    aerobicThresholdPace: "",
    anaerobicThresholdHR: "",
    anaerobicThresholdPace: "",
    maxHR: "190",
  });

  // 已有数据（更新模式）
  const [existingData, setExistingData] = useState(null);
  useEffect(() => {
    if (isUpdate) {
      athleteService.getOnboardingStatus().then((data) => {
        if (data.vdot) setExistingData(data);
      }).catch(() => {});
    }
  }, [isUpdate]);

  const isZh = lang === "zh";
  const zoneLabels = ZONE_LABELS[lang] || ZONE_LABELS.zh;

  // 计算 VDOT
  const handleCalcVDOT = async () => {
    if (!raceTime) { setError(isZh ? "请输入完赛时间" : "Please enter race time"); return; }
    setCalculating(true); setError(null); setResult(null);
    try {
      const res = await authFetch("/athlete/onboarding/vdot", {
        method: "POST",
        body: JSON.stringify({ raceType, raceTime, maxHR: Number(maxHR) || 190 }),
      });
      const data = await res.json();
      setResult({ ...data, method: "vdot" });
    } catch (err) {
      setError(err.message);
    } finally { setCalculating(false); }
  };

  // 计算 Conconi
  const handleCalcConconi = async () => {
    const { aerobicThresholdHR, aerobicThresholdPace, anaerobicThresholdHR, anaerobicThresholdPace, maxHR: mhr } = conconi;
    if (!aerobicThresholdHR || !aerobicThresholdPace || !anaerobicThresholdHR || !anaerobicThresholdPace || !mhr) {
      setError(isZh ? "请填写完整的 Conconi 测试数据" : "Please fill in all Conconi test data");
      return;
    }
    setCalculating(true); setError(null); setResult(null);
    try {
      const res = await authFetch("/athlete/onboarding/conconi", {
        method: "POST",
        body: JSON.stringify({ ...conconi, maxHR: Number(mhr) }),
      });
      const data = await res.json();
      setResult({ ...data, method: "conconi", conconiData: conconi });
    } catch (err) {
      setError(err.message);
    } finally { setCalculating(false); }
  };

  // 保存结果
  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const res = await authFetch("/athlete/onboarding/save", {
        method: "POST",
        body: JSON.stringify({
          method: result.method,
          vdot: result.vdot,
          maxHR: result.maxHR,
          restingHR: 60,
          zones: result.zones,
          conconiData: result.conconiData || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "保存失败");
      if (onComplete) onComplete();
    } catch (err) {
      setError(err.message);
    } finally { setSaving(false); }
  };

  const updateConconi = (key, val) => setConconi((c) => ({ ...c, [key]: val }));

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "20px 16px", paddingBottom: 40 }}>
      <div style={{ maxWidth: 430, margin: "0 auto" }}>
        {/* 标题 */}
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: "0 0 8px" }}>
            {isUpdate
              ? (isZh ? "更新体测数据" : "Update Physiology Data")
              : (isZh ? "初始能力评估" : "Initial Fitness Assessment")
            }
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
            {isZh
              ? "通过测试数据计算你的训练区间，让 AI 分析更精准。建议每 4-6 周更新一次。"
              : "Calculate your training zones for more accurate AI analysis. Recommended to update every 4-6 weeks."
            }
          </p>
        </div>

        {/* 已有数据提示 */}
        {existingData && (
          <div style={{
            background: "rgba(212,164,76,0.10)", border: "1px solid rgba(212,164,76,0.2)",
            borderRadius: 10, padding: "12px 14px", marginBottom: 20, fontSize: 12, color: "var(--accent)",
          }}>
            {isZh
              ? `当前 VDOT: ${existingData.vdot}（上次评估: ${existingData.assessedAt?.substring(0, 10)}）`
              : `Current VDOT: ${existingData.vdot} (Last assessed: ${existingData.assessedAt?.substring(0, 10)})`
            }
            {existingData.isStale && (
              <span style={{ color: "var(--red)", marginLeft: 8 }}>
                {isZh ? "⚠ 已超过 6 周，建议更新" : "⚠ Over 6 weeks, update recommended"}
              </span>
            )}
          </div>
        )}

        {/* 模式切换 Tab */}
        <div style={{ display: "flex", gap: 0, marginBottom: 24, background: "var(--card)", borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)" }}>
          <button onClick={() => { setMode("pb"); setResult(null); setError(null); }} style={{
            flex: 1, padding: "12px 0", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
            background: mode === "pb" ? "var(--accent)" : "transparent",
            color: mode === "pb" ? "var(--bg)" : "var(--text-secondary)",
            fontFamily: "inherit", transition: "all 0.2s",
          }}>
            {isZh ? "PB 成绩推算" : "Race PB"}
          </button>
          <button onClick={() => { setMode("conconi"); setResult(null); setError(null); }} style={{
            flex: 1, padding: "12px 0", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
            background: mode === "conconi" ? "var(--accent)" : "transparent",
            color: mode === "conconi" ? "var(--bg)" : "var(--text-secondary)",
            fontFamily: "inherit", transition: "all 0.2s",
          }}>
            {isZh ? "Conconi 测试" : "Conconi Test"}
          </button>
        </div>

        {/* PB 成绩表单 */}
        {mode === "pb" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{isZh ? "比赛项目" : "Race Distance"}</label>
              <select value={raceType} onChange={(e) => setRaceType(e.target.value)} style={inputStyle}>
                {RACE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{isZh ? r.label : r.labelEn}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{isZh ? "完赛时间" : "Finish Time"}</label>
              <input
                value={raceTime}
                onChange={(e) => setRaceTime(e.target.value)}
                placeholder={isZh ? "如：45:00 或 3:15:00" : "e.g.: 45:00 or 3:15:00"}
                style={inputStyle}
              />
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
                {isZh ? "格式：分:秒 或 时:分:秒" : "Format: min:sec or hr:min:sec"}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>{isZh ? "最大心率（选填）" : "Max HR (optional)"}</label>
              <input
                value={maxHR}
                onChange={(e) => setMaxHR(e.target.value)}
                placeholder="190"
                type="number"
                style={inputStyle}
              />
            </div>
            <button onClick={handleCalcVDOT} disabled={calculating} style={primaryBtnStyle(calculating)}>
              {calculating ? (isZh ? "计算中..." : "Calculating...") : (isZh ? "🧠 计算训练区间" : "🧠 Calculate Zones")}
            </button>
          </div>
        )}

        {/* Conconi 表单 */}
        {mode === "conconi" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ marginBottom: 12, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {isZh
                ? "Conconi 测试通过递增负荷中心率与配速的拐点来确定乳酸阈。如无测试数据，建议使用 PB 成绩推算。"
                : "The Conconi test identifies lactate threshold from the heart rate-pace inflection point during incremental exercise. If unavailable, use Race PB instead."
              }
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>{isZh ? "有氧阈心率" : "Aerobic Threshold HR"}</label>
                <input value={conconi.aerobicThresholdHR} onChange={(e) => updateConconi("aerobicThresholdHR", e.target.value)} placeholder="155" type="number" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{isZh ? "有氧阈配速" : "Aerobic Threshold Pace"}</label>
                <input value={conconi.aerobicThresholdPace} onChange={(e) => updateConconi("aerobicThresholdPace", e.target.value)} placeholder="5:20" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{isZh ? "无氧阈心率" : "Anaerobic Threshold HR"}</label>
                <input value={conconi.anaerobicThresholdHR} onChange={(e) => updateConconi("anaerobicThresholdHR", e.target.value)} placeholder="175" type="number" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{isZh ? "无氧阈配速" : "Anaerobic Threshold Pace"}</label>
                <input value={conconi.anaerobicThresholdPace} onChange={(e) => updateConconi("anaerobicThresholdPace", e.target.value)} placeholder="4:10" style={inputStyle} />
              </div>
            </div>
            <div style={{ marginTop: 12, marginBottom: 20 }}>
              <label style={labelStyle}>{isZh ? "最大心率" : "Max HR"}</label>
              <input value={conconi.maxHR} onChange={(e) => updateConconi("maxHR", e.target.value)} placeholder="190" type="number" style={inputStyle} />
            </div>
            <button onClick={handleCalcConconi} disabled={calculating} style={primaryBtnStyle(calculating)}>
              {calculating ? (isZh ? "计算中..." : "Calculating...") : (isZh ? "🧠 计算训练区间" : "🧠 Calculate Zones")}
            </button>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div style={{
            background: "rgba(212,92,92,0.12)", border: "1px solid rgba(212,92,92,0.3)",
            borderRadius: 10, padding: "12px 14px", marginTop: 16, color: "var(--red)", fontSize: 13,
          }}>
            ❌ {error}
          </div>
        )}

        {/* 计算结果 */}
        {result && (
          <div style={{
            marginTop: 24, background: "var(--card)", border: "1px solid var(--green)",
            borderRadius: 16, padding: 20, animation: "fadeUp 0.4s ease",
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--green)", marginBottom: 4 }}>
              ✅ {isZh ? "计算结果" : "Results"}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>
              VDOT {result.vdot}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 16 }}>
              {result.method === "vdot"
                ? `${result.raceLabel} ${result.raceTime} → ${result.racePace}/km`
                : (isZh ? "基于 Conconi 测试数据" : "Based on Conconi test data")
              }
            </div>

            {/* 5 区表格 */}
            <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)", marginBottom: 16 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "rgba(212,164,76,0.08)" }}>
                    <th style={thStyle}>{isZh ? "区间" : "Zone"}</th>
                    <th style={thStyle}>{isZh ? "配速 (/km)" : "Pace (/km)"}</th>
                    <th style={thStyle}>{isZh ? "心率" : "HR"}</th>
                  </tr>
                </thead>
                <tbody>
                  {["E", "M", "T", "I", "R"].map((key) => {
                    const z = result.zones[key];
                    if (!z) return null;
                    return (
                      <tr key={key} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={tdStyle}>
                          <span style={{ fontWeight: 600, color: zoneColor(key) }}>{zoneLabels[key]}</span>
                        </td>
                        <td style={tdStyle}>{z.paceMin} - {z.paceMax}</td>
                        <td style={tdStyle}>{z.hrMin} - {z.hrMax} bpm</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 保存按钮 */}
            <button onClick={handleSave} disabled={saving} style={primaryBtnStyle(saving)}>
              {saving
                ? (isZh ? "保存中..." : "Saving...")
                : (isZh ? "✅ 保存并开始使用" : "✅ Save & Continue")
              }
            </button>
            {!isUpdate && (
              <button onClick={() => onComplete && onComplete()} style={{
                width: "100%", padding: "12px 0", marginTop: 8,
                background: "none", border: "none", color: "var(--text-dim)",
                fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              }}>
                {isZh ? "跳过，稍后设置" : "Skip for now"}
              </button>
            )}
          </div>
        )}

        {/* 跳过按钮（无结果时） */}
        {!result && !isUpdate && (
          <button onClick={() => onComplete && onComplete()} style={{
            width: "100%", padding: "14px 0", marginTop: 20,
            background: "none", border: "1px solid var(--border)",
            borderRadius: 10, color: "var(--text-secondary)",
            fontSize: 14, cursor: "pointer", fontFamily: "inherit",
          }}>
            {isZh ? "跳过，稍后设置" : "Skip for now"}
          </button>
        )}
      </div>

      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

// 样式
const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6,
};

const inputStyle = {
  width: "100%", padding: "12px 14px", background: "var(--card)",
  border: "1px solid var(--border)", borderRadius: 10,
  color: "var(--text)", fontFamily: "inherit", fontSize: 14,
  outline: "none", boxSizing: "border-box",
};

const primaryBtnStyle = (disabled) => ({
  width: "100%", padding: 14, borderRadius: 10, border: "none",
  background: disabled ? "var(--text-dim)" : "linear-gradient(135deg, var(--accent), #C08830)",
  color: "var(--bg)", fontFamily: "inherit", fontSize: 14, fontWeight: 600,
  cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.2s",
});

const thStyle = {
  padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "var(--text)", fontSize: 11,
};

const tdStyle = {
  padding: "10px 12px", color: "var(--text-secondary)",
};

function zoneColor(zone) {
  const map = { E: "var(--green)", M: "var(--blue)", T: "var(--amber)", I: "#E87040", R: "var(--red)" };
  return map[zone] || "var(--text)";
}
