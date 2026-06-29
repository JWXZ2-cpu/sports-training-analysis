// API calls migrated to services layer
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useI18n } from "../locales/index.jsx";
import { authService, planService } from "../services";
import { INPUT, SELECT, LABEL, ZONE_COLORS } from "../styles/sharedStyles.js";

const GOALS_MAP = {
  zh: [
    { value: "提升有氧耐力", label: "提升有氧耐力" },
    { value: "提升乳酸阈值", label: "提升乳酸阈值" },
    { value: "提升最大摄氧量", label: "提升最大摄氧量" },
    { value: "提升速度爆发力", label: "提升速度爆发力" },
    { value: "赛前减量", label: "赛前减量" },
    { value: "维持状态", label: "维持状态" },
  ],
  en: [
    { value: "提升有氧耐力", label: "Improve Aerobic Endurance" },
    { value: "提升乳酸阈值", label: "Improve Lactate Threshold" },
    { value: "提升最大摄氧量", label: "Improve VO2max" },
    { value: "提升速度爆发力", label: "Improve Speed & Power" },
    { value: "赛前减量", label: "Pre-Race Taper" },
    { value: "维持状态", label: "Maintain Fitness" },
  ],
  it: [
    { value: "提升有氧耐力", label: "Migliorare Resistenza Aerobica" },
    { value: "提升乳酸阈值", label: "Migliorare Soglia del Lattato" },
    { value: "提升最大摄氧量", label: "Migliorare VO2max" },
    { value: "提升速度爆发力", label: "Migliorare Velocità e Potenza" },
    { value: "赛前减量", label: "Riduzione Pre-Gara" },
    { value: "维持状态", label: "Mantenere Fitness" },
  ],
};

const PHASES_MAP = {
  zh: [
    { value: "基础期", label: "基础期" },
    { value: "强化期", label: "强化期" },
    { value: "赛前期", label: "赛前期" },
    { value: "比赛期", label: "比赛期" },
    { value: "过渡期", label: "过渡期" },
  ],
  en: [
    { value: "基础期", label: "Base Phase" },
    { value: "强化期", label: "Build Phase" },
    { value: "赛前期", label: "Peak Phase" },
    { value: "比赛期", label: "Race Phase" },
    { value: "过渡期", label: "Recovery Phase" },
  ],
  it: [
    { value: "基础期", label: "Fase Base" },
    { value: "强化期", label: "Fase di Costruzione" },
    { value: "赛前期", label: "Fase di Picco" },
    { value: "比赛期", label: "Fase di Gara" },
    { value: "过渡期", label: "Fase di Recupero" },
  ],
};

const DAY_NAMES_MAP = {
  zh: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  it: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"],
};

export default function CoachAISuggestion({ onBack }) {
  const { user } = useAuth();
  const { lang, t } = useI18n();
  const coachT = t.coach || {};
  const GOALS = GOALS_MAP[lang] || GOALS_MAP.zh;
  const PHASES = PHASES_MAP[lang] || PHASES_MAP.zh;
  const DAY_NAMES = DAY_NAMES_MAP[lang] || DAY_NAMES_MAP.zh;
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);
  const [error, setError] = useState(null);

  // 表单
  const [goal, setGoal] = useState("提升有氧耐力");
  const [selectedAthletes, setSelectedAthletes] = useState([]);
  const [phase, setPhase] = useState("强化期");
  const [daysToRace, setDaysToRace] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => { fetchAthletes(); }, []);

  const fetchAthletes = async () => {
    try {
      const data = await authService.getAthletes();
      setAthletes(data.athletes || []);
    } catch {}
  };

  const toggleAthlete = (id) => {
    setSelectedAthletes((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
  };

  const selectAll = () => {
    setSelectedAthletes(athletes.map((a) => a.id));
  };

  const handleGenerate = async () => {
    if (selectedAthletes.length === 0) { alert("请选择至少一名运动员"); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await planService.getAIPlanSuggestion({
        goal, athlete_ids: selectedAthletes,
        training_phase: phase, days_to_race: daysToRace ? parseInt(daysToRace) : null, notes,
      });
      setResult(data);
    } catch (err) {
      setError(err.message + (err.raw ? `\n\nAI原始返回:\n${err.raw}` : ""));
    } finally { setLoading(false); }
  };

  // 采纳为本周计划
  const handleAdopt = async () => {
    if (!result?.weekly_plan) return;
    if (!confirm(coachT.confirmAdopt || "确定将此计划采纳为本周训练计划？")) return;
    setLoading(true);
    try {
      const monday = new Date();
      const day = monday.getDay();
      monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));

      for (let i = 0; i < result.weekly_plan.length; i++) {
        const p = result.weekly_plan[i];
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dateStr = d.toISOString().split("T")[0];

        await planService.createPlan({
          title: p.title,
          plan_date: dateStr,
          plan_type: "daily",
          training_zone: p.zone,
          intensity_level: p.zone === "E" || p.zone === "M" ? "low" : p.zone === "T" ? "medium" : "high",
          target_pace: p.target_pace,
          target_hr: p.target_hr,
          estimated_distance: p.distance,
          estimated_duration: p.duration,
          target_athletes: selectedAthletes,
          content_json: {
            warmup: "",
            main: [{ exercise: p.content, pace: p.target_pace, rest: "" }],
            cooldown: "",
          },
          notes: p.notes || "",
        });
      }
      alert(coachT.planAdopted || "训练计划已全部采纳！");
      onBack();
    } catch (err) {
      alert((coachT.planAdoptFailed || "采纳失败: ") + err.message);
    } finally { setLoading(false); }
  };

  // 计算区间分布条形图
  const renderZoneBar = () => {
    if (!result?.load_analysis?.zone_distribution) return null;
    const dist = result.load_analysis.zone_distribution;
    return (
      <div style={{ display: "flex", height: 24, borderRadius: 6, overflow: "hidden", marginBottom: 8 }}>
        {Object.entries(dist).map(([zone, pct]) => {
          const val = parseInt(pct) || 0;
          if (val <= 0) return null;
          return (
            <div key={zone} style={{
              width: `${val}%`, background: ZONE_COLORS[zone] || "#ccc",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, color: "#fff", fontWeight: 500,
            }}>
              {val >= 10 ? `${zone} ${val}%` : ""}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "var(--font-primary)", fontSize: 13, color: "var(--text)", minHeight: "100vh" }}>
      {/* 顶部 */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: "0.5px solid var(--border)",
        background: "var(--surface)", position: "sticky", top: 0, zIndex: 10,
      }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12, cursor: "pointer" }}>{coachT.back || "← 返回"}</button>
        <span style={{ fontSize: 14, fontWeight: 500 }}>🤖 {coachT.aiSuggestionTitle || "AI辅助制定训练计划"}</span>
        <span style={{ width: 40 }}></span>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px" }}>
        {/* 输入区域 */}
        <div style={{
          background: "var(--card)", borderRadius: 12, padding: "16px",
          border: "1px solid var(--border)", marginBottom: 16,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={LABEL}>{coachT.trainingGoal || "训练目标"}</label>
              <select value={goal} onChange={(e) => setGoal(e.target.value)} style={SELECT}>
                {GOALS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>{coachT.currentPhase || "当前训练阶段"}</label>
              <select value={phase} onChange={(e) => setPhase(e.target.value)} style={SELECT}>
                {PHASES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={LABEL}>{coachT.targetAthletes || "目标运动员"}</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <button onClick={selectAll} style={{
                padding: "4px 10px", borderRadius: 14, fontSize: 11, cursor: "pointer",
                border: selectedAthletes.length === athletes.length ? "1px solid var(--accent)" : "1px solid var(--border)",
                background: selectedAthletes.length === athletes.length ? "var(--accent-dim)" : "transparent",
                color: selectedAthletes.length === athletes.length ? "var(--accent)" : "var(--text-secondary)",
              }}>{coachT.selectAll || "全选"}</button>
              {athletes.map((a) => (
                <button key={a.id} onClick={() => toggleAthlete(a.id)} style={{
                  padding: "4px 10px", borderRadius: 14, fontSize: 11, cursor: "pointer",
                  border: selectedAthletes.includes(a.id) ? "1px solid var(--accent)" : "1px solid var(--border)",
                  background: selectedAthletes.includes(a.id) ? "var(--accent-dim)" : "transparent",
                  color: selectedAthletes.includes(a.id) ? "var(--accent)" : "var(--text-secondary)",
                }}>{a.display_name}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={LABEL}>{coachT.daysToRace || "距离目标赛事（天）"}</label>
              <input value={daysToRace} onChange={(e) => setDaysToRace(e.target.value)}
                type="number" placeholder={coachT.daysToRaceHint || "选填"} style={INPUT} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={LABEL}>{coachT.specialNotes || "特殊注意事项（选填）"}</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder={coachT.specialNotesHint || "如：张明远膝盖有伤，避免高冲击训练"}
              rows={2} style={{ ...INPUT, minHeight: 50, resize: "vertical", fontFamily: "inherit" }} />
          </div>

          <button onClick={handleGenerate} disabled={loading} style={{
            width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
            background: loading ? "var(--text-dim)" : "var(--accent)",
            color: "#fff", fontSize: 14, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer",
          }}>
            {loading ? (coachT.generating || "生成中...") : `🧠 ${coachT.generatePlan || "生成训练计划建议"}`}
          </button>
        </div>

        {/* 加载动画 */}
        {loading && (
          <div style={{ textAlign: "center", padding: 32 }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>🧠</div>
            <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500 }}>{coachT.aiAnalyzing || "AI正在根据丹尼尔斯和邦帕理论制定训练计划..."}</div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 8 }}>{coachT.analyzingDetail || "分析运动员数据 · 计算最优负荷 · 生成周计划"}</div>
          </div>
        )}

        {/* 错误 */}
        {error && (
          <div style={{
            background: "var(--red-dim)", border: "1px solid var(--red)", borderRadius: 10,
            padding: "14px", fontSize: 13, color: "var(--red)", marginBottom: 16,
            whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}>
            ❌ {error}
          </div>
        )}

        {/* 输出区域 */}
        {result && !loading && (
          <>
            {/* 一周训练计划 */}
            <div style={{
              background: "var(--card)", borderRadius: 12, padding: "16px",
              border: "1px solid var(--border)", marginBottom: 12,
            }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>📋 {coachT.weeklyPlan || "一周训练计划建议"}</div>
              {result.weekly_plan?.map((p, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div onClick={() => setExpandedDay(expandedDay === i ? null : i)} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 8, background: "var(--surface)",
                    cursor: "pointer",
                  }}>
                    <span style={{ minWidth: 32, fontWeight: 500, color: "var(--accent)" }}>{p.day}</span>
                    <span style={{ flex: 1, fontWeight: 500 }}>{p.title}</span>
                    {p.zone && <span style={{
                      fontSize: 10, padding: "2px 6px", borderRadius: 8,
                      background: (ZONE_COLORS[p.zone] || "var(--text-secondary)") + "18",
                      color: ZONE_COLORS[p.zone] || "var(--text-secondary)",
                    }}>{p.zone}{coachT.zone || "区"}</span>}
                    <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{p.target_pace}</span>
                    <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{p.distance}</span>
                    <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{expandedDay === i ? "▾" : "›"}</span>
                  </div>
                  {expandedDay === i && (
                    <div style={{
                      padding: "10px 12px 10px 52px", fontSize: 12, color: "var(--text-secondary)",
                      lineHeight: 1.8, background: "var(--surface)",
                    }}>
                      <div>{p.content}</div>
                      {p.target_hr && <div style={{ color: "var(--text-secondary)" }}>{coachT.heartRate || "心率:"} {p.target_hr}</div>}
                      {p.duration && <div style={{ color: "var(--text-secondary)" }}>{coachT.duration || "时长:"} {p.duration}</div>}
                      {p.notes && <div style={{ color: "var(--amber)", marginTop: 4 }}>⚠️ {p.notes}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 周负荷分析 */}
            {result.load_analysis && (
              <div style={{
                background: "var(--card)", borderRadius: 12, padding: "16px",
                border: "1px solid var(--border)", marginBottom: 12,
              }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>📊 {coachT.loadAnalysis || "周负荷分析"}</div>
                {renderZoneBar()}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                  {Object.entries(result.load_analysis.zone_distribution || {}).map(([zone, pct]) => (
                    <span key={zone} style={{ fontSize: 11 }}>
                      <span style={{ color: ZONE_COLORS[zone], fontWeight: 600 }}>{zone}</span> {pct}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  <div>{coachT.totalDistance || "总跑量:"} <strong>{result.load_analysis.total_weekly_distance}</strong></div>
                  <div>{coachT.intensityBalance || "强度平衡:"} {result.load_analysis.intensity_balance}</div>
                  <div>{coachT.loadSuggestion || "负荷建议:"} {result.load_analysis.acwr_suggestion}</div>
                  {result.load_analysis.notes && <div style={{ color: "var(--text-secondary)", marginTop: 4 }}>{result.load_analysis.notes}</div>}
                </div>
              </div>
            )}

            {/* 注意事项 */}
            {result.precautions?.length > 0 && (
              <div style={{
                background: "var(--amber-dim)", borderRadius: 12, padding: "16px",
                border: "1px solid var(--amber)", marginBottom: 12,
              }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "var(--amber)" }}>⚠️ {coachT.precautions || "注意事项"}</div>
                {result.precautions.map((p, i) => (
                  <div key={i} style={{ fontSize: 12, color: "var(--amber)", padding: "3px 0" }}>• {p}</div>
                ))}
              </div>
            )}

            {/* 理论依据 */}
            {result.theory_basis && (
              <div style={{
                background: "var(--accent-dim)", borderRadius: 12, padding: "16px",
                border: "1px solid var(--accent-dim)", marginBottom: 12,
              }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "var(--text)" }}>🧠 {coachT.theoryBasis || "理论依据"}</div>
                {result.theory_basis.daniels && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "var(--accent)", marginBottom: 2 }}>🏃 {coachT.daniels || "丹尼尔斯"}</div>
                    <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.7 }}>{result.theory_basis.daniels}</div>
                  </div>
                )}
                {result.theory_basis.bompa && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "var(--accent)", marginBottom: 2 }}>📐 {coachT.bompa || "邦帕"}</div>
                    <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.7 }}>{result.theory_basis.bompa}</div>
                  </div>
                )}
              </div>
            )}

            {/* 操作按钮 */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <button onClick={handleAdopt} disabled={loading} style={{
                flex: 1, padding: "12px 0", borderRadius: 10, border: "none",
                background: "var(--green)", color: "var(--bg)", fontSize: 13, fontWeight: 500, cursor: "pointer",
              }}>✅ {coachT.adoptPlan || "采纳为本周计划"}</button>
              <button onClick={() => { setResult(null); }} style={{
                flex: 1, padding: "12px 0", borderRadius: 10,
                border: "1px solid var(--border)", background: "var(--surface)",
                color: "var(--text-secondary)", fontSize: 13, cursor: "pointer",
              }}>🔄 {coachT.discardPlan || "丢弃重来"}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

