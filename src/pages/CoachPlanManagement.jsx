// API calls migrated to services layer
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useI18n } from "../locales/index.jsx";
import { planService, authService } from "../services";
import LoadingState from "../components/LoadingState.jsx";

const ZONE_OPTIONS = ["E", "M", "T", "I", "R"];

const DAY_NAMES_MAP = {
  zh: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  it: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
};

const INTENSITY_OPTIONS_MAP = {
  zh: [
    { value: "high", label: "高强度", color: "var(--red)" },
    { value: "medium", label: "中等强度", color: "var(--amber)" },
    { value: "low", label: "低强度", color: "var(--green)" },
    { value: "recovery", label: "恢复日", color: "var(--text-secondary)" },
  ],
  en: [
    { value: "high", label: "High Intensity", color: "var(--red)" },
    { value: "medium", label: "Medium", color: "var(--amber)" },
    { value: "low", label: "Low Intensity", color: "var(--green)" },
    { value: "recovery", label: "Recovery", color: "var(--text-secondary)" },
  ],
};

const PLAN_TYPES_MAP = {
  zh: ["轻松跑", "节奏跑", "间歇训练", "长距离跑", "恢复跑", "力量训练", "休息日"],
  en: ["Easy Run", "Tempo Run", "Interval", "Long Run", "Recovery Run", "Strength", "Rest Day"],
};

export default function CoachPlanManagement({ onBack, onGoAISuggestion }) {
  const { user } = useAuth();
  const { lang, t } = useI18n();
  const coachT = t.coach || {};
  const dayNames = DAY_NAMES_MAP[lang] || DAY_NAMES_MAP.zh;
  const intensityOptions = INTENSITY_OPTIONS_MAP[lang] || INTENSITY_OPTIONS_MAP.zh;
  const planTypes = PLAN_TYPES_MAP[lang] || PLAN_TYPES_MAP.zh;
  const [plans, setPlans] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const emptyForm = {
    title: "", plan_date: new Date().toISOString().split("T")[0],
    plan_type: planTypes[0], training_zone: "E", intensity_level: "medium",
    target_pace: "", target_hr: "", estimated_distance: "", estimated_duration: "",
    target_athletes: [], warmup: "", main: [{ exercise: "", pace: "", rest: "" }],
    cooldown: "", notes: "",
  };
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => { fetchPlans(); fetchAthletes(); }, [weekStart]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const ws = weekStart.toISOString().split("T")[0];
      const data = await planService.getPlans({ week_start: ws });
      setPlans(data.plans || []);
    } catch {} finally { setLoading(false); }
  };

  const fetchAthletes = async () => {
    try {
      const data = await authService.getAthletes();
      setAthletes(data.athletes || []);
    } catch {}
  };

  const changeWeek = (offset) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + offset * 7);
    setWeekStart(d);
  };

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayPlans = plans.filter((p) => p.plan_date === dateStr);
    weekDays.push({ date: dateStr, dayName: dayNames[d.getDay()], isToday: dateStr === today, plans: dayPlans });
  }

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const openCreate = (date) => {
    setEditingPlan(null);
    setForm({ ...emptyForm, plan_date: date || new Date().toISOString().split("T")[0] });
    setShowModal(true);
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    const content = plan.content_json || {};
    setForm({
      title: plan.title || "",
      plan_date: plan.plan_date || "",
      plan_type: plan.plan_type || "轻松跑",
      training_zone: plan.training_zone || content.target_zone || "E",
      intensity_level: plan.intensity_level || "medium",
      target_pace: content.target_pace || "",
      target_hr: content.target_hr || "",
      estimated_distance: content.estimated_distance || "",
      estimated_duration: content.estimated_duration || "",
      target_athletes: (plan.target_athletes || []).map(Number),
      warmup: content.warmup || "",
      main: content.main?.length > 0 ? content.main.map((m) =>
        typeof m === "string" ? { exercise: m, pace: "", rest: "" } : m
      ) : [{ exercise: "", pace: "", rest: "" }],
      cooldown: content.cooldown || "",
      notes: content.notes || plan.description || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.plan_date) { alert(coachT.fillTitleDate || "请填写标题和日期"); return; }
    setSaving(true);
    try {
      const content_json = {
        warmup: form.warmup, main: form.main.filter((m) => m.exercise),
        cooldown: form.cooldown, notes: form.notes,
        target_zone: form.training_zone, target_pace: form.target_pace,
        target_hr: form.target_hr, estimated_distance: form.estimated_distance,
        estimated_duration: form.estimated_duration,
      };
      const body = {
        title: form.title, plan_date: form.plan_date, plan_type: form.plan_type,
        training_zone: form.training_zone, intensity_level: form.intensity_level,
        target_pace: form.target_pace, target_hr: form.target_hr,
        estimated_distance: form.estimated_distance, estimated_duration: form.estimated_duration,
        target_athletes: form.target_athletes, content_json, notes: form.notes,
      };
      if (editingPlan) {
        await planService.updatePlan(editingPlan.id, body);
      } else {
        await planService.createPlan(body);
      }
      setShowModal(false);
      fetchPlans();
    } catch (err) { alert((coachT.saveFailed || "保存失败: ") + err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm(coachT.deleteConfirm || "确定删除此计划？")) return;
    try {
      await planService.deletePlan(id);
      fetchPlans();
    } catch (err) { alert((coachT.deleteFailed || "删除失败: ") + err.message); }
  };

  const updateForm = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const addExercise = () => setForm((f) => ({ ...f, main: [...f.main, { exercise: "", pace: "", rest: "" }] }));
  const updateExercise = (i, key, val) => setForm((f) => { const m = [...f.main]; m[i] = { ...m[i], [key]: val }; return { ...f, main: m }; });
  const removeExercise = (i) => setForm((f) => ({ ...f, main: f.main.filter((_, idx) => idx !== i) }));
  const toggleAthlete = (id) => setForm((f) => ({
    ...f, target_athletes: f.target_athletes.includes(id) ? f.target_athletes.filter((a) => a !== id) : [...f.target_athletes, id],
  }));

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 70 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 22px 0" }}>
        <div>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12, cursor: "pointer", marginBottom: 8 }}>{coachT.back || "← 返回"}</button>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>{coachT.trainingPlan || "训练计划"}</h1>
        </div>
      </div>

      <div style={{ padding: "0 22px", maxWidth: 430, margin: "0 auto" }}>
        {/* AI 辅助横幅 */}
        <div onClick={onGoAISuggestion} style={{
          marginBottom: 24, padding: 20,
          background: "linear-gradient(135deg, rgba(42,36,22,0.6), rgba(30,26,22,0.3))",
          border: "1px solid rgba(212,164,76,0.12)", borderRadius: 16,
          cursor: "pointer", transition: "all 0.2s",
          animation: "fadeUp 0.4s ease 0s both",
        }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(212,164,76,0.25)"}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(212,164,76,0.12)"}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>🤖</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--accent)" }}>{coachT.aiAssistPlan || "AI 辅助制定计划"}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            {coachT.aiAssistDesc || "根据运动员数据和训练目标，智能生成一周训练计划"}
          </div>
        </div>

        {/* 创建按钮 */}
        <button onClick={() => openCreate()} style={{
          width: "100%", padding: 14, border: "none", borderRadius: 10,
          background: "linear-gradient(135deg, var(--accent), #C08830)",
          color: "var(--bg)", fontFamily: "inherit", fontSize: 14,
          fontWeight: 600, cursor: "pointer", marginBottom: 20,
          transition: "all 0.2s",
        }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 0 30px var(--accent-glow)"}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
        >
          {coachT.createPlan || "+ 创建计划"}
        </button>

        {/* 周导航 */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 20, padding: "12px 16px",
          background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10,
        }}>
          <button onClick={() => changeWeek(-1)} style={{
            background: "none", border: "none", color: "var(--text-secondary)",
            fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer", padding: "4px 8px",
          }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
          >{coachT.lastWeek || "← 上一周"}</button>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
            {weekStart.toISOString().split("T")[0].substring(5)} — {weekEnd.toISOString().split("T")[0].substring(5)}
          </span>
          <button onClick={() => changeWeek(1)} style={{
            background: "none", border: "none", color: "var(--text-secondary)",
            fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer", padding: "4px 8px",
          }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
          >{coachT.nextWeek || "下一周 →"}</button>
        </div>

        {/* 7天卡片列表 */}
        {loading ? (
          <LoadingState size="small" />
        ) : (
          <div>
            {weekDays.map((day, dayIdx) => (
              <div key={day.date} style={{
                marginBottom: 12, padding: "16px 18px",
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: 10, transition: "all 0.2s",
                animation: `fadeUp 0.3s ease ${dayIdx * 0.04}s both`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{day.dayName}</span>
                    <span style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 400 }}>{day.date}</span>
                    {day.isToday && (
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "var(--accent-dim)", color: "var(--accent)", fontWeight: 600 }}>{coachT.todayTag || "今天"}</span>
                    )}
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  {day.plans.length > 0 ? (
                    day.plans.map((plan) => (
                      <div key={plan.id} style={{ marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{plan.title}</span>
                        </div>
                        <div style={{ display: "flex", gap: 8, marginLeft: 14 }}>
                          <button onClick={() => openEdit(plan)} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 11, cursor: "pointer" }}>{coachT.edit || "编辑"}</button>
                          <button onClick={() => handleDelete(plan.id)} style={{ background: "none", border: "none", color: "var(--red)", fontSize: 11, cursor: "pointer" }}>{coachT.delete || "删除"}</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: 13, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 6 }}>
                      <span>☀️</span> {coachT.noPlan || "休息日"}
                    </div>
                  )}
                </div>
                <button onClick={() => openCreate(day.date)} style={{
                  background: "none", border: "1px dashed var(--border-light)",
                  color: "var(--text-dim)", fontFamily: "inherit", fontSize: 12, fontWeight: 500,
                  padding: "6px 14px", borderRadius: 8, cursor: "pointer",
                  transition: "all 0.2s", marginTop: 8, width: "100%",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.background = "var(--accent-dim)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.color = "var(--text-dim)"; e.currentTarget.style.background = "none"; }}
                >{coachT.addPlan || "+ 添加"}</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 创建/编辑弹窗 */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
          zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center",
        }} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{
            background: "var(--surface)", borderRadius: "20px 20px 0 0",
            maxWidth: 430, width: "100%", maxHeight: "85vh", overflow: "auto",
            padding: "0 24px 20px",
          }}>
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>{editingPlan ? (coachT.editPlan || "编辑计划") : (coachT.createPlanTitle || "创建计划")}</span>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>

            <FormField label={coachT.trainingDate || "训练日期"}>
              <input type="date" value={form.plan_date} onChange={(e) => updateForm("plan_date", e.target.value)} style={inputStyle} />
            </FormField>
            <FormField label={coachT.trainingName || "训练名称"}>
              <input value={form.title} onChange={(e) => updateForm("title", e.target.value)} placeholder={coachT.trainingNameHint || "如：速度耐力课"} style={inputStyle} />
            </FormField>
            <FormField label={coachT.trainingType || "训练类型"}>
              <select value={form.plan_type} onChange={(e) => updateForm("plan_type", e.target.value)} style={inputStyle}>
                {planTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label={coachT.intensityZone || "强度区间"}>
              <select value={form.training_zone} onChange={(e) => updateForm("training_zone", e.target.value)} style={inputStyle}>
                {ZONE_OPTIONS.map((z) => <option key={z} value={z}>{z}区</option>)}
              </select>
            </FormField>
            <FormField label={coachT.targetPace || "目标配速"}>
              <input value={form.target_pace} onChange={(e) => updateForm("target_pace", e.target.value)} placeholder={coachT.targetPaceHint || "如：4:10-4:20/km"} style={inputStyle} />
            </FormField>
            <FormField label={coachT.targetHR || "目标心率"}>
              <input value={form.target_hr} onChange={(e) => updateForm("target_hr", e.target.value)} placeholder={coachT.targetHRHint || "如：170-180bpm"} style={inputStyle} />
            </FormField>
            <FormField label={coachT.estDistance || "预估距离"}>
              <input value={form.estimated_distance} onChange={(e) => updateForm("estimated_distance", e.target.value)} placeholder={coachT.estDistanceHint || "如：8km"} style={inputStyle} />
            </FormField>
            <FormField label={coachT.estDuration || "预估时长"}>
              <input value={form.estimated_duration} onChange={(e) => updateForm("estimated_duration", e.target.value)} placeholder={coachT.estDurationHint || "如：50分钟"} style={inputStyle} />
            </FormField>

            <FormField label={coachT.athletes || "适用运动员"}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <button onClick={() => updateForm("target_athletes", [])} style={tagBtnStyle(form.target_athletes.length === 0)}>{coachT.allTeam || "全队"}</button>
                {athletes.map((a) => (
                  <button key={a.id} onClick={() => toggleAthlete(a.id)} style={tagBtnStyle(form.target_athletes.includes(a.id))}>{a.display_name}</button>
                ))}
              </div>
            </FormField>

            <FormField label={coachT.warmup || "热身"}>
              <input value={form.warmup} onChange={(e) => updateForm("warmup", e.target.value)} placeholder={coachT.warmupHint || "如：慢跑10分钟+动态拉伸"} style={inputStyle} />
            </FormField>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>{coachT.mainTraining || "主训练"}</label>
              {form.main.map((ex, i) => (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                  <input value={ex.exercise} onChange={(e) => updateExercise(i, "exercise", e.target.value)} placeholder={`${(coachT.setNumber || "第{num}组").replace("{num}", i + 1)}`} style={{ ...inputStyle, flex: 1 }} />
                  <input value={ex.pace} onChange={(e) => updateExercise(i, "pace", e.target.value)} placeholder={coachT.targetPace || "配速"} style={{ ...inputStyle, width: 80 }} />
                  <input value={ex.rest} onChange={(e) => updateExercise(i, "rest", e.target.value)} placeholder={coachT.rest || "休息"} style={{ ...inputStyle, width: 70 }} />
                  {form.main.length > 1 && <button onClick={() => removeExercise(i)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 14 }}>✕</button>}
                </div>
              ))}
              <button onClick={addExercise} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12, cursor: "pointer" }}>{coachT.addSet || "+ 添加一组"}</button>
            </div>

            <FormField label={coachT.cooldown || "放松"}>
              <input value={form.cooldown} onChange={(e) => updateForm("cooldown", e.target.value)} placeholder={coachT.warmupHint || "如：慢跑10分钟+静态拉伸"} style={inputStyle} />
            </FormField>
            <FormField label={coachT.notes || "备注"}>
              <textarea value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} placeholder={coachT.notes || "注意事项"} rows={2} style={{ ...inputStyle, minHeight: 50, resize: "vertical", fontFamily: "inherit" }} />
            </FormField>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={handleSave} disabled={saving} style={{
                flex: 1, padding: 14, borderRadius: 10, border: "none",
                background: saving ? "var(--text-dim)" : "linear-gradient(135deg, var(--accent), #C08830)",
                color: "var(--bg)", fontFamily: "inherit", fontSize: 14, fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
              }}>{saving ? (coachT.saving || "保存中...") : (editingPlan ? (coachT.updatePlan || "更新计划") : (coachT.publishPlan || "发布计划"))}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "12px 14px", background: "var(--card)",
  border: "1px solid var(--border)", borderRadius: 10,
  color: "var(--text)", fontFamily: "inherit", fontSize: 14,
  outline: "none", transition: "border-color 0.2s", boxSizing: "border-box",
};

const tagBtnStyle = (active) => ({
  padding: "4px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
  border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
  background: active ? "var(--accent-dim)" : "transparent",
  color: active ? "var(--accent)" : "var(--text-secondary)",
  fontFamily: "inherit", transition: "all 0.2s",
});
