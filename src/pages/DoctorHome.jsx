// API calls migrated to services layer
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { doctorService, authService, notificationService } from "../services";
import LoadingState from "../components/LoadingState.jsx";
import NotificationBell from "../components/NotificationBell.jsx";
import TeamJoinCard from "../components/TeamJoinCard.jsx";
import '../styles/doctor-pages.css';

const TREATMENT_METHODS = ["超声波治疗", "冲击波治疗", "手法松解", "针灸", "理疗", "其他"];
const INJURY_TYPES = ["急性损伤", "慢性劳损", "术后恢复", "其他"];
const SEVERITY_LEVELS = ["轻度", "中度", "重度"];
const CHECK_TYPES = ["MRI 核磁共振", "X 光", "CT", "超声检查", "血液检查", "其他"];

// 通知类型配置
const NOTIF_CONFIG = {
  training_feedback: { icon: "📊", color: "blue" },
  risk_alert: { icon: "⚠️", color: "red" },
  injury_alert: { icon: "🔔", color: "red" },
  treatment_plan: { icon: "💊", color: "green" },
  training_note: { icon: "💬", color: "blue" },
  conflict_alert: { icon: "⚡", color: "amber" },
  plan_approval: { icon: "📋", color: "blue" },
  general: { icon: "📢", color: "blue" },
};

const NOTIF_COLORS = {
  red: { bg: "rgba(212,92,92,0.12)" },
  green: { bg: "rgba(107,191,110,0.12)" },
  blue: { bg: "rgba(92,159,212,0.12)" },
  amber: { bg: "rgba(212,164,76,0.10)" },
};

const formatTime = (d) => {
  if (!d) return "";
  const s = Math.floor((new Date() - new Date(d)) / 1000);
  if (s < 60) return "刚刚";
  if (s < 3600) return `${Math.floor(s / 60)}分钟前`;
  if (s < 86400) return `${Math.floor(s / 3600)}小时前`;
  return `${Math.floor(s / 86400)}天前`;
};

const getTimeGroup = (d) => {
  if (!d) return "更早";
  const now = new Date();
  const date = new Date(d);
  const diffDays = Math.floor((now - date) / 86400000);
  if (diffDays < 1) return "今天";
  if (diffDays < 2) return "昨天";
  return "更早";
};

export default function DoctorHome({ onGoAthleteDetail, onGoConflictCheck }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [showProfile, setShowProfile] = useState(false);

  // 数据状态
  const [alerts, setAlerts] = useState([]);
  const [tomorrowPlans, setTomorrowPlans] = useState([]);
  const [todayTreatments, setTodayTreatments] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [athleteHealth, setAthleteHealth] = useState({});
  const [conflictSummary, setConflictSummary] = useState(null);

  // Sheet 状态
  const [showConflictSheet, setShowConflictSheet] = useState(false);
  const [showTreatSheet, setShowTreatSheet] = useState(false);
  const [showInjurySheet, setShowInjurySheet] = useState(false);
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [detailTab, setDetailTab] = useState("injury");

  // 治疗表单
  const emptyTreatForm = {
    athlete_id: "", treatment_date: new Date().toISOString().slice(0, 16),
    body_part: "", treatment_method: "超声波治疗", device_used: "",
    recovery_period_hours: 48, notes: "",
  };
  const [treatForm, setTreatForm] = useState({ ...emptyTreatForm });
  const [saving, setSaving] = useState(false);

  // 伤病表单
  const emptyInjuryForm = {
    injury_date: new Date().toISOString().split("T")[0],
    body_part: "", injury_type: "慢性劳损", severity: "中度",
    diagnosis: "", cause_analysis: "", treatment_plan: "",
    estimated_recovery: "", notes: "",
  };
  const [injuryForm, setInjuryForm] = useState({ ...emptyInjuryForm });

  // 上传表单
  const [uploadForm, setUploadForm] = useState({
    check_date: new Date().toISOString().split("T")[0],
    check_type: "MRI 核磁共振", notes: "", file: null,
  });

  // 语音状态
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [injuryVoiceRecording, setInjuryVoiceRecording] = useState(false);

  // 通知状态
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => { fetchAll(); fetchNotifications(); fetchUnreadCount(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [alertsData, plansData, treatmentsData, athletesData, conflictData] = await Promise.all([
        doctorService.getInjuryAlerts(),
        doctorService.getTomorrowPlans(),
        doctorService.getTodayTreatments(),
        authService.getAthletes(),
        doctorService.getConflictCheck(),
      ]);

      setAlerts(alertsData.alerts || []);
      setTomorrowPlans(plansData.plans || []);
      setTodayTreatments(treatmentsData.treatments || []);
      setAthletes(athletesData.athletes || []);
      setConflictSummary(conflictData);

      const healthMap = {};
      for (const a of athletesData.athletes || []) {
        try {
          const hData = await doctorService.getAthleteHealth(a.id);
          healthMap[a.id] = hData;
        } catch {}
      }
      setAthleteHealth(healthMap);
    } catch (err) {
      console.error("获取数据失败:", err);
    } finally { setLoading(false); }
  };

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications({ limit: 20 });
      setNotifications(data.notifications || []);
    } catch {}
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleSaveTreatment = async () => {
    if (!treatForm.athlete_id || !treatForm.body_part) {
      alert("请选择运动员和治疗部位");
      return;
    }
    setSaving(true);
    try {
      await doctorService.createTreatment(treatForm);
      setShowTreatSheet(false);
      setTreatForm({ ...emptyTreatForm });
      fetchAll();
    } catch (err) {
      alert("保存失败: " + err.message);
    } finally { setSaving(false); }
  };

  const updateTreatForm = (key, val) => setTreatForm((f) => ({ ...f, [key]: val }));
  const updateInjuryForm = (key, val) => setInjuryForm((f) => ({ ...f, [key]: val }));
  const updateUploadForm = (key, val) => setUploadForm((f) => ({ ...f, [key]: val }));

  // 统计
  const todayCount = todayTreatments.length;
  const highRiskCount = alerts.filter((a) => a.risk_level === "high").length;
  const alertCount = alerts.length;

  // 运动员疲劳度
  const getFatigue = (athleteId) => {
    const health = athleteHealth[athleteId];
    return health?.fatigue_trend?.[0]?.level || "低";
  };

  const getFatigueClass = (level) => {
    if (level === "高") return "high";
    if (level === "中") return "mid";
    return "low";
  };

  // 时间问候
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 6) return "夜深了";
    if (h < 11) return "早上好";
    if (h < 14) return "中午好";
    if (h < 18) return "下午好";
    return "晚上好";
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 70 }}>
      {/* Header */}
      {activeTab === "home" && (
        <div className="doctor-header">
          <div>
            <div className="greeting-small">{getGreeting()}，</div>
            <div className="greeting-name">{user.display_name}</div>
            <div className="greeting-sub">队医</div>
          </div>
          <div className="avatar-ring" onClick={() => setShowProfile(true)} title="我的">
            <div className="avatar">{user.display_name?.[0]}</div>
          </div>
        </div>
      )}

      {/* ===== 首页 ===== */}
      {activeTab === "home" && (
        <div className="doctor-page active">
          {/* 统计行 */}
          <div className="doctor-stat-row">
            <div className="doctor-stat-card">
              <div className="doctor-stat-value red">{alertCount}</div>
              <div className="doctor-stat-label">伤病预警</div>
            </div>
            <div className="doctor-stat-card">
              <div className="doctor-stat-value good">{todayCount}</div>
              <div className="doctor-stat-label">今日治疗</div>
            </div>
            <div className="doctor-stat-card">
              <div className="doctor-stat-value red">{highRiskCount}</div>
              <div className="doctor-stat-label">高危</div>
            </div>
          </div>

          {/* 预警运动员 */}
          <div className="alert-section">
            <div className="section-title">预警运动员</div>
            {alerts.length > 0 ? alerts.map((a) => (
              <div key={a.athlete_id} className="alert-card" onClick={() => setShowDetail(a.athlete_id)}>
                <div className="alert-icon">⚠️</div>
                <div className="alert-content">
                  <div className="alert-title">{a.athlete_name}</div>
                  <div className="alert-desc">{a.reasons?.[0] || "需关注"}</div>
                  <span className="alert-badge">伤病预警</span>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: "center", padding: 20, color: "var(--text-dim)", fontSize: 12 }}>暂无伤病预警</div>
            )}
          </div>

          {/* 明日训练安排预览 */}
          <div className="preview-card">
            <div className="section-title">明日训练安排预览</div>
            <div className="preview-box" onClick={() => setShowConflictSheet(true)}>
              <div className="preview-left">
                <div className="preview-icon">🔍</div>
                <div>
                  <div className="preview-title">检查冲突</div>
                  <div className="preview-sub">
                    {tomorrowPlans.length > 0 ? `${tomorrowPlans.length} 个训练计划` : "明日暂无训练计划"}
                  </div>
                </div>
              </div>
              <span className="preview-arrow">›</span>
            </div>
          </div>

          {/* 今日治疗记录 */}
          <div className="treat-section">
            <div className="section-title">今日治疗记录</div>
            {todayTreatments.length > 0 ? (
              todayTreatments.map((t) => (
                <div key={t.id} className="treat-record-card">
                  <div className="treat-record-header">
                    <span className="treat-record-type">{t.treatment_method}</span>
                    <span className="treat-record-date">{t.treatment_date?.slice(0, 10)}</span>
                  </div>
                  <div className="treat-record-body">
                    {t.body_part} · {t.athlete_name}
                    {t.recovery_period_hours && ` · 恢复期${t.recovery_period_hours}h`}
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="treat-empty">
                  <div className="treat-empty-icon">📋</div>
                  <div className="treat-empty-text">今日暂无治疗记录</div>
                </div>
                <button className="add-treat-btn" onClick={() => setShowTreatSheet(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  录入治疗
                </button>
              </>
            )}
          </div>

          {/* 运动员列表 */}
          <div>
            <div className="section-title">运动员列表</div>
            <div className="athlete-list">
              {athletes.map((a) => {
                const fatigue = getFatigue(a.id);
                const fatigueClass = getFatigueClass(fatigue);
                return (
                  <div key={a.id} className={`athlete-card${fatigueClass === "mid" ? " warn" : ""}`} onClick={() => setShowDetail(a.id)}>
                    <div className="athlete-avatar">{a.display_name?.[0]}</div>
                    <div className="athlete-info">
                      <div className="athlete-name">{a.display_name}</div>
                      <div className="athlete-meta">
                        {athleteHealth[a.id]?.treatments?.[0]
                          ? `最近治疗: ${athleteHealth[a.id].treatments[0].treatment_date?.split("T")[0]}`
                          : "暂无治疗"}
                      </div>
                    </div>
                    <div className="athlete-right">
                      <span className={`athlete-fatigue ${fatigueClass}`}>疲劳: {fatigue}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== 治疗记录 ===== */}
      {activeTab === "treatments" && (
        <div className="doctor-page active">
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 24, letterSpacing: "-0.02em" }}>治疗记录</h1>

          <div className="detail-form-card">
            <div className="detail-field">
              <div className="detail-field-label">运动员</div>
              <select className="form-input" value={treatForm.athlete_id} onChange={(e) => updateTreatForm("athlete_id", e.target.value)}>
                <option value="">– 选择运动员 –</option>
                {athletes.map((a) => (
                  <option key={a.id} value={a.id}>{a.display_name}</option>
                ))}
              </select>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">治疗时间</div>
              <input type="datetime-local" className="form-input" value={treatForm.treatment_date} onChange={(e) => updateTreatForm("treatment_date", e.target.value)} />
            </div>
            <div className="detail-field">
              <div className="detail-field-label">治疗部位</div>
              <input type="text" className="form-input" placeholder="如：左膝前侧" value={treatForm.body_part} onChange={(e) => updateTreatForm("body_part", e.target.value)} />
            </div>
            <div className="detail-field">
              <div className="detail-field-label">治疗方式</div>
              <select className="form-input" value={treatForm.treatment_method} onChange={(e) => updateTreatForm("treatment_method", e.target.value)}>
                {TREATMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">使用设备</div>
              <input type="text" className="form-input" placeholder="如：超声治疗仪" value={treatForm.device_used} onChange={(e) => updateTreatForm("device_used", e.target.value)} />
            </div>
            <div className="detail-field">
              <div className="detail-field-label">恢复期（小时）</div>
              <input type="number" className="form-input" value={treatForm.recovery_period_hours} onChange={(e) => updateTreatForm("recovery_period_hours", e.target.value)} />
            </div>
            <div className="detail-field">
              <div className="detail-field-label">注意事项</div>
              <button
                className={`form-voice-btn${voiceRecording ? " recording" : ""}`}
                onClick={() => {
                  if (!voiceRecording) {
                    setVoiceRecording(true);
                    setTimeout(() => setVoiceRecording(false), 3000);
                  }
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="1" width="6" height="11" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" />
                  <line x1="12" y1="17" x2="12" y2="21" /><line x1="8" y1="21" x2="16" y2="21" />
                </svg>
                <span>{voiceRecording ? "正在录音…" : "语音输入"}</span>
              </button>
              <textarea className="form-input" placeholder="如：48h内避免高强度负荷" value={treatForm.notes} onChange={(e) => updateTreatForm("notes", e.target.value)} />
            </div>
          </div>

          <button className="submit-btn" onClick={handleSaveTreatment} disabled={saving}>
            {saving ? "保存中..." : "保存治疗记录"}
          </button>

          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: "28px 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
            最近记录
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "var(--accent-dim)", color: "var(--accent)", fontWeight: 600 }}>
              {todayTreatments.length} 条
            </span>
          </div>

          {todayTreatments.map((t) => (
            <div key={t.id} className="treat-record-card">
              <div className="treat-record-header">
                <span className="treat-record-type">{t.treatment_method}</span>
                <span className="treat-record-date">{t.treatment_date?.slice(0, 10)}</span>
              </div>
              <div className="treat-record-body">
                {t.body_part} · 恢复期{t.recovery_period_hours}h
                {t.notes && ` · ${t.notes}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== 伤病管理 ===== */}
      {activeTab === "injuries" && (
        <div className="doctor-page active">
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 24, letterSpacing: "-0.02em" }}>伤病管理</h1>

          <div className="alert-section" style={{ marginBottom: 24 }}>
            <div className="section-title">
              伤病预警
              <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 10, background: "var(--red-dim)", color: "var(--red)", fontWeight: 600 }}>
                {alertCount}
              </span>
            </div>
            {alerts.length > 0 ? alerts.map((a) => (
              <div key={a.athlete_id} className="alert-card" onClick={() => setShowDetail(a.athlete_id)}>
                <div className="alert-icon">⚠️</div>
                <div className="alert-content">
                  <div className="alert-title">{a.athlete_name}</div>
                  <div className="alert-desc">{a.reasons?.[0] || "需关注"}</div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: "center", padding: 20, color: "var(--text-dim)", fontSize: 12 }}>暂无伤病预警</div>
            )}
          </div>

          <div className="section-title">全部运动员</div>
          <div className="athlete-list">
            {athletes.map((a) => {
              const fatigue = getFatigue(a.id);
              const fatigueClass = getFatigueClass(fatigue);
              const hasAlert = alerts.some((alert) => alert.athlete_id === a.id);
              return (
                <div key={a.id} className="athlete-card" onClick={() => setShowDetail(a.id)}>
                  <div className="athlete-avatar">{a.display_name?.[0]}</div>
                  <div className="athlete-info">
                    <div className="athlete-name">{a.display_name}</div>
                    <div className="athlete-meta">
                      {hasAlert ? "有伤病预警" : "无伤病"} · 疲劳: {fatigue}
                    </div>
                  </div>
                  <div className="athlete-right">
                    <span className={`athlete-fatigue ${fatigueClass}`}>{hasAlert ? "关注" : "正常"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== 通知 ===== */}
      {activeTab === "notify" && (
        <div className="doctor-page active">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>通知</h1>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>全部已读</button>
            )}
          </div>

          {/* 通知统计 */}
          <div style={{ display: "flex", gap: 10, marginBottom: 24, animation: "fadeUp 0.4s ease 0s both" }}>
            <div style={{ flex: 1, padding: "14px 10px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "var(--red)" }} />
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--red)", lineHeight: 1 }}>
                {notifications.filter((n) => (n.type === "risk_alert" || n.type === "injury_alert") && !n.is_read).length}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 5, fontWeight: 500 }}>预警</div>
            </div>
            <div style={{ flex: 1, padding: "14px 10px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "var(--accent)" }} />
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>{unreadCount}</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 5, fontWeight: 500 }}>未读</div>
            </div>
            <div style={{ flex: 1, padding: "14px 10px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "var(--blue)" }} />
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--blue)", lineHeight: 1 }}>
                {notifications.filter((n) => n.is_read).length}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 5, fontWeight: 500 }}>已读</div>
            </div>
          </div>

          {/* 通知列表 */}
          {notifications.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--text-dim)" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
              <div>暂无通知</div>
            </div>
          ) : (
            (() => {
              const grouped = {};
              notifications.forEach((n) => {
                const group = getTimeGroup(n.created_at);
                if (!grouped[group]) grouped[group] = [];
                grouped[group].push(n);
              });
              const groupOrder = ["今天", "昨天", "更早"];

              return groupOrder.map((group) => {
                const items = grouped[group];
                if (!items?.length) return null;
                return (
                  <div key={group}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-dim)", letterSpacing: "0.04em", textTransform: "uppercase", margin: "24px 0 12px", paddingLeft: 4, animation: "fadeUp 0.3s ease both" }}>{group}</div>
                    {items.map((notif, i) => {
                      const config = NOTIF_CONFIG[notif.type] || NOTIF_CONFIG.general;
                      const colors = NOTIF_COLORS[config.color] || NOTIF_COLORS.blue;
                      return (
                        <div
                          key={notif.id}
                          onClick={async () => {
                            if (!notif.is_read) {
                              try {
                                await notificationService.markAsRead(notif.id);
                                setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n));
                                setUnreadCount((prev) => Math.max(0, prev - 1));
                              } catch {}
                            }
                          }}
                          style={{
                            display: "flex", gap: 14, padding: 18,
                            background: "var(--card)", border: "1px solid var(--border)",
                            borderLeft: !notif.is_read ? "3px solid var(--accent)" : "1px solid var(--border)",
                            borderRadius: 16, cursor: "pointer", marginBottom: 12,
                            transition: "border-color 0.2s, background 0.2s",
                            animation: `fadeUp 0.4s ease ${0.05 + i * 0.05}s both`,
                            position: "relative",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.background = "var(--card-hover)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--card)"; }}
                        >
                          {!notif.is_read && (
                            <div style={{ position: "absolute", top: 18, right: 18, width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
                          )}
                          <div style={{ width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, background: colors.bg }}>{config.icon}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 5, paddingRight: 16 }}>{notif.title}</div>
                            {notif.content && <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>{notif.content}</div>}
                            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--text-dim)" }} />
                              {formatTime(notif.created_at)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              });
            })()
          )}

          {/* 快捷操作 */}
          <div style={{ display: "flex", gap: 10, marginTop: 20, animation: "fadeUp 0.4s ease 0.2s both" }}>
            <button onClick={markAllAsRead} style={{ flex: 1, padding: "13px 14px", border: "1px solid var(--border)", borderRadius: 10, background: "var(--card)", color: "var(--text-secondary)", fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              全部标记已读
            </button>
            <button onClick={() => setActiveTab("home")} style={{ flex: 1, padding: "13px 14px", border: "1px solid var(--border)", borderRadius: 10, background: "var(--card)", color: "var(--text-secondary)", fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
              返回首页
            </button>
          </div>
        </div>
      )}

      {/* ===== 运动员详情 Sheet ===== */}
      {showDetail && (
        <>
          <div className="sheet-overlay open" onClick={() => setShowDetail(null)} />
          <div className="sheet open">
            <div className="sheet-handle-area" onClick={() => setShowDetail(null)}>
              <div className="sheet-handle" />
            </div>

            <button className="back-btn" onClick={() => setShowDetail(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              返回
            </button>

            {(() => {
              const athlete = athletes.find((a) => a.id === showDetail);
              const fatigue = getFatigue(showDetail);
              const fatigueClass = getFatigueClass(fatigue);
              const health = athleteHealth[showDetail];

              return (
                <>
                  <div className="detail-top">
                    <div className="detail-avatar">{athlete?.display_name?.[0]}</div>
                    <div>
                      <div className="detail-name">{athlete?.display_name}</div>
                      <span className="detail-fatigue-tag" style={{
                        background: fatigueClass === "high" ? "var(--red-dim)" : fatigueClass === "mid" ? "var(--amber-dim)" : "var(--green-dim)",
                        color: fatigueClass === "high" ? "var(--red)" : fatigueClass === "mid" ? "var(--amber)" : "var(--green)",
                      }}>
                        当前疲劳度：{fatigue}
                      </span>
                    </div>
                  </div>

                  <div className="tabs">
                    <button className={`tab-btn${detailTab === "injury" ? " active" : ""}`} onClick={() => setDetailTab("injury")}>伤病记录</button>
                    <button className={`tab-btn${detailTab === "treat" ? " active" : ""}`} onClick={() => setDetailTab("treat")}>治疗记录</button>
                    <button className={`tab-btn${detailTab === "train" ? " active" : ""}`} onClick={() => setDetailTab("train")}>训练数据</button>
                  </div>

                  {/* 伤病记录 Tab */}
                  {detailTab === "injury" && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                        <button className="empty-btn" onClick={() => setShowInjurySheet(true)}>+ 录入伤病</button>
                      </div>
                      <div className="empty-state">
                        <div className="empty-icon">🩹</div>
                        <div className="empty-text">暂无伤病记录</div>
                        <div className="empty-sub">点击上方按钮录入伤病信息</div>
                      </div>
                      <button className="empty-btn" style={{ width: "100%", marginTop: 12 }} onClick={() => setShowUploadSheet(true)}>
                        上传医院检查结果
                      </button>
                    </div>
                  )}

                  {/* 治疗记录 Tab */}
                  {detailTab === "treat" && (
                    <div>
                      {health?.treatments?.length > 0 ? health.treatments.map((t, i) => (
                        <div key={i} className="treat-record-card">
                          <div className="treat-record-header">
                            <span className="treat-record-type">{t.treatment_method}</span>
                            <span className="treat-record-date">{t.treatment_date?.slice(0, 10)}</span>
                          </div>
                          <div className="treat-record-body">
                            {t.body_part}
                            {t.recovery_period_hours && ` · 恢复期${t.recovery_period_hours}h`}
                            {t.notes && ` · ${t.notes}`}
                          </div>
                        </div>
                      )) : (
                        <div className="empty-state">
                          <div className="empty-icon">📋</div>
                          <div className="empty-text">暂无治疗记录</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 训练数据 Tab */}
                  {detailTab === "train" && (
                    <div>
                      <div className="fatigue-card">
                        <div className="fatigue-card-title">疲劳度趋势（最近 6 次）</div>
                        {health?.fatigue_trend?.slice(0, 6).map((f, i) => (
                          <div key={i} className="fatigue-item">
                            <span className="fatigue-date">{f.date?.slice(5)}</span>
                            <span className={`fatigue-tag ${getFatigueClass(f.level)}`}>{f.level}</span>
                          </div>
                        )) || (
                          <div style={{ textAlign: "center", padding: 20, color: "var(--text-dim)", fontSize: 12 }}>暂无数据</div>
                        )}
                      </div>

                      <div className="pain-card">
                        <div className="pain-card-title">疼痛部位统计</div>
                        {health?.pain_stats ? Object.entries(health.pain_stats).map(([part, count], i) => {
                          const maxCount = Math.max(...Object.values(health.pain_stats));
                          const colors = ["red", "amber", "blue"];
                          return (
                            <div key={i} className="pain-item">
                              <span className="pain-label">{part}</span>
                              <div className="pain-bar-track">
                                <div className={`pain-bar-fill ${colors[i % 3]}`} style={{ width: `${(count / maxCount) * 100}%` }}>
                                  {count}次
                                </div>
                              </div>
                            </div>
                          );
                        }) : (
                          <div style={{ textAlign: "center", padding: 20, color: "var(--text-dim)", fontSize: 12 }}>暂无数据</div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </>
      )}

      {/* ===== 个人资料 Sheet ===== */}
      {showProfile && (
        <>
          <div className="sheet-overlay open" onClick={() => setShowProfile(false)} />
          <div className="sheet open">
            <div className="sheet-handle-area" onClick={() => setShowProfile(false)}>
              <div className="sheet-handle" />
            </div>
            <div className="sheet-header">
              <div className="sheet-avatar-ring">
                <div className="sheet-avatar">{user.display_name?.[0]}</div>
              </div>
              <div className="sheet-name">{user.display_name}</div>
              <span className="sheet-role">队医</span>
            </div>
            <div className="sheet-info-group">
              <div className="sheet-info-row">
                <span className="sheet-info-label">账号名</span>
                <span className="sheet-info-value">{user.display_name}</span>
              </div>
              <div className="sheet-info-row">
                <span className="sheet-info-label">角色</span>
                <span className="sheet-info-value">队医</span>
              </div>
              <div className="sheet-info-row">
                <span className="sheet-info-label">用户 ID</span>
                <span className="sheet-info-value">{user.id}</span>
              </div>
            </div>
            {/* 加入团队（无团队时显示） */}
            {!user?.team_id && (
              <div style={{ marginBottom: 16 }}>
                <TeamJoinCard />
              </div>
            )}
            <button className="sheet-logout" onClick={() => { setShowProfile(false); logout(); }}>退出登录</button>
          </div>
        </>
      )}

      {/* ===== 冲突检查 Sheet ===== */}
      {showConflictSheet && (
        <>
          <div className="sheet-overlay open" onClick={() => setShowConflictSheet(false)} />
          <div className="sheet open">
            <div className="sheet-handle-area" onClick={() => setShowConflictSheet(false)}>
              <div className="sheet-handle" />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>治疗-训练冲突检查</h2>
              <button className="conflict-refresh" onClick={fetchAll}>刷新</button>
            </div>

            <div className="conflict-stat-row">
              <div className="conflict-stat">
                <div className="conflict-stat-num" style={{ color: "var(--blue)" }}>{todayCount}</div>
                <div className="conflict-stat-label">今日治疗</div>
              </div>
              <div className="conflict-stat">
                <div className="conflict-stat-num" style={{ color: "var(--accent)" }}>{tomorrowPlans.length}</div>
                <div className="conflict-stat-label">明日计划</div>
              </div>
              <div className="conflict-stat">
                <div className="conflict-stat-num" style={{ color: "var(--green)" }}>{conflictSummary?.conflict_count || 0}</div>
                <div className="conflict-stat-label">冲突</div>
              </div>
            </div>

            <div className="conflict-date">
              检查日期: {new Date().toISOString().split("T")[0]} → 明日: {new Date(Date.now() + 86400000).toISOString().split("T")[0]}
            </div>

            {athletes.map((a) => (
              <div key={a.id} className="conflict-athlete-card">
                <div className="conflict-athlete-header">
                  <div className="conflict-athlete-avatar">{a.display_name?.[0]}</div>
                  <div className="conflict-athlete-name">{a.display_name}</div>
                </div>
                <div className="conflict-info">
                  <span>今日治疗:</span> {todayTreatments.find((t) => t.athlete_id === a.id) ? "有治疗安排" : "无今日治疗"}
                  <br />
                  <span>明日计划:</span> {tomorrowPlans.find((p) => p.athlete_id === a.id) ? "有训练计划" : "无明日计划"}
                </div>
                <div className="conflict-analysis">✓ 分析: 今日无治疗安排</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===== 快捷录入治疗 Sheet ===== */}
      {showTreatSheet && (
        <>
          <div className="sheet-overlay open" onClick={() => setShowTreatSheet(false)} />
          <div className="sheet open">
            <div className="sheet-handle-area" onClick={() => setShowTreatSheet(false)}>
              <div className="sheet-handle" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 20 }}>录入治疗记录</h2>

            <div style={{ marginBottom: 16 }}>
              <div className="detail-field-label">运动员</div>
              <select className="form-input" value={treatForm.athlete_id} onChange={(e) => updateTreatForm("athlete_id", e.target.value)}>
                <option value="">– 选择运动员 –</option>
                {athletes.map((a) => <option key={a.id} value={a.id}>{a.display_name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div className="detail-field-label">治疗时间</div>
              <input type="datetime-local" className="form-input" value={treatForm.treatment_date} onChange={(e) => updateTreatForm("treatment_date", e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div className="detail-field-label">治疗部位</div>
              <input type="text" className="form-input" placeholder="如：左膝前侧" value={treatForm.body_part} onChange={(e) => updateTreatForm("body_part", e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div className="detail-field-label">治疗方式</div>
              <select className="form-input" value={treatForm.treatment_method} onChange={(e) => updateTreatForm("treatment_method", e.target.value)}>
                {TREATMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div className="detail-field-label">使用设备</div>
              <input type="text" className="form-input" placeholder="如：超声治疗仪" value={treatForm.device_used} onChange={(e) => updateTreatForm("device_used", e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div className="detail-field-label">恢复期（小时）</div>
              <input type="number" className="form-input" value={treatForm.recovery_period_hours} onChange={(e) => updateTreatForm("recovery_period_hours", e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div className="detail-field-label">注意事项</div>
              <textarea className="form-input" placeholder="如：48h内避免高强度负荷" value={treatForm.notes} onChange={(e) => updateTreatForm("notes", e.target.value)} />
            </div>
            <button className="submit-btn" onClick={handleSaveTreatment} disabled={saving}>
              {saving ? "保存中..." : "保存治疗记录"}
            </button>
          </div>
        </>
      )}

      {/* ===== 录入伤病 Sheet ===== */}
      {showInjurySheet && (
        <>
          <div className="sheet-overlay open" onClick={() => setShowInjurySheet(false)} />
          <div className="sheet open">
            <div className="sheet-handle-area" onClick={() => setShowInjurySheet(false)}>
              <div className="sheet-handle" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>录入伤病记录</h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>
              {athletes.find((a) => a.id === showDetail)?.display_name} — 健康档案
            </p>

            <div style={{ marginBottom: 16 }}>
              <div className="detail-field-label">受伤日期</div>
              <input type="date" className="form-input" value={injuryForm.injury_date} onChange={(e) => updateInjuryForm("injury_date", e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div className="detail-field-label">受伤部位</div>
              <input type="text" className="form-input" placeholder="如：右膝" value={injuryForm.body_part} onChange={(e) => updateInjuryForm("body_part", e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div className="detail-field-label">伤病类型</div>
              <select className="form-input" value={injuryForm.injury_type} onChange={(e) => updateInjuryForm("injury_type", e.target.value)}>
                {INJURY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div className="detail-field-label">严重程度</div>
              <select className="form-input" value={injuryForm.severity} onChange={(e) => updateInjuryForm("severity", e.target.value)}>
                {SEVERITY_LEVELS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div className="detail-field-label">诊断</div>
              <input type="text" className="form-input" placeholder="如：髌骨软化症早期" value={injuryForm.diagnosis} onChange={(e) => updateInjuryForm("diagnosis", e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div className="detail-field-label">原因分析</div>
              <input type="text" className="form-input" placeholder="如：近两周跑量增加过快" value={injuryForm.cause_analysis} onChange={(e) => updateInjuryForm("cause_analysis", e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div className="detail-field-label">治疗方案</div>
              <input type="text" className="form-input" placeholder="如：超声治疗+休息" value={injuryForm.treatment_plan} onChange={(e) => updateInjuryForm("treatment_plan", e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div className="detail-field-label">预估恢复时间</div>
              <input type="text" className="form-input" placeholder="如：2周" value={injuryForm.estimated_recovery} onChange={(e) => updateInjuryForm("estimated_recovery", e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div className="detail-field-label">备注</div>
              <button
                className={`form-voice-btn${injuryVoiceRecording ? " recording" : ""}`}
                onClick={() => {
                  if (!injuryVoiceRecording) {
                    setInjuryVoiceRecording(true);
                    setTimeout(() => setInjuryVoiceRecording(false), 3000);
                  }
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="1" width="6" height="11" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" />
                  <line x1="12" y1="17" x2="12" y2="21" /><line x1="8" y1="21" x2="16" y2="21" />
                </svg>
                <span>{injuryVoiceRecording ? "正在录音…" : "语音输入"}</span>
              </button>
              <textarea className="form-input" placeholder="其他备注信息..." value={injuryForm.notes} onChange={(e) => updateInjuryForm("notes", e.target.value)} />
            </div>
            <button className="submit-btn" onClick={() => { setShowInjurySheet(false); alert("伤病记录已保存"); }}>
              保存伤病记录
            </button>
          </div>
        </>
      )}

      {/* ===== 上传检查结果 Sheet ===== */}
      {showUploadSheet && (
        <>
          <div className="sheet-overlay open" onClick={() => setShowUploadSheet(false)} />
          <div className="sheet open">
            <div className="sheet-handle-area" onClick={() => setShowUploadSheet(false)}>
              <div className="sheet-handle" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 20 }}>上传医院检查结果</h2>

            <div style={{ marginBottom: 16 }}>
              <div className="detail-field-label">检查日期</div>
              <input type="date" className="form-input" value={uploadForm.check_date} onChange={(e) => updateUploadForm("check_date", e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div className="detail-field-label">检查类型</div>
              <select className="form-input" value={uploadForm.check_type} onChange={(e) => updateUploadForm("check_type", e.target.value)}>
                {CHECK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div className="detail-field-label">备注</div>
              <textarea className="form-input" placeholder="检查说明或医嘱..." value={uploadForm.notes} onChange={(e) => updateUploadForm("notes", e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div className="detail-field-label">选择文件</div>
              <div className="upload-dropzone" onClick={() => document.getElementById("fileInput").click()}>
                <div className="upload-dropzone-icon">📁</div>
                <div className="upload-dropzone-text">点击选择文件</div>
                <div className="upload-dropzone-hint">{uploadForm.file ? uploadForm.file.name : "未选择任何文件"}</div>
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: "none" }}
                  onChange={(e) => updateUploadForm("file", e.target.files[0] || null)}
                />
              </div>
            </div>
            <button className="submit-btn" onClick={() => { setShowUploadSheet(false); alert("检查结果已上传"); }}>
              上传检查结果
            </button>
          </div>
        </>
      )}

      {/* 底部导航 */}
      <DoctorNav active={activeTab} onNavigate={setActiveTab} alertCount={alertCount} badgeCount={unreadCount} />
    </div>
  );
}

// 底部导航组件
export function DoctorNav({ active, onNavigate, alertCount, badgeCount = 0 }) {
  const items = [
    {
      key: "home",
      label: "首页",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      key: "treatments",
      label: "治疗记录",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
    },
    {
      key: "injuries",
      label: "伤病管理",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      badge: alertCount,
    },
    {
      key: "notify",
      label: "通知",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
      badge: badgeCount,
    },
  ];

  return (
    <nav className="doctor-nav">
      {items.map((item) => (
        <button
          key={item.key}
          className={`doctor-nav-btn${active === item.key ? " active" : ""}`}
          onClick={() => onNavigate(item.key)}
        >
          {item.icon}
          <span>{item.label}</span>
          {item.badge > 0 && <span className="badge">{item.badge}</span>}
        </button>
      ))}
    </nav>
  );
}
