// API calls migrated to services layer
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { doctorService } from "../services";
import LoadingState from "../components/LoadingState.jsx";
import { DoctorNav } from "./DoctorHome.jsx";
import VoiceInput from "../components/VoiceInput.jsx";
import { INPUT, SELECT, PRIMARY_BTN } from "../styles/sharedStyles.js";

export default function DoctorAthleteDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("injuries");
  const [showInjuryModal, setShowInjuryModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // 伤病表单
  const emptyInjury = {
    injury_date: new Date().toISOString().split("T")[0],
    body_part: "", injury_type: "", severity: "中度",
    cause_analysis: "", diagnosis: "", treatment_plan: "", recovery_estimate: "", notes: "",
  };
  const [injuryForm, setInjuryForm] = useState({ ...emptyInjury });

  // 上传表单
  const [uploadForm, setUploadForm] = useState({ check_date: new Date().toISOString().split("T")[0], check_type: "X光", notes: "" });
  const [uploadFile, setUploadFile] = useState(null);

  useEffect(() => { fetchHealth(); }, [id]);

  const fetchHealth = async () => {
    try {
      const d = await doctorService.getAthleteHealth(id);
      setData(d);
    } catch {} finally { setLoading(false); }
  };

  const handleSaveInjury = async () => {
    if (!injuryForm.body_part) { alert("请填写受伤部位"); return; }
    setSaving(true);
    try {
      await doctorService.createInjury({ ...injuryForm, athlete_id: parseInt(id) });
      setShowInjuryModal(false);
      setInjuryForm({ ...emptyInjury });
      fetchHealth();
    } catch (err) { alert("保存失败: " + err.message); }
    finally { setSaving(false); }
  };

  const handleUpload = async () => {
    if (!uploadFile) { alert("请选择文件"); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("athlete_id", id);
      formData.append("check_date", uploadForm.check_date);
      formData.append("check_type", uploadForm.check_type);
      formData.append("notes", uploadForm.notes);

      await doctorService.uploadCheck(formData);
      setShowUploadModal(false);
      setUploadFile(null);
      fetchHealth();
    } catch (err) { alert("上传失败: " + err.message); }
    finally { setSaving(false); }
  };

  const updateInjury = (key, val) => setInjuryForm((f) => ({ ...f, [key]: val }));

  if (loading) return <LoadingState />;
  if (!data) return <div style={{ fontFamily: "var(--font-primary)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}><div style={{ color: "var(--text-secondary)" }}>未找到数据</div><a href="/doctor" style={{ marginTop: 16, color: "var(--accent)" }}>← 返回</a></div>;

  const { athlete, injuries, treatments, fatigue_trend, body_part_stats } = data;
  const latestFatigue = fatigue_trend?.[0]?.level || "--";
  const statusColor = latestFatigue === "高" ? "var(--red)" : latestFatigue === "中" ? "var(--amber)" : "var(--green)";

  return (
    <div style={{ fontFamily: "var(--font-primary)", fontSize: 13, color: "var(--text)", minHeight: "100vh", paddingBottom: 60 }}>
      {/* 顶部 */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: "0.5px solid var(--border)",
        background: "#fff", position: "sticky", top: 0, zIndex: 10,
      }}>
        <a href="/doctor" style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12, cursor: "pointer", textDecoration: "none" }}>← 返回</a>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{athlete?.name} — 健康档案</span>
        <span style={{ width: 40 }}></span>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px" }}>
        {/* 基本信息 */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", border: "1px solid var(--border)", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{athlete?.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                当前疲劳度：<span style={{ color: statusColor, fontWeight: 500 }}>{latestFatigue}</span>
              </div>
            </div>
            <button onClick={() => setShowInjuryModal(true)} style={{
              padding: "6px 12px", borderRadius: 8, border: "none",
              background: "var(--red)", color: "#fff", fontSize: 11, cursor: "pointer",
            }}>+ 录入伤病</button>
          </div>
        </div>

        {/* 标签页 */}
        <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: "1px solid var(--border)" }}>
          {[
            { key: "injuries", label: `伤病记录 (${injuries?.length || 0})` },
            { key: "treatments", label: `治疗记录 (${treatments?.length || 0})` },
            { key: "data", label: "训练数据" },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: "8px 14px", fontSize: 12, cursor: "pointer",
              border: "none", borderBottom: activeTab === tab.key ? "2px solid var(--accent)" : "2px solid transparent",
              background: "transparent", color: activeTab === tab.key ? "var(--accent)" : "var(--text-secondary)",
              fontWeight: activeTab === tab.key ? 500 : 400,
            }}>{tab.label}</button>
          ))}
        </div>

        {/* 伤病记录 */}
        {activeTab === "injuries" && (
          <div>
            {injuries?.length > 0 ? injuries.map((inj) => (
              <div key={inj.id} style={{
                background: "#fff", borderRadius: 10, padding: "12px 16px",
                border: "1px solid var(--border)", marginBottom: 8,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontWeight: 500 }}>{inj.body_part}</span>
                  <span style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 10,
                    background: inj.recovery_status === "recovered" ? "var(--green-dim)" : inj.recovery_status === "recovering" ? "var(--amber-dim)" : "var(--red-dim)",
                    color: inj.recovery_status === "recovered" ? "var(--green)" : inj.recovery_status === "recovering" ? "var(--amber)" : "var(--red)",
                  }}>
                    {inj.recovery_status === "recovered" ? "已恢复" : inj.recovery_status === "recovering" ? "恢复中" : "活跃"}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>{inj.injury_date} · {inj.injury_type || "未分类"} · {inj.severity || "未知"}</div>
                {inj.diagnosis && <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>诊断：{inj.diagnosis}</div>}
                {inj.treatment_plan && <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>方案：{inj.treatment_plan}</div>}
                {inj.description && <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>{inj.description}</div>}
                {inj.hospital_check_file && (
                  <a href={inj.hospital_check_file} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "var(--accent)", marginTop: 4, display: "inline-block" }}>📎 查看检查报告</a>
                )}
              </div>
            )) : <Empty text="暂无伤病记录" />}

            <button onClick={() => setShowUploadModal(true)} style={{
              width: "100%", padding: "10px 0", borderRadius: 10,
              border: "1px dashed var(--accent-dim)", background: "var(--accent-dim)",
              color: "var(--accent)", fontSize: 12, cursor: "pointer", marginTop: 8,
            }}>📤 上传医院检查结果</button>
          </div>
        )}

        {/* 治疗记录 */}
        {activeTab === "treatments" && (
          <div>
            {treatments?.length > 0 ? treatments.map((t) => (
              <div key={t.id} style={{
                background: "#fff", borderRadius: 10, padding: "12px 16px",
                border: "1px solid var(--border)", marginBottom: 8,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 500 }}>{t.body_part}</span>
                  <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{t.treatment_date?.replace("T", " ").substring(0, 16)}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{t.treatment_method}{t.equipment ? ` · ${t.equipment}` : ""}</div>
                {t.recovery_period_hours && <div style={{ fontSize: 11, color: "var(--amber)", marginTop: 2 }}>恢复期：{t.recovery_period_hours}小时</div>}
                {t.post_treatment_notes && <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{t.post_treatment_notes}</div>}
              </div>
            )) : <Empty text="暂无治疗记录" />}
          </div>
        )}

        {/* 训练数据 */}
        {activeTab === "data" && (
          <div>
            {/* 疲劳趋势 */}
            {fatigue_trend?.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 10, padding: "12px 16px", border: "1px solid var(--border)", marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>疲劳度趋势（最近{fatigue_trend.length}次）</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {fatigue_trend.map((f, i) => (
                    <div key={i} style={{
                      padding: "4px 8px", borderRadius: 6, fontSize: 11,
                      background: f.level === "高" ? "var(--red-dim)" : f.level === "中" ? "var(--amber-dim)" : "var(--green-dim)",
                      color: f.level === "高" ? "var(--red)" : f.level === "中" ? "var(--amber)" : "var(--green)",
                    }}>
                      {f.date?.substring(5)}: {f.level}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 身体部位统计 */}
            {body_part_stats?.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 10, padding: "12px 16px", border: "1px solid var(--border)", marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>疼痛部位统计</div>
                {body_part_stats.map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
                    <span>{s.part}</span>
                    <span style={{ color: "var(--red)", fontWeight: 500 }}>{s.count}次</span>
                  </div>
                ))}
              </div>
            )}

            {(!fatigue_trend || fatigue_trend.length === 0) && (!body_part_stats || body_part_stats.length === 0) && (
              <Empty text="暂无训练数据" />
            )}
          </div>
        )}
      </div>

      {/* 录入伤病弹窗 */}
      {showInjuryModal && (
        <Modal title="录入伤病记录" onClose={() => setShowInjuryModal(false)}>
          <Label>受伤日期</Label>
          <input type="date" value={injuryForm.injury_date} onChange={(e) => updateInjury("injury_date", e.target.value)} style={INPUT} />
          <Label>受伤部位</Label>
          <input value={injuryForm.body_part} onChange={(e) => updateInjury("body_part", e.target.value)} placeholder="如：右膝" style={INPUT} />
          <Label>伤病类型</Label>
          <input value={injuryForm.injury_type} onChange={(e) => updateInjury("injury_type", e.target.value)} placeholder="如：慢性劳损" style={INPUT} />
          <Label>严重程度</Label>
          <select value={injuryForm.severity} onChange={(e) => updateInjury("severity", e.target.value)} style={SELECT}>
            <option value="轻度">轻度</option>
            <option value="中度">中度</option>
            <option value="重度">重度</option>
          </select>
          <Label>诊断</Label>
          <input value={injuryForm.diagnosis} onChange={(e) => updateInjury("diagnosis", e.target.value)} placeholder="如：髌骨软化症早期" style={INPUT} />
          <Label>原因分析</Label>
          <input value={injuryForm.cause_analysis} onChange={(e) => updateInjury("cause_analysis", e.target.value)} placeholder="如：近两周跑量增加过快" style={INPUT} />
          <Label>治疗方案</Label>
          <input value={injuryForm.treatment_plan} onChange={(e) => updateInjury("treatment_plan", e.target.value)} placeholder="如：超声治疗+休息" style={INPUT} />
          <Label>预估恢复时间</Label>
          <input value={injuryForm.recovery_estimate} onChange={(e) => updateInjury("recovery_estimate", e.target.value)} placeholder="如：2周" style={INPUT} />
          <Label>备注（支持语音输入）</Label>
          <VoiceInput
            onConfirm={(text) => updateInjury("notes", text)}
            placeholder="其他备注信息..."
            buttonText="语音输入"
            rows={2}
          />
          <button onClick={handleSaveInjury} disabled={saving} style={PRIMARY_BTN}>{saving ? "保存中..." : "保存伤病记录"}</button>
        </Modal>
      )}

      {/* 上传检查结果弹窗 */}
      {showUploadModal && (
        <Modal title="上传医院检查结果" onClose={() => setShowUploadModal(false)}>
          <Label>检查日期</Label>
          <input type="date" value={uploadForm.check_date} onChange={(e) => setUploadForm((f) => ({ ...f, check_date: e.target.value }))} style={INPUT} />
          <Label>检查类型</Label>
          <select value={uploadForm.check_type} onChange={(e) => setUploadForm((f) => ({ ...f, check_type: e.target.value }))} style={SELECT}>
            <option>X光</option>
            <option>MRI</option>
            <option>超声检查</option>
            <option>CT</option>
            <option>血液检查</option>
            <option>其他</option>
          </select>
          <Label>备注</Label>
          <textarea value={uploadForm.notes} onChange={(e) => setUploadForm((f) => ({ ...f, notes: e.target.value }))} rows={2} style={{ ...INPUT, minHeight: 50, resize: "vertical", fontFamily: "inherit" }} />
          <Label>选择文件</Label>
          <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setUploadFile(e.target.files?.[0])} style={{ fontSize: 12, marginTop: 4 }} />
          <button onClick={handleUpload} disabled={saving} style={{ ...PRIMARY_BTN, marginTop: 12 }}>{saving ? "上传中..." : "上传检查结果"}</button>
        </Modal>
      )}

      <DoctorNav active={null} onNavigate={(tab) => { window.location.href = "/doctor"; }} />
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 16,
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, padding: "20px", maxHeight: "85vh", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "var(--text-secondary)" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Empty({ text }) {
  return <div style={{ textAlign: "center", padding: 24, color: "var(--text-dim)", fontSize: 12 }}>{text}</div>;
}

const Label = ({ children }) => <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4, marginTop: 10 }}>{children}</label>;
