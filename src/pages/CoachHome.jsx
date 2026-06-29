// API calls migrated to services layer
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useI18n } from "../locales/index.jsx";
import { STATUS_COLORS } from "../styles/sharedStyles.js";
import { sessionService, authService, planService, coachService, notificationService, assistantService, bindingService, translateService } from "../services";
import { startMimoAsr } from "../utils/mimoAsr.js";
import { getTranslation } from "../utils/translateCache.js";
import LoadingState from "../components/LoadingState.jsx";
import CoachNav from "../components/CoachNav.jsx";
import NotificationBell from "../components/NotificationBell.jsx";
import ProfileSheet from "../components/ProfileSheet.jsx";
import ResultView from "../components/ResultView.jsx";
import FitDataCard from "../components/FitDataCard.jsx";
import TranslateButton from "../components/TranslateButton.jsx";
import LanguageSwitch from "../components/LanguageSwitch.jsx";
import '../styles/coach-pages.css';

const DAY_NAMES_MAP = {
  zh: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  it: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
};

const SESSION_TYPES_MAP = {
  zh: ["间歇训练", "节奏跑", "轻松跑", "长距离跑", "恢复跑", "力量训练", "比赛"],
  en: ["Interval", "Tempo Run", "Easy Run", "Long Run", "Recovery Run", "Strength Training", "Race"],
  it: ["Intervalli", "Corsa Ritmo", "Corsa Facile", "Corsa Lunga", "Recupero", "Allenamento Forza", "Gara"],
};

export default function CoachHome() {
  const { user, logout } = useAuth();
  const { lang, t } = useI18n();
  const coachT = t.coach || {};
  const DAY_NAMES = DAY_NAMES_MAP[lang] || DAY_NAMES_MAP.zh;
  const SESSION_TYPES = SESSION_TYPES_MAP[lang] || SESSION_TYPES_MAP.zh;
  const [activeTab, setActiveTab] = useState("home");
  const [showProfile, setShowProfile] = useState(false);

  // 工作台
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [athleteSessions, setAthleteSessions] = useState([]);
  const [athleteNotes, setAthleteNotes] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [displayReport, setDisplayReport] = useState(null);
  const [reportLang, setReportLang] = useState("zh");
  const [sessionLoading, setSessionLoading] = useState(false);

  // 绑定管理
  const [showBindingSheet, setShowBindingSheet] = useState(false);
  const [bindingAthlete, setBindingAthlete] = useState(null);
  const [bindingData, setBindingData] = useState(null);
  const [allAssistants, setAllAssistants] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [bindingSaving, setBindingSaving] = useState(false);

  // 计划
  const [plans, setPlans] = useState([]);
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planSaving, setPlanSaving] = useState(false);
  const [athletes, setAthletes] = useState([]);
  const today = new Date().toISOString().split("T")[0];
  const emptyForm = { title: "", plan_date: today, plan_type: "轻松跑", training_zone: "E", intensity_level: "medium", target_pace: "", target_hr: "", estimated_distance: "", estimated_duration: "", target_athletes: [], warmup: "", main: [{ exercise: "", pace: "", rest: "" }], cooldown: "", notes: "" };
  const [form, setForm] = useState({ ...emptyForm });

  // 记录
  const [rawText, setRawText] = useState("");
  const [sessionDate, setSessionDate] = useState(today);
  const [sessionType, setSessionType] = useState("");
  const [recordLoading, setRecordLoading] = useState(false);
  const [recordResult, setRecordResult] = useState(null);
  const [recordError, setRecordError] = useState(null);
  const [records, setRecords] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const asrRef = useRef(null);

  // 通知
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => { fetchOverview(); fetchAthletes(); fetchPlans(); fetchRecords(); fetchNotifications(); fetchUnreadCount(); fetchStaffLists(); }, []);
  useEffect(() => { fetchPlans(); }, [weekStart]);

  // ========== 数据获取 ==========
  const fetchOverview = async () => {
    try { setOverview(await sessionService.getTeamOverview()); }
    catch {} finally { setLoading(false); }
  };
  const fetchAthletes = async () => {
    try { const data = await authService.getAthletes(); setAthletes(data.athletes || []); } catch {}
  };
  const fetchStaffLists = async () => {
    try {
      const users = await authService.getUsers();
      setAllAssistants((users.users || []).filter(u => u.role === "assistant"));
      setAllDoctors((users.users || []).filter(u => u.role === "doctor"));
    } catch {}
  };
  const fetchPlans = async () => {
    try { const data = await planService.getPlans({ week_start: weekStart.toISOString().split("T")[0] }); setPlans(data.plans || []); } catch {}
  };
  const fetchRecords = async () => {
    try { const data = await coachService.getSessionRecords({ limit: 10 }); setRecords(data.records || []); } catch {}
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
  const fetchAthleteDetail = async (id, name) => {
    setSelectedAthlete({ id, name }); setSelectedReport(null); setSessionLoading(true);
    try {
      const [s, n] = await Promise.all([
        sessionService.getSessions({ athlete_id: id, limit: 10 }),
        assistantService.getCoachNotes({ athlete_id: id, limit: 10 }),
      ]);
      setAthleteSessions(s.sessions || []);
      setAthleteNotes(n.notes || []);
    } catch {} finally { setSessionLoading(false); }
  };
  const fetchReportDetail = async (sid) => {
    try {
      const data = await sessionService.getSessionById(sid);
      setSelectedReport(data);
      setDisplayReport(null); // 重置翻译状态
    } catch (e) { alert((coachT.getReportFailed || "获取报告失败: ") + e.message); }
  };

  // ========== 计划操作 ==========
  const changeWeek = (o) => { const d = new Date(weekStart); d.setDate(d.getDate() + o * 7); setWeekStart(d); };
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i);
    const ds = d.toISOString().split("T")[0];
    return { date: ds, dayName: DAY_NAMES[d.getDay()], isToday: ds === today, plans: plans.filter((p) => p.plan_date === ds) };
  });
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6);

  const openCreatePlan = (date) => { setEditingPlan(null); setForm({ ...emptyForm, plan_date: date || today }); setShowPlanModal(true); };
  const openEditPlan = (p) => {
    const c = p.content_json || {};
    setEditingPlan(p);
    setForm({ title: p.title || "", plan_date: p.plan_date || "", plan_type: p.plan_type || "轻松跑", training_zone: p.training_zone || "E", intensity_level: p.intensity_level || "medium", target_pace: c.target_pace || "", target_hr: c.target_hr || "", estimated_distance: c.estimated_distance || "", estimated_duration: c.estimated_duration || "", target_athletes: (p.target_athletes || []).map(Number), warmup: c.warmup || "", main: c.main?.length > 0 ? c.main.map((m) => typeof m === "string" ? { exercise: m, pace: "", rest: "" } : m) : [{ exercise: "", pace: "", rest: "" }], cooldown: c.cooldown || "", notes: c.notes || "" });
    setShowPlanModal(true);
  };
  const handleSavePlan = async () => {
    if (!form.title || !form.plan_date) { alert(coachT.fillTitleDate || "请填写标题和日期"); return; }
    setPlanSaving(true);
    try {
      const content_json = { warmup: form.warmup, main: form.main.filter((m) => m.exercise), cooldown: form.cooldown, notes: form.notes, target_zone: form.training_zone, target_pace: form.target_pace, target_hr: form.target_hr, estimated_distance: form.estimated_distance, estimated_duration: form.estimated_duration };
      if (editingPlan) {
        await planService.updatePlan(editingPlan.id, { ...form, content_json });
      } else {
        await planService.createPlan({ ...form, content_json });
      }
      setShowPlanModal(false); fetchPlans();
    } catch (e) { alert((coachT.saveFailed || "保存失败: ") + e.message); } finally { setPlanSaving(false); }
  };
  const handleDeletePlan = async (id) => {
    if (!confirm(coachT.deleteConfirm || "确定删除？")) return;
    try { await planService.deletePlan(id); fetchPlans(); } catch (e) { alert((coachT.deleteFailed || "删除失败: ") + e.message); }
  };

  // ========== 记录操作 ==========
  const toggleRecording = () => {
    if (isRecognizing) return;

    if (isRecording) {
      if (asrRef.current) asrRef.current.stop();
      setIsRecording(false);
      setIsRecognizing(true);
    } else {
      setRawText("");
      const asr = startMimoAsr({
        language: "zh",
        onResult: (text) => {
          setIsRecognizing(false);
          setRawText(text);
        },
        onError: (msg) => {
          setIsRecognizing(false);
          setIsRecording(false);
          alert(msg);
        },
      });
      asrRef.current = asr;
      asr.start();
      setIsRecording(true);
    }
  };
  const handleSubmitRecord = async () => {
    if (!rawText.trim()) { alert(coachT.inputRequired || "请输入内容"); return; }
    setRecordLoading(true); setRecordError(null); setRecordResult(null);
    try {
      const data = await coachService.createSessionRecord({
        raw_voice_text: rawText.trim(),
        session_date: sessionDate,
        session_type: sessionType || undefined,
      });
      setRecordResult(data.parsed); fetchRecords();
    } catch (e) { setRecordError(e.message); } finally { setRecordLoading(false); }
  };

  // ========== 绑定管理操作 ==========
  const openBindingSheet = async (athlete) => {
    setBindingAthlete(athlete);
    setShowBindingSheet(true);
    try {
      const data = await bindingService.getAthleteBinding(athlete.athlete_id || athlete.id);
      setBindingData(data.binding || { athlete_id: athlete.athlete_id || athlete.id, coach_id: user.id, assistant_id: null, doctor_id: null });
    } catch {
      setBindingData({ athlete_id: athlete.athlete_id || athlete.id, coach_id: user.id, assistant_id: null, doctor_id: null });
    }
  };

  const saveBinding = async () => {
    if (!bindingData) return;
    setBindingSaving(true);
    try {
      const existing = await bindingService.getAthleteBinding(bindingData.athlete_id);
      if (existing.binding) {
        await bindingService.updateBinding(bindingData.athlete_id, bindingData);
      } else {
        await bindingService.createBinding(bindingData);
      }
      setShowBindingSheet(false);
      alert(coachT.bindingSaved || "绑定关系已保存");
    } catch (err) {
      alert((coachT.saveFailed || "保存失败: ") + err.message);
    } finally { setBindingSaving(false); }
  };

  // ========== 通知操作 ==========
  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((p) => p.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("标记已读失败:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((p) => p.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleNotifClick = async (notif) => {
    console.log("点击通知:", notif.id, notif.type);
    await markAsRead(notif.id);
    // 根据通知类型跳转
    if (notif.type === "conflict_alert") {
      window.location.href = "/doctor/conflict-check";
    }
    // 其他类型留在当前页面
  };
  const formatTime = (d) => {
    if (!d) return ""; const s = Math.floor((new Date() - new Date(d)) / 1000);
    if (s < 60) return coachT.justNow || "刚刚"; if (s < 3600) return `${Math.floor(s / 60)}${coachT.minutesAgo?.replace("{n}", "") || "分钟前"}`; if (s < 86400) return `${Math.floor(s / 3600)}${coachT.hoursAgo?.replace("{n}", "") || "小时前"}`; return `${Math.floor(s / 86400)}${coachT.daysAgo?.replace("{n}", "") || "天前"}`;
  };

  // 翻译通知内容
  const translateNotification = async (text) => {
    if (!text || lang === "zh") return text;
    return getTranslation(text, lang, translateService.translateText);
  };

  // 翻译后的通知内容缓存
  const [translatedNotifs, setTranslatedNotifs] = useState({});

  // 翻译所有通知
  useEffect(() => {
    if (lang === "zh" || notifications.length === 0) {
      setTranslatedNotifs({});
      return;
    }

    const translateAll = async () => {
      const translations = {};
      for (const n of notifications) {
        if (n.title) {
          translations[`${n.id}_title`] = await translateNotification(n.title);
        }
        if (n.content) {
          translations[`${n.id}_content`] = await translateNotification(n.content);
        }
      }
      setTranslatedNotifs(translations);
    };

    translateAll();
  }, [notifications, lang]);

  // 获取翻译后的通知文本
  const getNotifTitle = (notif) => {
    if (lang === "zh") return notif.title;
    return translatedNotifs[`${notif.id}_title`] || notif.title;
  };

  const getNotifContent = (notif) => {
    if (lang === "zh") return notif.content;
    return translatedNotifs[`${notif.id}_content`] || notif.content;
  };
  const getTimeGroup = (d) => {
    if (!d) return coachT.earlier || "更早";
    const now = new Date();
    const date = new Date(d);
    const diffDays = Math.floor((now - date) / 86400000);
    if (diffDays < 1) return coachT.today || "今天";
    if (diffDays < 2) return coachT.yesterday || "昨天";
    return coachT.earlier || "更早";
  };
  const NOTIF_CONFIG = { training_feedback: { icon: "📊", color: "blue" }, risk_alert: { icon: "⚠️", color: "red" }, injury_alert: { icon: "🔔", color: "red" }, treatment_plan: { icon: "💊", color: "green" }, training_note: { icon: "💬", color: "blue" }, conflict_alert: { icon: "⚡", color: "amber" }, plan_approval: { icon: "📋", color: "blue" }, general: { icon: "📢", color: "blue" } };
  const NOTIF_COLORS = { red: { bg: "var(--red-dim)" }, green: { bg: "var(--green-dim)" }, blue: { bg: "var(--blue-dim)" }, amber: { bg: "var(--accent-dim)" } };

  // ========== 表单辅助 ==========
  const updateForm = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const addEx = () => setForm((f) => ({ ...f, main: [...f.main, { exercise: "", pace: "", rest: "" }] }));
  const updEx = (i, k, v) => setForm((f) => { const m = [...f.main]; m[i] = { ...m[i], [k]: v }; return { ...f, main: m }; });
  const delEx = (i) => setForm((f) => ({ ...f, main: f.main.filter((_, idx) => idx !== i) }));
  const toggleAth = (id) => setForm((f) => ({ ...f, target_athletes: f.target_athletes.includes(id) ? f.target_athletes.filter((a) => a !== id) : [...f.target_athletes, id] }));

  const stats = overview?.stats || {};
  const athletesList = overview?.athletes || [];
  const riskAthletes = athletesList.filter((a) => a.risk_flag);

  return (
    <div className="app-shell" style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 70 }}>
      {/* Header - 只在工作台显示 */}
      {activeTab === "home" && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 22px 0" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 400, color: "var(--text-secondary)" }}>{(() => { const h = new Date().getHours(); if (h < 12) return coachT.greetingMorning || "早上好，"; if (h < 18) return coachT.greetingAfternoon || "下午好，"; return coachT.greetingEvening || "晚上好，"; })()}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", marginTop: 2 }}>{user.display_name}</div>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 4 }}>{coachT.role || "主教练"}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LanguageSwitch />
            <div onClick={() => setShowProfile(true)} style={{ width: 46, height: 46, borderRadius: "50%", padding: 2.5, background: "linear-gradient(135deg, var(--accent), #E87040)", cursor: "pointer" }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "var(--card)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 600, color: "var(--accent)" }}>{user.display_name?.[0]}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "0 22px", maxWidth: 430, margin: "0 auto" }}>
        {/* ===== 工作台 ===== */}
        {activeTab === "home" && (
          <>
            {loading ? (
              <LoadingState size="small" />
            ) : (
              <>
                {/* 统计卡片 */}
                <div style={{ display: "flex", gap: 10, margin: "28px 0 24px" }}>
                  <StatCard label={coachT.todayTraining || "今日训练"} value={`${stats.trained_today || 0}/${stats.total || 0}`} color="amber" />
                  <StatCard label={coachT.teamAvg || "团队均分"} value={stats.avg_score || "--"} color="accent" />
                  <StatCard label={coachT.alertCount || "预警人数"} value={stats.risk_count || 0} color={stats.risk_count > 0 ? "red" : "green"} />
                </div>

                {/* {coachT.alert || "预警"} */}
                {riskAthletes.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 14 }}>{coachT.needAttention || "需要关注的运动员"}</div>
                    {riskAthletes.map((a) => (
                      <div key={a.athlete_id} onClick={() => fetchAthleteDetail(a.athlete_id, a.display_name)} style={{
                        background: "linear-gradient(135deg, rgba(60,24,20,0.5), rgba(30,26,22,0.4))",
                        border: "1px solid rgba(212,92,92,0.15)", borderRadius: 16, padding: 18,
                        display: "flex", gap: 14, cursor: "pointer", marginBottom: 10,
                      }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(212,92,92,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⚠️</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{a.display_name}</div>
                          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{a.risk_reason || (coachT.needFollow || "需关注")}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 运动员列表 */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>{coachT.athleteStatus || "运动员状态"}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {athletesList.map((a) => {
                      const sc = STATUS_COLORS[a.status_level] || STATUS_COLORS["正常"];
                      return (
                        <div key={a.athlete_id} style={{
                          display: "flex", alignItems: "center", gap: 14, padding: "16px 18px",
                          background: "var(--card)", border: "1px solid var(--border)",
                          borderLeft: a.risk_flag ? "3px solid var(--red)" : a.status_level === "关注" ? "3px solid var(--amber)" : "1px solid var(--border)",
                          borderRadius: 16, transition: "all 0.2s",
                        }}>
                          <div onClick={() => fetchAthleteDetail(a.athlete_id, a.display_name)} style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, cursor: "pointer" }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 600, color: "var(--accent)" }}>{a.display_name?.[0]}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{a.display_name}</div>
                              <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 3 }}>{a.session_date ? (coachT.lastTraining ? coachT.lastTraining.replace("{date}", a.session_date) : `最近: ${a.session_date}`) : (coachT.noRecords || "暂无记录")}</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                              {a.overall_score ? <span style={{ fontSize: 18, fontWeight: 700, color: a.risk_flag ? "var(--red)" : a.status_level === "关注" ? "var(--amber)" : "var(--green)" }}>{a.overall_score}</span> : <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-dim)" }}>—</span>}
                              {a.status_level && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500, background: sc.bg, color: sc.text }}>{t.statusLevel?.[a.status_level] || a.status_level}</span>}
                            </div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); openBindingSheet(a); }} style={{
                            padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)",
                            background: "var(--surface)", color: "var(--text-dim)", fontSize: 11,
                            cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
                          }}>⚙️</button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 快速操作 */}
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setActiveTab("plan")} style={quickBtn}>
                    <span style={{ fontSize: 18 }}>📋</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>{coachT.trainingPlan || "训练计划"}</span>
                  </button>
                  <button onClick={() => setActiveTab("session")} style={quickBtn}>
                    <span style={{ fontSize: 18 }}>🎙️</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>{coachT.trainingRecords || "训练记录"}</span>
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* ===== 计划 ===== */}
        {activeTab === "plan" && (
          <>
            <div onClick={() => window.location.href = "/coach/ai-suggestion"} style={{ marginBottom: 20, padding: 20, cursor: "pointer", background: "linear-gradient(145deg, rgba(55,45,25,0.95) 0%, rgba(38,32,20,0.95) 50%, rgba(23,22,19,0.95) 100%)", border: "1px solid rgba(212,164,76,0.18)", borderRadius: 16, position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>🤖</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: "var(--accent)" }}>{coachT.aiAssistPlan || "AI 辅助制定计划"}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{coachT.aiAssistDesc || "输入训练目标和阶段，AI 将为你生成专业的训练计划建议"}</div>
            </div>

            <button onClick={() => openCreatePlan()} style={primaryBtn}>+ {coachT.createPlan || "创建计划"}</button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, padding: "12px 16px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}>
              <button onClick={() => changeWeek(-1)} style={navBtn}>‹ {coachT.lastWeek || "上一周"}</button>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{weekStart.toISOString().split("T")[0].substring(5)} — {weekEnd.toISOString().split("T")[0].substring(5)}</span>
              <button onClick={() => changeWeek(1)} style={navBtn}>{coachT.nextWeek || "下一周"} ›</button>
            </div>

            {weekDays.map((day, idx) => (
              <div key={day.date} style={{ marginBottom: 12, padding: "16px 18px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, animation: `fadeUp 0.3s ease ${idx * 0.04}s both` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{day.dayName}</span>
                    <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{day.date}</span>
                  </div>
                  {day.isToday && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "var(--accent-dim)", color: "var(--accent)", fontWeight: 600 }}>{coachT.todayTag || "今天"}</span>}
                </div>
                <div style={{ marginTop: 10 }}>
                  {day.plans.length > 0 ? day.plans.map((plan) => (
                    <div key={plan.id} style={{ marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
                        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{plan.title}</span>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginLeft: 14, marginTop: 4 }}>
                        <button onClick={() => openEditPlan(plan)} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 11, cursor: "pointer" }}>编辑</button>
                        <button onClick={() => handleDeletePlan(plan.id)} style={{ background: "none", border: "none", color: "var(--red)", fontSize: 11, cursor: "pointer" }}>删除</button>
                      </div>
                    </div>
                  )) : <div style={{ fontSize: 13, color: "var(--text-dim)" }}>☀️ {coachT.noPlan || "休息日"}</div>}
                </div>
                <button onClick={() => openCreatePlan(day.date)} style={addBtn}>+ {coachT.addPlan || "添加"}</button>
              </div>
            ))}
          </>
        )}

        {/* ===== 记录 ===== */}
        {activeTab === "session" && (
          <div style={{ paddingTop: 16, paddingBottom: 110 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 24, letterSpacing: '-0.02em' }}>{coachT.trainingSession || "训练课"}</h1>

            {/* 今日统计 */}
            <div className="rec-stats">
                <div className="rec-stat-pill">
                    <div className="rec-stat-pill-num" style={{ color: 'var(--accent)' }}>{records?.filter(r => r.session_date === today).length || 0}</div>
                    <div className="rec-stat-pill-label">{coachT.todayRecords || "今日记录"}</div>
                </div>
                <div className="rec-stat-pill">
                    <div className="rec-stat-pill-num" style={{ color: 'var(--green)' }}>{records?.length || 0}</div>
                    <div className="rec-stat-pill-label">{coachT.weekRecords || "本周记录"}</div>
                </div>
                <div className="rec-stat-pill">
                    <div className="rec-stat-pill-num" style={{ color: 'var(--blue)' }}>{records?.length || 0}</div>
                    <div className="rec-stat-pill-label">{coachT.monthRecords || "本月记录"}</div>
                </div>
            </div>

            {/* 时间轴式录入 */}
            <div className="rec-timeline">
                <div className="rec-step">
                    <div className="rec-step-dot filled"><div className="rec-step-dot-inner"></div></div>
                    <div className="rec-step-card">
                        <div className="rec-step-label"><span className="rec-step-num">1</span>{coachT.trainingDate || "训练日期"}</div>
                        <input type="date" className="rec-input" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
                    </div>
                </div>
                <div className="rec-step">
                    <div className="rec-step-dot empty"><div className="rec-step-dot-inner"></div></div>
                    <div className="rec-step-card">
                        <div className="rec-step-label"><span className="rec-step-num">2</span>{coachT.trainingType || "训练类型"}</div>
                        <select className="rec-input" value={sessionType} onChange={(e) => setSessionType(e.target.value)}>
                            <option value="">{coachT.selectType || "选择训练类型"}</option>
                            {SESSION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
                <div className="rec-step">
                    <div className="rec-step-dot empty"><div className="rec-step-dot-inner"></div></div>
                    <div className="rec-step-card">
                        <div className="rec-step-label"><span className="rec-step-num">3</span>{coachT.step3 || "训练课内容"}</div>
                        <div style={{ marginBottom: 12 }}>
                            <button className={`rec-voice-btn${isRecording ? ' recording' : ''}`} onClick={toggleRecording}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="9" y="1" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/>
                                    <line x1="12" y1="17" x2="12" y2="21"/><line x1="8" y1="21" x2="16" y2="21"/>
                                </svg>
                                <span>{isRecording ? (coachT.recordingStop || "正在录音… 点击结束") : (coachT.voiceRecord || "语音录入训练课")}</span>
                            </button>
                        </div>
                        <textarea className="rec-input" value={rawText} onChange={(e) => setRawText(e.target.value)} placeholder={coachT.voiceRecordHint || "口述今天的训练课情况，如：今天400米间歇10组，张明远最好58秒..."} />
                    </div>
                </div>
            </div>

            <button className="rec-submit" onClick={handleSubmitRecord} disabled={recordLoading || !rawText.trim()}>
              {recordLoading ? (coachT.aiParsing || "AI 解析中...") : (coachT.submit || "确认提交")}
            </button>

            {/* {coachT.recentRecords || "最近记录"}列表 */}
            <div className="rec-history-title">
                {coachT.recentRecords || "最近记录"} <span className="rec-history-count">{records?.length || 0} {coachT.recordsCount?.replace("{count}", "") || "条"}</span>
            </div>

            {records?.slice(0, 3).map((r, i) => (
                <div className="rec-history-card" key={r.id || i} onClick={() => setShowHistory(true)}>
                    <div className="rec-history-side">
                        <div className="rec-history-month">{r.session_date?.substring(5, 7)}</div>
                        <div className="rec-history-day">{r.session_date?.substring(8)}</div>
                    </div>
                    <div className="rec-history-body">
                        <div className="rec-history-type">
                            <span className="rec-history-type-dot"></span>
                            {r.session_type || (coachT.trainingSession || "训练课")}
                        </div>
                        <div className="rec-history-text">{r.parsed_data?.session_summary || r.raw_voice_text?.substring(0, 60) || (coachT.trainingRecords || "训练记录")}</div>
                    </div>
                </div>
            ))}

            <button className="rec-view-all" onClick={() => setShowHistory(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {coachT.viewAllHistory || "查看全部历史记录"}
            </button>
          </div>
        )}

        {/* ===== 通知 ===== */}
        {activeTab === "notify" && (
          <div style={{ paddingTop: 16, paddingBottom: 110 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 0, letterSpacing: '-0.02em' }}>{coachT.notifications || "通知"}</h1>
                <button style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500, cursor: 'pointer', border: 'none', background: 'none', fontFamily: 'inherit' }} onClick={markAllAsRead}>{coachT.markAllRead || "全部已读"}</button>
            </div>

            {/* 通知统计 */}
            <div className="notif-summary">
                <div className="notif-summary-item red">
                    <div className="notif-summary-num" style={{ color: 'var(--red)' }}>{notifications?.filter(n => (n.type === 'risk_alert' || n.type === 'injury_alert') && !n.is_read).length || 0}</div>
                    <div className="notif-summary-label">{coachT.alert || "预警"}</div>
                </div>
                <div className="notif-summary-item amber">
                    <div className="notif-summary-num" style={{ color: 'var(--accent)' }}>{notifications?.filter(n => !n.is_read).length || 0}</div>
                    <div className="notif-summary-label">{coachT.unread || "未读"}</div>
                </div>
                <div className="notif-summary-item blue">
                    <div className="notif-summary-num" style={{ color: 'var(--blue)' }}>{notifications?.filter(n => n.is_read).length || 0}</div>
                    <div className="notif-summary-label">{coachT.read || "已读"}</div>
                </div>
            </div>

            {/* 通知列表，按时间分组 */}
            {(() => {
                const getIconClass = (type) => {
                    if (type === 'risk_alert' || type === 'injury_alert') return 'red';
                    if (type === 'training_feedback') return 'blue';
                    if (type === 'treatment_plan') return 'green';
                    return 'amber';
                };
                const getIcon = (type) => {
                    if (type === 'risk_alert' || type === 'injury_alert') return '⚠️';
                    if (type === 'training_feedback') return '📊';
                    if (type === 'treatment_plan') return '💊';
                    return '🔔';
                };

                const todayItems = [];
                const yesterdayItems = [];
                const now = new Date();
                const todayStr = now.toISOString().split('T')[0];
                const yesterdayDate = new Date(now);
                yesterdayDate.setDate(yesterdayDate.getDate() - 1);
                const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

                (notifications || []).forEach(n => {
                    const dateStr = n.created_at ? new Date(n.created_at).toISOString().split('T')[0] : todayStr;
                    if (dateStr === todayStr) todayItems.push(n);
                    else if (dateStr === yesterdayStr) yesterdayItems.push(n);
                });

                return (
                    <>
                        <div className="notif-group-label">{coachT.today || "今天"}</div>
                        {todayItems.length > 0 ? todayItems.map((n, i) => (
                            <div className={`notif-card${n.is_read ? '' : ' unread'}`} key={n.id || i} onClick={() => handleNotifClick(n)}>
                                <div className={`notif-card-icon ${getIconClass(n.type)}`}>{getIcon(n.type)}</div>
                                <div className="notif-card-body">
                                    <div className="notif-card-title">{getNotifTitle(n)}</div>
                                    <div className="notif-card-desc">{getNotifContent(n)}</div>
                                    <div className="notif-card-time"><span className="notif-card-time-dot"></span>{formatTime(n.created_at)}</div>
                                </div>
                            </div>
                        )) : <div style={{ fontSize: 13, color: 'var(--text-dim)', padding: '12px 0' }}>{coachT.noTodayNotif || "暂无今日通知"}</div>}

                        <div className="notif-group-label">{coachT.yesterday || "昨天"}</div>
                        {yesterdayItems.length > 0 ? yesterdayItems.map((n, i) => (
                            <div className={`notif-card${n.is_read ? '' : ' unread'}`} key={n.id || i} onClick={() => handleNotifClick(n)}>
                                <div className={`notif-card-icon ${getIconClass(n.type)}`}>{getIcon(n.type)}</div>
                                <div className="notif-card-body">
                                    <div className="notif-card-title">{getNotifTitle(n)}</div>
                                    <div className="notif-card-desc">{getNotifContent(n)}</div>
                                    <div className="notif-card-time"><span className="notif-card-time-dot"></span>{coachT.yesterday || "昨天"}</div>
                                </div>
                            </div>
                        )) : <div style={{ fontSize: 13, color: 'var(--text-dim)', padding: '12px 0' }}>{coachT.noYesterdayNotif || "暂无昨日通知"}</div>}
                    </>
                );
            })()}

            {/* 快捷操作 */}
            <div className="notif-actions">
                <button className="notif-action-btn" onClick={markAllAsRead}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {coachT.markAllReadBtn || "全部标记已读"}
                </button>
                <button className="notif-action-btn" onClick={() => setActiveTab('home')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                    {coachT.backToWorkbench || "返回工作台"}
                </button>
            </div>
          </div>
        )}
      </div>

      {/* 运动员详情 BottomSheet */}
      {selectedAthlete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={(e) => { if (e.target === e.currentTarget) { setSelectedAthlete(null); setAthleteSessions([]); } }}>
          <div style={{ background: "var(--surface)", borderRadius: "20px 20px 0 0", maxWidth: 430, width: "100%", maxHeight: "85vh", overflowY: "scroll", overflowX: "hidden", padding: "0 24px 20px", boxSizing: "border-box", WebkitOverflowScrolling: "touch" }}>
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px", cursor: "grab" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--card)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>{selectedAthlete.name?.[0]}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{selectedAthlete.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>{coachT.trainingRecords || "训练记录"}</div>
              </div>
            </div>
            {sessionLoading ? (
              <div style={{ textAlign: "center", padding: 40, color: "var(--text-dim)" }}>{coachT.loading || "加载中..."}</div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  {athleteSessions.map((s) => {
                    const sc = STATUS_COLORS[s.status_level] || STATUS_COLORS["正常"];
                    return (
                      <div key={s.id} onClick={() => { setSelectedAthlete(null); setAthleteSessions([]); fetchReportDetail(s.id); }} style={{
                        display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                        background: "var(--card)", border: `1px solid ${s.risk_flag ? "var(--red)" : "var(--border)"}`,
                        borderRadius: 10, cursor: "pointer",
                      }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: s.overall_score ? (s.risk_flag ? "var(--red)" : s.status_level === "关注" ? "var(--amber)" : "var(--green)") : "var(--text-dim)", minWidth: 36, textAlign: "center" }}>{s.overall_score || "—"}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{s.session_name || "训练"}</div>
                          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{s.session_date}</div>
                        </div>
                        {s.status_level && <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 10, background: sc.bg, color: sc.text }}>{s.status_level}</span>}
                      </div>
                    );
                  })}
                </div>
                {athleteNotes.length > 0 && (
                  <div style={{ background: "var(--card)", borderRadius: 12, padding: 14, border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>📝 助教{coachT.notes || "备注"}</div>
                    {athleteNotes.map((n) => (
                      <div key={n.id} style={{ padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                          <span style={{ fontSize: 11, fontWeight: 500, color: "var(--accent)" }}>{n.author_name}</span>
                          <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{n.note_date || n.created_at?.split("T")[0]}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{n.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* 报告详情 BottomSheet */}
      {selectedReport && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={(e) => { if (e.target === e.currentTarget) setSelectedReport(null); }}>
          <div style={{ background: "var(--surface)", borderRadius: "20px 20px 0 0", maxWidth: 430, width: "100%", maxHeight: "90vh", overflow: "auto", padding: "0 24px 20px" }}>
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px", cursor: "grab" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{selectedReport.session?.athlete_name}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{selectedReport.session?.session_date}</div>
              </div>
              {selectedReport.report && (
                <TranslateButton
                  report={selectedReport.report}
                  onTranslated={(translated, lang) => {
                    if (translated) {
                      setDisplayReport(translated);
                      setReportLang(lang);
                    } else {
                      setDisplayReport(null);
                      setReportLang("zh");
                    }
                  }}
                />
              )}
            </div>
            {selectedReport.session?.has_fit_data && <FitDataCard fitData={selectedReport.session.fit_data_json} />}
            <div style={{ background: "var(--card)", borderRadius: 12, padding: 14, border: "1px solid var(--border)", marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 6 }}>{coachT.athleteFeedback || "运动员反馈"}</div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: "var(--text-secondary)" }}>{selectedReport.session?.transcript}</div>
            </div>
            {selectedReport.report ? (
              <ResultView result={displayReport || selectedReport.report} reportLang={reportLang} />
            ) : (
              <div style={{ textAlign: "center", padding: 32, color: "var(--text-dim)" }}>{coachT.noAIReport || "暂无AI报告"}</div>
            )}
          </div>
        </div>
      )}

      {/* 计划编辑弹窗 */}
      {showPlanModal && (
        <PlanModal
          form={form}
          updateForm={updateForm}
          updEx={updEx}
          delEx={delEx}
          addEx={addEx}
          athletes={athletes}
          toggleAth={toggleAth}
          editingPlan={editingPlan}
          planSaving={planSaving}
          handleSavePlan={handleSavePlan}
          onClose={() => setShowPlanModal(false)}
          coachT={coachT}
          sessionTypes={SESSION_TYPES}
        />
      )}

      {/* 绑定管理 Sheet */}
      {showBindingSheet && bindingAthlete && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200 }} onClick={() => setShowBindingSheet(false)} />
          <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", maxWidth: 430, width: "100%", background: "var(--surface)", borderRadius: "20px 20px 0 0", zIndex: 201, padding: "0 24px 20px", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px", cursor: "grab" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)" }} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 20 }}>
              {coachT.bindingManage || "绑定管理"} · {bindingAthlete.display_name || bindingAthlete.name}
            </div>

            {/* 主教练（只读） */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>{coachT.headCoach || "主教练"}</div>
              <div style={{ padding: "10px 14px", background: "var(--card)", borderRadius: 10, border: "1px solid var(--border)", fontSize: 13, color: "var(--text)" }}>
                {user.display_name}（{coachT.currentLogin || "当前登录"}）
              </div>
            </div>

            {/* 助教选择 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>{coachT.bindAssistant || "绑定助教"}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <button onClick={() => setBindingData(prev => ({ ...prev, assistant_id: null }))} style={{
                  padding: "6px 12px", borderRadius: 14, fontSize: 12, cursor: "pointer",
                  border: !bindingData?.assistant_id ? "1px solid var(--accent)" : "1px solid var(--border)",
                  background: !bindingData?.assistant_id ? "var(--accent-dim)" : "transparent",
                  color: !bindingData?.assistant_id ? "var(--accent)" : "var(--text-dim)",
                  fontFamily: "inherit",
                }}>无</button>
                {allAssistants.map(a => (
                  <button key={a.id} onClick={() => setBindingData(prev => ({ ...prev, assistant_id: a.id }))} style={{
                    padding: "6px 12px", borderRadius: 14, fontSize: 12, cursor: "pointer",
                    border: bindingData?.assistant_id === a.id ? "1px solid var(--accent)" : "1px solid var(--border)",
                    background: bindingData?.assistant_id === a.id ? "var(--accent-dim)" : "transparent",
                    color: bindingData?.assistant_id === a.id ? "var(--accent)" : "var(--text-dim)",
                    fontFamily: "inherit",
                  }}>{a.display_name}</button>
                ))}
              </div>
            </div>

            {/* 队医选择 */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>{coachT.bindDoctor || "绑定队医"}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <button onClick={() => setBindingData(prev => ({ ...prev, doctor_id: null }))} style={{
                  padding: "6px 12px", borderRadius: 14, fontSize: 12, cursor: "pointer",
                  border: !bindingData?.doctor_id ? "1px solid var(--accent)" : "1px solid var(--border)",
                  background: !bindingData?.doctor_id ? "var(--accent-dim)" : "transparent",
                  color: !bindingData?.doctor_id ? "var(--accent)" : "var(--text-dim)",
                  fontFamily: "inherit",
                }}>无</button>
                {allDoctors.map(d => (
                  <button key={d.id} onClick={() => setBindingData(prev => ({ ...prev, doctor_id: d.id }))} style={{
                    padding: "6px 12px", borderRadius: 14, fontSize: 12, cursor: "pointer",
                    border: bindingData?.doctor_id === d.id ? "1px solid var(--accent)" : "1px solid var(--border)",
                    background: bindingData?.doctor_id === d.id ? "var(--accent-dim)" : "transparent",
                    color: bindingData?.doctor_id === d.id ? "var(--accent)" : "var(--text-dim)",
                    fontFamily: "inherit",
                  }}>{d.display_name}</button>
                ))}
              </div>
            </div>

            {/* 操作按钮 */}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={saveBinding} disabled={bindingSaving} style={{
                flex: 1, padding: "12px 0", borderRadius: 10, border: "none",
                background: bindingSaving ? "var(--text-dim)" : "linear-gradient(135deg, var(--accent), #C08830)",
                color: "var(--bg)", fontSize: 13, fontWeight: 600, cursor: bindingSaving ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}>{bindingSaving ? (coachT.saving || "保存中...") : (coachT.saveBinding || "保存绑定")}</button>
              <button onClick={() => setShowBindingSheet(false)} style={{
                flex: 1, padding: "12px 0", borderRadius: 10,
                border: "1px solid var(--border)", background: "var(--card)",
                color: "var(--text-secondary)", fontSize: 13, cursor: "pointer",
                fontFamily: "inherit",
              }}>{coachT.cancel || "取消"}</button>
            </div>
          </div>
        </>
      )}

      <ProfileSheet isOpen={showProfile} onClose={() => setShowProfile(false)} />
      <CoachNav active={activeTab} onNavigate={setActiveTab} badgeCount={unreadCount} />
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

// ========== 辅助组件和样式 ==========

// ========== 辅助组件和样式 ==========
function StatCard({ label, value, color }) {
  return (
    <div style={{ flex: 1, padding: "16px 12px", borderRadius: 10, background: "var(--card)", border: "1px solid var(--border)", textAlign: "center" }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: `var(--${color})`, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function FormField({ label, children }) {
  return <div style={{ marginBottom: 16 }}><label style={labelStyle}>{label}</label>{children}</div>;
}

// 计划编辑弹窗组件
function PlanModal({ form, updateForm, updEx, delEx, addEx, athletes, toggleAth, editingPlan, planSaving, handleSavePlan, onClose, coachT, sessionTypes }) {
  coachT = coachT || {};
  const SESSION_TYPES = sessionTypes || ["间歇训练", "节奏跑", "轻松跑", "长距离跑", "恢复跑", "力量训练", "比赛"];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "var(--surface)", borderRadius: "20px 20px 0 0", maxWidth: 430, width: "100%", maxHeight: "85vh", overflow: "auto", padding: "0 24px 20px" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>{editingPlan ? (coachT.editPlan || "编辑计划") : (coachT.createPlanTitle || "创建计划")}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>
        <FormField label={coachT.trainingDate || "训练日期"}><input type="date" value={form.plan_date} onChange={(e) => updateForm("plan_date", e.target.value)} style={inputStyle} /></FormField>
        <FormField label={coachT.trainingName || "训练名称"}><input value={form.title} onChange={(e) => updateForm("title", e.target.value)} placeholder={coachT.trainingNameHint || "如：速度耐力课"} style={inputStyle} /></FormField>
        <FormField label={coachT.trainingType || "训练类型"}>
          <select value={form.plan_type} onChange={(e) => updateForm("plan_type", e.target.value)} style={inputStyle}>
            {(SESSION_TYPES || ["轻松跑","节奏跑","间歇训练","长距离跑","恢复跑","力量训练","休息日"]).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormField>
        <FormField label={coachT.intensityZone || "强度区间"}>
          <select value={form.training_zone} onChange={(e) => updateForm("training_zone", e.target.value)} style={inputStyle}>
            {["E","M","T","I","R"].map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </FormField>
        <FormField label={coachT.targetPace || "目标配速"}><input value={form.target_pace} onChange={(e) => updateForm("target_pace", e.target.value)} placeholder={coachT.targetPaceHint || "如：4:10-4:20/km"} style={inputStyle} /></FormField>
        <FormField label={coachT.targetHR || "目标心率"}><input value={form.target_hr} onChange={(e) => updateForm("target_hr", e.target.value)} placeholder={coachT.targetHRHint || "如：170-180bpm"} style={inputStyle} /></FormField>
        <FormField label={coachT.estDistance || "预估距离"}><input value={form.estimated_distance} onChange={(e) => updateForm("estimated_distance", e.target.value)} placeholder={coachT.estDistanceHint || "如：8km"} style={inputStyle} /></FormField>
        <FormField label={coachT.estDuration || "预估时长"}><input value={form.estimated_duration} onChange={(e) => updateForm("estimated_duration", e.target.value)} placeholder={coachT.estDurationHint || "如：50分钟"} style={inputStyle} /></FormField>
        <FormField label={coachT.athletes || "适用运动员"}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <button onClick={() => updateForm("target_athletes", [])} style={tagBtn(form.target_athletes.length === 0)}>{coachT.allTeam || "全队"}</button>
            {athletes.map((a) => <button key={a.id} onClick={() => toggleAth(a.id)} style={tagBtn(form.target_athletes.includes(a.id))}>{a.display_name}</button>)}
          </div>
        </FormField>
        <FormField label={coachT.warmup || "热身"}><input value={form.warmup} onChange={(e) => updateForm("warmup", e.target.value)} placeholder={coachT.warmupHint || "如：慢跑10分钟"} style={inputStyle} /></FormField>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>{coachT.mainTraining || "主训练"}</label>
          {form.main.map((ex, i) => (
            <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <input value={ex.exercise} onChange={(e) => updEx(i, "exercise", e.target.value)} placeholder={`${coachT.setNumber?.replace("{num}", i+1) || "第" + (i+1) + "组"}`} style={{ ...inputStyle, flex: 1 }} />
              <input value={ex.pace} onChange={(e) => updEx(i, "pace", e.target.value)} placeholder={coachT.pace || "配速"} style={{ ...inputStyle, width: 80 }} />
              <input value={ex.rest} onChange={(e) => updEx(i, "rest", e.target.value)} placeholder={coachT.rest || "休息"} style={{ ...inputStyle, width: 70 }} />
              {form.main.length > 1 && <button onClick={() => delEx(i)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer" }}>✕</button>}
            </div>
          ))}
          <button onClick={addEx} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12, cursor: "pointer" }}>+ {coachT.addSet || "添加一组"}</button>
        </div>
        <FormField label={coachT.cooldown || "放松"}><input value={form.cooldown} onChange={(e) => updateForm("cooldown", e.target.value)} placeholder={coachT.warmupHint || "如：慢跑10分钟"} style={inputStyle} /></FormField>
        <FormField label={coachT.notes || "备注"}><textarea value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} rows={2} style={{ ...inputStyle, minHeight: 50, resize: "vertical", fontFamily: "inherit" }} /></FormField>
        <button onClick={handleSavePlan} disabled={planSaving} style={{ ...primaryBtn, marginTop: 20, cursor: planSaving ? "not-allowed" : "pointer", background: planSaving ? "var(--text-dim)" : primaryBtn.background }}>
          {planSaving ? (coachT.saving || "保存中...") : (editingPlan ? (coachT.updatePlan || "更新计划") : (coachT.publishPlan || "发布计划"))}
        </button>
      </div>
    </div>
  );
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  return date;
}

const labelStyle = { fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6, display: "block" };
const inputStyle = { width: "100%", padding: "12px 14px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" };
const backBtn = { background: "none", border: "none", color: "var(--accent)", fontSize: 12, cursor: "pointer", marginBottom: 16 };
const primaryBtn = { width: "100%", padding: 14, borderRadius: 10, border: "none", background: "linear-gradient(135deg, var(--accent), #C08830)", color: "var(--bg)", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 20 };
const quickBtn = { flex: 1, padding: "16px 14px", borderRadius: 10, background: "var(--card)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, fontFamily: "inherit" };
const navBtn = { background: "none", border: "none", color: "var(--text-secondary)", fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer", padding: "4px 8px" };
const addBtn = { background: "none", border: "1px dashed var(--border-light)", color: "var(--text-dim)", fontFamily: "inherit", fontSize: 12, padding: "6px 14px", borderRadius: 8, cursor: "pointer", marginTop: 8, width: "100%" };
const tagBtn = (active) => ({ padding: "4px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", border: active ? "1px solid var(--accent)" : "1px solid var(--border)", background: active ? "var(--accent-dim)" : "transparent", color: active ? "var(--accent)" : "var(--text-secondary)", fontFamily: "inherit" });
