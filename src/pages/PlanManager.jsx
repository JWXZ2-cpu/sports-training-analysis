// API calls migrated to services layer
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { planService, authService } from "../services";
import LoadingState from "../components/LoadingState.jsx";
import { BACK_BTN, INPUT_STYLE, SMALL_BTN } from "../styles/sharedStyles.js";

const INTENSITY_OPTIONS = [
  { value: "high", label: "高强度", color: "var(--red)" },
  { value: "medium", label: "中等强度", color: "var(--amber)" },
  { value: "low", label: "低强度", color: "var(--green)" },
  { value: "recovery", label: "恢复日", color: "var(--text-secondary)" },
];

const ZONE_OPTIONS = ["E（轻松跑）", "M（马拉松配速）", "T（乳酸门槛）", "I（间歇训练）", "R（重复训练）", "混合"];

export default function PlanManager({ onBack }) {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [saving, setSaving] = useState(false);

  // 表单状态
  const [form, setForm] = useState({
    title: "", description: "", plan_date: new Date().toISOString().split("T")[0],
    plan_type: "daily", intensity_level: "medium", focus_body_parts: "",
    target_athletes: [], training_zone: "", target_pace: "",
    estimated_distance: "", estimated_duration: "",
    warmup: "", cooldown: "", notes: "",
    exercises: [{ exercise: "", sets: "", reps: "", rest: "", pace: "" }],
  });

  useEffect(() => {
    fetchPlans();
    fetchAthletes();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await planService.getPlans();
      setPlans(data.plans || []);
    } catch {} finally { setLoading(false); }
  };

  const fetchAthletes = async () => {
    try {
      const data = await authService.getAthletes();
      setAthletes(data.athletes || []);
    } catch {}
  };

  const resetForm = () => {
    setForm({
      title: "", description: "", plan_date: new Date().toISOString().split("T")[0],
      plan_type: "daily", intensity_level: "medium", focus_body_parts: "",
      target_athletes: [], training_zone: "", target_pace: "",
      estimated_distance: "", estimated_duration: "",
      warmup: "", cooldown: "", notes: "",
      exercises: [{ exercise: "", sets: "", reps: "", rest: "", pace: "" }],
    });
    setEditingPlan(null);
  };

  const openCreate = () => { resetForm(); setShowForm(true); };

  const openEdit = (plan) => {
    const content = plan.content_json || {};
    setForm({
      title: plan.title || "",
      description: plan.description || "",
      plan_date: plan.plan_date || "",
      plan_type: plan.plan_type || "daily",
      intensity_level: plan.intensity_level || "medium",
      focus_body_parts: plan.focus_body_parts || "",
      target_athletes: (plan.target_athletes || []).map(Number),
      training_zone: content.target_zone || "",
      target_pace: content.target_pace || "",
      estimated_distance: content.estimated_distance || "",
      estimated_duration: content.estimated_duration || "",
      warmup: content.warmup || "",
      cooldown: content.cooldown || "",
      notes: content.notes || "",
      exercises: content.main?.length > 0
        ? content.main.map((m) => typeof m === "string" ? { exercise: m, sets: "", reps: "", rest: "", pace: "" } : m)
        : [{ exercise: "", sets: "", reps: "", rest: "", pace: "" }],
    });
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.plan_date) {
      alert("请填写标题和日期");
      return;
    }
    setSaving(true);
    try {
      const content_json = {
        warmup: form.warmup,
        main: form.exercises.filter((e) => e.exercise),
        cooldown: form.cooldown,
        notes: form.notes,
        target_zone: form.training_zone,
        target_pace: form.target_pace,
        estimated_distance: form.estimated_distance,
        estimated_duration: form.estimated_duration,
      };

      const body = {
        title: form.title,
        description: form.description,
        plan_date: form.plan_date,
        plan_type: form.plan_type,
        intensity_level: form.intensity_level,
        focus_body_parts: form.focus_body_parts,
        target_athletes: form.target_athletes,
        content_json,
      };

      if (editingPlan) {
        await planService.updatePlan(editingPlan.id, body);
      } else {
        await planService.createPlan(body);
      }

      setShowForm(false);
      resetForm();
      fetchPlans();
    } catch (err) {
      alert("保存失败: " + err.message);
    } finally { setSaving(false); }
  };

  const addExercise = () => {
    setForm((f) => ({ ...f, exercises: [...f.exercises, { exercise: "", sets: "", reps: "", rest: "", pace: "" }] }));
  };

  const updateExercise = (index, field, value) => {
    setForm((f) => {
      const exercises = [...f.exercises];
      exercises[index] = { ...exercises[index], [field]: value };
      return { ...f, exercises };
    });
  };

  const removeExercise = (index) => {
    setForm((f) => ({ ...f, exercises: f.exercises.filter((_, i) => i !== index) }));
  };

  const toggleAthlete = (id) => {
    setForm((f) => ({
      ...f,
      target_athletes: f.target_athletes.includes(id)
        ? f.target_athletes.filter((a) => a !== id)
        : [...f.target_athletes, id],
    }));
  };

  // 创建/编辑表单视图
  if (showForm) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 16px" }}>
        <button onClick={() => { setShowForm(false); resetForm(); }} style={BACK_BTN}>← 返回计划列表</button>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
          {editingPlan ? "编辑训练计划" : "创建训练计划"}
        </div>

        {/* 基本信息 */}
        <Section title="基本信息">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="计划标题 *" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="如：速度耐力课" />
            <Field label="训练日期 *" type="date" value={form.plan_date} onChange={(v) => setForm((f) => ({ ...f, plan_date: v }))} />
            <div>
              <Label>训练类型</Label>
              <select value={form.plan_type} onChange={(e) => setForm((f) => ({ ...f, plan_type: e.target.value }))} style={SELECT_STYLE}>
                <option value="daily">日计划</option>
                <option value="weekly">周计划</option>
              </select>
            </div>
            <div>
              <Label>强度等级</Label>
              <select value={form.intensity_level} onChange={(e) => setForm((f) => ({ ...f, intensity_level: e.target.value }))} style={SELECT_STYLE}>
                {INTENSITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <Field label="重点部位" value={form.focus_body_parts} onChange={(v) => setForm((f) => ({ ...f, focus_body_parts: v }))} placeholder="如：腿部、核心" />
            <Field label="简要描述" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="可选" />
          </div>
        </Section>

        {/* 强度与配速 */}
        <Section title="强度与配速（丹尼尔斯体系）">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <Label>目标强度区间</Label>
              <select value={form.training_zone} onChange={(e) => setForm((f) => ({ ...f, training_zone: e.target.value }))} style={SELECT_STYLE}>
                <option value="">--</option>
                {ZONE_OPTIONS.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <Field label="目标配速" value={form.target_pace} onChange={(v) => setForm((f) => ({ ...f, target_pace: v }))} placeholder="如：4:30/km" />
            <Field label="预计距离" value={form.estimated_distance} onChange={(v) => setForm((f) => ({ ...f, estimated_distance: v }))} placeholder="如：10km" />
            <Field label="预计时长" value={form.estimated_duration} onChange={(v) => setForm((f) => ({ ...f, estimated_duration: v }))} placeholder="如：45分钟" />
          </div>
        </Section>

        {/* 训练内容 */}
        <Section title="训练内容">
          <Field label="热身" value={form.warmup} onChange={(v) => setForm((f) => ({ ...f, warmup: v }))} placeholder="如：慢跑10分钟+动态拉伸" multiline />
          <div style={{ marginTop: 12 }}>
            <Label>主训练</Label>
            {form.exercises.map((ex, i) => (
              <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
                <input value={ex.exercise} onChange={(e) => updateExercise(i, "exercise", e.target.value)}
                  placeholder={`练习${i + 1}，如：间歇跑1000m x 5`} style={{ ...INPUT_STYLE, flex: 1 }} />
                <input value={ex.pace} onChange={(e) => updateExercise(i, "pace", e.target.value)}
                  placeholder="配速" style={{ ...INPUT_STYLE, width: 80 }} />
                <input value={ex.rest} onChange={(e) => updateExercise(i, "rest", e.target.value)}
                  placeholder="休息" style={{ ...INPUT_STYLE, width: 70 }} />
                {form.exercises.length > 1 && (
                  <button onClick={() => removeExercise(i)} style={{ ...SMALL_BTN, color: "var(--red)" }}>✕</button>
                )}
              </div>
            ))}
            <button onClick={addExercise} style={{ ...SMALL_BTN, marginTop: 4 }}>+ 添加练习</button>
          </div>
          <div style={{ marginTop: 12 }}>
            <Field label="放松" value={form.cooldown} onChange={(v) => setForm((f) => ({ ...f, cooldown: v }))} placeholder="如：慢跑10分钟+静态拉伸" multiline />
          </div>
          <div style={{ marginTop: 12 }}>
            <Field label="教练备注" value={form.notes} onChange={(v) => setForm((f) => ({ ...f, notes: v }))} placeholder="注意事项、特殊要求等" multiline />
          </div>
        </Section>

        {/* 指定运动员 */}
        <Section title="指定运动员（不选=全队）">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {athletes.map((a) => (
              <button key={a.id} onClick={() => toggleAthlete(a.id)} style={{
                padding: "5px 12px", borderRadius: 16, fontSize: 12, cursor: "pointer",
                border: form.target_athletes.includes(a.id) ? "1px solid var(--accent)" : "1px solid var(--border)",
                background: form.target_athletes.includes(a.id) ? "var(--accent-dim)" : "transparent",
                color: form.target_athletes.includes(a.id) ? "var(--accent)" : "var(--text-secondary)",
              }}>{a.display_name}</button>
            ))}
          </div>
        </Section>

        {/* 保存按钮 */}
        <button onClick={handleSave} disabled={saving} style={{
          width: "100%", padding: "14px 0", borderRadius: 10, border: "none",
          background: saving ? "var(--text-dim)" : "var(--accent)", color: "#fff", fontSize: 15,
          fontWeight: 500, cursor: saving ? "not-allowed" : "pointer",
          boxShadow: "0 4px 12px rgba(83,74,183,0.3)", marginTop: 20,
        }}>
          {saving ? "保存中..." : (editingPlan ? "更新计划" : "发布计划")}
        </button>
      </div>
    );
  }

  // 计划列表视图
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 16px" }}>
      <button onClick={onBack} style={BACK_BTN}>← 返回工作台</button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>📋 训练计划管理</div>
        <button onClick={openCreate} style={{
          padding: "8px 16px", borderRadius: 8, border: "none",
          background: "var(--accent)", color: "#fff", fontSize: 13, cursor: "pointer",
        }}>+ 创建计划</button>
      </div>

      {loading ? (
        <LoadingState size="small" />
      ) : plans.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {plans.map((p) => {
            const intensity = INTENSITY_OPTIONS.find((o) => o.value === p.intensity_level);
            return (
              <div key={p.id} onClick={() => openEdit(p)} style={{
                background: "#fff", borderRadius: 10, padding: "12px 16px",
                border: "1px solid var(--border)", cursor: "pointer", transition: "all 0.15s",
              }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
                      {p.plan_date} · {p.plan_type === "weekly" ? "周计划" : "日计划"}
                      {p.focus_body_parts && <span> · {p.focus_body_parts}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {intensity && (
                      <span style={{
                        fontSize: 11, padding: "3px 8px", borderRadius: 12,
                        background: intensity.color + "18", color: intensity.color,
                        border: `1px solid ${intensity.color}44`,
                      }}>{intensity.label}</span>
                    )}
                    <span style={{
                      fontSize: 11, padding: "3px 8px", borderRadius: 12,
                      background: p.approval_status === "approved" ? "var(--green-dim)" : p.approval_status === "pending" ? "var(--amber-dim)" : p.approval_status === "rejected" ? "var(--red-dim)" : "var(--border)",
                      color: p.approval_status === "approved" ? "var(--green)" : p.approval_status === "pending" ? "var(--amber)" : p.approval_status === "rejected" ? "var(--red)" : "var(--text-secondary)",
                    }}>
                      {p.approval_status === "approved" ? "已发布" : p.approval_status === "pending" ? "待审批" : p.approval_status === "rejected" ? "已驳回" : "草稿"}
                    </span>
                    <span style={{ fontSize: 16, color: "#ccc" }}>›</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-dim)" }}>
          暂无训练计划，点击上方按钮创建
        </div>
      )}
    </div>
  );
}

// 辅助组件
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function Label({ children }) {
  return <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>{children}</label>;
}

function Field({ label, value, onChange, placeholder, type, multiline }) {
  return (
    <div>
      <Label>{label}</Label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          rows={2} style={{ ...INPUT_STYLE, minHeight: 60, resize: "vertical", fontFamily: "inherit" }} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          type={type || "text"} style={INPUT_STYLE} />
      )}
    </div>
  );
}


const SELECT_STYLE = {
  ...INPUT_STYLE, cursor: "pointer",
};


