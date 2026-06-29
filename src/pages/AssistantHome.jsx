/**
 * 助教工作台 - 主组件
 * 按照设计稿重构：三个 Tab 页面 + Sheet 弹窗机制
 */
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useI18n } from "../locales/index.jsx";
import { STATUS_COLORS } from "../styles/sharedStyles.js";
import { sessionService, authService, assistantService, notificationService, translateService } from "../services";
import { getTranslation } from "../utils/translateCache.js";
import LoadingState from "../components/LoadingState.jsx";
import LanguageSwitch from "../components/LanguageSwitch.jsx";
import AssistantProfileSheet from "./AssistantProfileSheet.jsx";
import AthleteDetailSheet from "./AthleteDetailSheet.jsx";
import ReportDetailSheet from "./ReportDetailSheet.jsx";
import '../styles/assistant-pages.css';

export default function AssistantHome() {
  const { user, logout } = useAuth();
  const { lang, t } = useI18n();
  const assistantT = t.assistant || {};
  const [activeTab, setActiveTab] = useState("home");

  // Sheet 状态
  const [showProfile, setShowProfile] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  // 数据状态
  const [athletes, setAthletes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // 运动员详情数据
  const [athleteSessions, setAthleteSessions] = useState([]);
  const [athleteNotes, setAthleteNotes] = useState([]);
  const [sessionLoading, setSessionLoading] = useState(false);

  // 备注状态
  const [noteContent, setNoteContent] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState(false);

  // 筛选状态
  const [filterAthlete, setFilterAthlete] = useState("all");

  // 翻译后的通知内容缓存
  const [translatedNotifs, setTranslatedNotifs] = useState({});

  useEffect(() => { fetchData(); }, []);

  // 翻译通知内容
  useEffect(() => {
    if (lang === "zh" || notifications.length === 0) {
      setTranslatedNotifs({});
      return;
    }

    const translateAll = async () => {
      const translations = {};
      for (const n of notifications) {
        if (n.title) {
          translations[`${n.id}_title`] = await getTranslation(n.title, lang, translateService.translateText);
        }
        if (n.content) {
          translations[`${n.id}_content`] = await getTranslation(n.content, lang, translateService.translateText);
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewData, athletesData, notifData, sessData] = await Promise.all([
        sessionService.getTeamOverview(),
        authService.getAthletes(),
        notificationService.getNotifications({ limit: 20 }),
        sessionService.getSessions({ limit: 20 }),
      ]);

      setOverview(overviewData);
      setAthletes(athletesData.athletes || []);
      setNotifications(notifData.notifications || []);
      setSessions(sessData.sessions || []);
    } catch (err) { console.error("获取数据失败:", err); } finally { setLoading(false); }
  };

  const fetchAthleteDetail = async (athleteId, athleteName) => {
    setSelectedAthlete({ id: athleteId, name: athleteName });
    setSelectedReport(null);
    setSessionLoading(true);
    try {
      const [sessData, notesData] = await Promise.all([
        sessionService.getSessions({ athlete_id: athleteId, limit: 10 }),
        assistantService.getNotes({ athlete_id: athleteId, limit: 10 }),
      ]);
      setAthleteSessions(sessData.sessions || []);
      setAthleteNotes(notesData.notes || []);
    } catch {} finally { setSessionLoading(false); }
  };

  const fetchReportDetail = async (sessionId) => {
    try {
      const d = await sessionService.getSessionById(sessionId);
      setSelectedReport(d);
    } catch (err) { alert((assistantT.getReportFailed || "获取报告失败: ") + err.message); }
  };

  const submitNote = async (content) => {
    if (!content.trim() || !selectedAthlete) return;
    setNoteSaving(true);
    try {
      await assistantService.createNote({
        athlete_id: selectedAthlete.id,
        content: content.trim(),
        note_type: "observation",
      });
      setNoteContent("");
      const notesData = await assistantService.getNotes({ athlete_id: selectedAthlete.id, limit: 10 });
      setAthleteNotes(notesData.notes || []);
    } catch (err) { alert((assistantT.noteFailed || "提交失败: ") + err.message); }
    finally { setNoteSaving(false); }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {}
  };

  // 统计数据
  const stats = overview?.stats || {};
  const athletesList = overview?.athletes || [];
  const riskAthletes = athletesList.filter((a) => a.risk_flag);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // 时间问候
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return assistantT.greetingMorning || "早上好";
    if (h < 18) return assistantT.greetingAfternoon || "下午好";
    return assistantT.greetingEvening || "晚上好";
  };

  // 格式化时间
  const formatTime = (d) => {
    if (!d) return "";
    const s = Math.floor((new Date() - new Date(d)) / 1000);
    if (s < 60) return t.time?.justNow || "刚刚";
    if (s < 3600) return (t.time?.minutesAgo || "{n}分钟前").replace("{n}", Math.floor(s / 60));
    if (s < 86400) return (t.time?.hoursAgo || "{n}小时前").replace("{n}", Math.floor(s / 3600));
    return (t.time?.daysAgo || "{n}天前").replace("{n}", Math.floor(s / 86400));
  };

  // 获取时间分组
  const getTimeGroup = (d) => {
    if (!d) return assistantT.earlier || "更早";
    const now = new Date();
    const date = new Date(d);
    const diffDays = Math.floor((now - date) / 86400000);
    if (diffDays < 1) return assistantT.today || "今天";
    if (diffDays < 2) return assistantT.yesterday || "昨天";
    return assistantT.earlier || "更早";
  };

  // 通知图标配置
  const NOTIF_CONFIG = {
    risk_alert: { icon: "⚠️", color: "red" },
    injury_alert: { icon: "⚠️", color: "red" },
    training_feedback: { icon: "📊", color: "green" },
    treatment_plan: { icon: "💊", color: "amber" },
    plan_approval: { icon: "📋", color: "blue" },
    general: { icon: "📢", color: "blue" },
  };

  // Header 标题映射
  const compactTitles = {
    "home": "",
    "records": assistantT.trainingRecords || "训练记录",
    "notify": assistantT.notifications || "通知",
  };

  // 切换页面
  const switchTab = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 打开运动员详情
  const openAthleteDetail = (athleteId, athleteName) => {
    fetchAthleteDetail(athleteId, athleteName);
  };

  // 从运动员详情打开报告
  const openReportFromAthlete = (sessionId) => {
    setSelectedReport(null);
    setTimeout(() => fetchReportDetail(sessionId), 350);
  };

  // 从报告返回运动员详情
  const backToAthlete = () => {
    setSelectedReport(null);
  };

  // 语音切换
  const handleVoiceToggle = () => {
    if (!voiceRecording) {
      setVoiceRecording(true);
      setTimeout(() => setVoiceRecording(false), 3000);
    }
  };

  // 筛选记录
  const filteredSessions = filterAthlete === "all"
    ? sessions
    : sessions.filter((s) => s.athlete_id === filterAthlete);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
      {/* 噪点纹理覆盖层 */}
      <div className="grain" />

      <div className="app-shell">
        {/* Header - 完整模式 */}
        {activeTab === "home" && (
          <div className="assistant-header">
            <div>
              <div className="assistant-greeting-small">{getGreeting()}，</div>
              <div className="assistant-greeting-name">{user.display_name}</div>
              <div className="assistant-greeting-sub">{assistantT.role || "助理教练"} · {assistantT.restoreWeek || "恢复周"}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <LanguageSwitch />
              <div className="assistant-avatar-ring" onClick={() => setShowProfile(true)} title={assistantT.myProfile || "我的"}>
                <div className="assistant-avatar">{user.display_name?.[0]}</div>
              </div>
            </div>
          </div>
        )}

        {/* Header - 紧凑模式 */}
        {activeTab !== "home" && (
          <div className="assistant-header-compact">
            <span className="page-title-inline">{compactTitles[activeTab]}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <LanguageSwitch />
              <div className="assistant-avatar-ring" onClick={() => setShowProfile(true)} title={assistantT.myProfile || "我的"}>
                <div className="assistant-avatar">{user.display_name?.[0]}</div>
              </div>
            </div>
          </div>
        )}

        {/* ===== 工作台 Tab ===== */}
        {activeTab === "home" && (
          <div className="assistant-page active">
            {/* 统计行 */}
            <div className="stat-row">
              <div className="stat-card">
                <div className="stat-value accent">{stats.total || 0}<span className="stat-sub"> {assistantT.peopleUnit || "人"}</span></div>
                <div className="stat-label">{assistantT.athletes || "运动员"}</div>
              </div>
              <div className="stat-card">
                <div className="stat-value accent">{stats.avg_score || "--"}</div>
                <div className="stat-label">{assistantT.teamAvg || "团队均分"}</div>
              </div>
              <div className="stat-card">
                <div className="stat-value red">{stats.risk_count || 0}<span className="stat-sub"> {assistantT.peopleUnit || "人"}</span></div>
                <div className="stat-label">{assistantT.alertCount || "预警人数"}</div>
              </div>
            </div>

            {/* 预警运动员 */}
            {riskAthletes.length > 0 && (
              <div className="alert-section">
                <div className="section-title">{assistantT.needAttention || "需要关注的运动员"}</div>
                {riskAthletes.map((a) => (
                  <div key={a.athlete_id} className="alert-card" onClick={() => openAthleteDetail(a.athlete_id, a.display_name)}>
                    <div className="alert-icon">⚠️</div>
                    <div className="alert-content">
                      <div className="alert-title">{a.display_name}</div>
                      <div className="alert-desc">{a.risk_reason || "膝盖和跟腱疼痛，可能因负荷过高导致受伤风险"}</div>
                      <span className="alert-badge">{assistantT.alert || "预警"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 运动员列表 */}
            <div style={{ marginBottom: 28 }}>
              <div className="section-title">
                {assistantT.athleteStatus || "运动员状态"}
                <button className="section-link" onClick={() => switchTab("records")}>{assistantT.viewAll || "查看全部"}</button>
              </div>
              <div className="athlete-list">
                {athletesList.map((a) => {
                  const sc = STATUS_COLORS[a.status_level] || STATUS_COLORS["正常"];
                  return (
                    <div
                      key={a.athlete_id}
                      className={`athlete-card${a.risk_flag ? " danger" : a.status_level === "关注" ? " warn" : ""}`}
                      onClick={() => openAthleteDetail(a.athlete_id, a.display_name)}
                    >
                      <div className="athlete-avatar">{a.display_name?.[0]}</div>
                      <div className="athlete-info">
                        <div className="athlete-name">{a.display_name}</div>
                        <div className="athlete-meta">{a.session_date ? `${assistantT.lastTraining?.replace("{date}", a.session_date) || `最近训练: ${a.session_date}`}` : (assistantT.noRecords || "暂无记录")}</div>
                      </div>
                      <div className="athlete-right">
                        {a.overall_score ? (
                          <span className="athlete-score" style={{ color: a.risk_flag ? "var(--red)" : a.status_level === "关注" ? "var(--amber)" : "var(--green)" }}>
                            {a.overall_score}
                          </span>
                        ) : (
                          <span className="athlete-score" style={{ color: "var(--text-dim)" }}>—</span>
                        )}
                        {a.status_level && (
                          <span className={`athlete-status ${a.risk_flag ? "danger" : a.status_level === "关注" ? "warn" : "good"}`}>
                            {a.status_level}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="quick-actions">
              <button className="quick-btn" onClick={() => switchTab("records")}>
                <div className="quick-btn-icon gold">📝</div>
                <span className="quick-btn-label">{assistantT.trainingRecords || "训练记录"}</span>
              </button>
              <button className="quick-btn" onClick={() => switchTab("notify")}>
                <div className="quick-btn-icon blue">🔔</div>
                <span className="quick-btn-label">{assistantT.viewNotifications || "查看通知"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ===== 记录 Tab ===== */}
        {activeTab === "records" && (
          <div className="assistant-page active">
            {/* 筛选栏 */}
            <div className="filter-pills">
              <button
                className={`filter-pill${filterAthlete === "all" ? " active" : ""}`}
                onClick={() => setFilterAthlete("all")}
              >
                {assistantT.all || "全部"}
              </button>
              {athletes.map((a) => (
                <button
                  key={a.id}
                  className={`filter-pill${filterAthlete === a.id ? " active" : ""}`}
                  onClick={() => setFilterAthlete(a.id)}
                >
                  {a.display_name}
                </button>
              ))}
            </div>

            {/* 训练记录列表 */}
            {filteredSessions.length > 0 ? (
              filteredSessions.map((s) => {
                const sc = STATUS_COLORS[s.status_level] || STATUS_COLORS["正常"];
                return (
                  <div
                    key={s.id}
                    className={`feed-card${s.risk_flag ? " danger-card" : s.status_level === "关注" ? " warn-card" : ""}`}
                    data-athlete={s.athlete_id}
                    onClick={() => fetchReportDetail(s.id)}
                  >
                    <div className="feed-avatar">{s.athlete_name?.[0] || "?"}</div>
                    <div className="feed-body">
                      <div className="feed-header">
                        <span className="feed-name">{s.athlete_name || (assistantT.unknown || "未知")}</span>
                        {s.overall_score && (
                          <span className="feed-score" style={{ color: s.risk_flag ? "var(--red)" : s.status_level === "关注" ? "var(--amber)" : "var(--green)" }}>
                            {s.overall_score}
                          </span>
                        )}
                      </div>
                      <div className="feed-meta">
                        <span>{s.session_date || (assistantT.noRecords || "暂无记录")}</span>
                        <span className="feed-meta-dot"></span>
                        <span>{s.session_name || (assistantT.trainingSession || "训练")}</span>
                      </div>
                      <div className="feed-text">{s.risk_reason || s.summary || (assistantT.noFeedback || "暂无反馈摘要")}</div>
                      <div className="feed-tags">
                        {s.status_level && (
                          <span className={`feed-tag ${s.risk_flag ? "danger" : s.status_level === "关注" ? "warn" : "good"}`}>
                            {t.statusLevel?.[s.status_level] || s.status_level}
                          </span>
                        )}
                        {s.coach_viewed && <span className="feed-tag info">{assistantT.coachViewed || "教练已查看"}</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: "center", padding: 40, color: "var(--text-dim)" }}>{assistantT.noSessionRecords || "暂无训练记录"}</div>
            )}
          </div>
        )}

        {/* ===== 通知 Tab ===== */}
        {activeTab === "notify" && (
          <div className="assistant-page active">
            {/* 右上角全部已读 */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              {unreadCount > 0 && (
                <button className="section-link" onClick={markAllAsRead}>{assistantT.markAllRead || "全部已读"}</button>
              )}
            </div>

            {/* 通知统计 */}
            <div className="notif-summary">
              <div className="notif-summary-item red">
                <div className="notif-summary-num" style={{ color: "var(--red)" }}>
                  {notifications.filter((n) => (n.type === "risk_alert" || n.type === "injury_alert") && !n.is_read).length}
                </div>
                <div className="notif-summary-label">{assistantT.alert || "预警"}</div>
              </div>
              <div className="notif-summary-item amber">
                <div className="notif-summary-num" style={{ color: "var(--accent)" }}>{unreadCount}</div>
                <div className="notif-summary-label">{assistantT.unread || "未读"}</div>
              </div>
              <div className="notif-summary-item blue">
                <div className="notif-summary-num" style={{ color: "var(--blue)" }}>
                  {notifications.filter((n) => n.is_read).length}
                </div>
                <div className="notif-summary-label">{assistantT.read || "已读"}</div>
              </div>
            </div>

            {/* 通知列表 */}
            {(() => {
              const grouped = {};
              notifications.forEach((n) => {
                const group = getTimeGroup(n.created_at);
                if (!grouped[group]) grouped[group] = [];
                grouped[group].push(n);
              });
              const groupOrder = [assistantT.today || "今天", assistantT.yesterday || "昨天", assistantT.earlier || "更早"];

              return groupOrder.map((group) => {
                const items = grouped[group];
                if (!items?.length) return null;
                return (
                  <div key={group}>
                    <div className="notif-group-label">{group}</div>
                    {items.map((n, i) => {
                      const config = NOTIF_CONFIG[n.type] || NOTIF_CONFIG.general;
                      return (
                        <div
                          key={n.id}
                          className={`notif-card${!n.is_read ? " unread" : ""}`}
                          onClick={() => {
                            if (!n.is_read) {
                              notificationService.markAsRead(n.id);
                              setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, is_read: true } : x));
                            }
                          }}
                        >
                          <div className={`notif-card-icon ${config.color}`}>{config.icon}</div>
                          <div className="notif-card-body">
                            <div className="notif-card-title">{getNotifTitle(n)}</div>
                            <div className="notif-card-desc">{getNotifContent(n)}</div>
                            <div className="notif-card-time">
                              <span className="notif-card-time-dot"></span>
                              {formatTime(n.created_at)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              });
            })()}

            {/* 快捷操作 */}
            <div className="notif-actions">
              <button className="notif-action-btn" onClick={markAllAsRead}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {assistantT.markAllReadBtn || "全部标记已读"}
              </button>
              <button className="notif-action-btn" onClick={() => switchTab("home")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                </svg>
                {assistantT.backToWorkbench || "返回工作台"}
              </button>
            </div>
          </div>
        )}

        {/* ===== 个人资料 Sheet ===== */}
        {showProfile && (
          <AssistantProfileSheet
            user={user}
            onClose={() => setShowProfile(false)}
            onLogout={() => { setShowProfile(false); logout(); }}
          />
        )}

        {/* ===== 运动员详情 Sheet ===== */}
        {selectedAthlete && !selectedReport && (
          <AthleteDetailSheet
            athlete={selectedAthlete}
            sessions={athleteSessions}
            notes={athleteNotes}
            loading={sessionLoading}
            noteContent={noteContent}
            onNoteContentChange={setNoteContent}
            onSubmitNote={() => submitNote(noteContent)}
            noteSaving={noteSaving}
            voiceRecording={voiceRecording}
            onVoiceToggle={handleVoiceToggle}
            onClose={() => setSelectedAthlete(null)}
            onOpenReport={(sessionId) => {
              setSelectedAthlete(null);
              setTimeout(() => fetchReportDetail(sessionId), 350);
            }}
          />
        )}

        {/* ===== 报告详情 Sheet ===== */}
        {selectedReport && (
          <ReportDetailSheet
            report={selectedReport}
            noteContent={noteContent}
            onNoteContentChange={setNoteContent}
            onSubmitNote={() => submitNote(noteContent)}
            noteSaving={noteSaving}
            voiceRecording={voiceRecording}
            onVoiceToggle={handleVoiceToggle}
            onClose={() => setSelectedReport(null)}
            onBack={() => setSelectedReport(null)}
          />
        )}

        {/* 底部导航 */}
        <AssistantNav active={activeTab} onNavigate={switchTab} badgeCount={unreadCount} assistantT={assistantT} />
      </div>
    </>
  );
}

// 底部导航组件
export function AssistantNav({ active, onNavigate, badgeCount, assistantT }) {
  assistantT = assistantT || {};
  const items = [
    {
      key: "home",
      label: assistantT.navWorkbench || "工作台",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      key: "records",
      label: assistantT.navRecords || "记录",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      key: "notify",
      label: assistantT.navAlerts || "通知",
      badge: badgeCount,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="assistant-nav">
      {items.map((item) => (
        <button
          key={item.key}
          className={`assistant-nav-btn${active === item.key ? " active" : ""}`}
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
