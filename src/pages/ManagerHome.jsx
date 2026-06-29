// API calls migrated to services layer
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { managerService, notificationService, bindingService, authService } from "../services";
import LoadingState from "../components/LoadingState.jsx";
import '../styles/manager-pages.css';

// 通知类型配置
const NOTIF_CONFIG = {
  training_feedback: { icon: "📊", color: "blue" },
  risk_alert: { icon: "📉", color: "red" },
  injury_alert: { icon: "⚠️", color: "red" },
  treatment_plan: { icon: "💊", color: "amber" },
  training_note: { icon: "💬", color: "blue" },
  conflict_alert: { icon: "⚡", color: "amber" },
  plan_approval: { icon: "📋", color: "blue" },
  attendance_alert: { icon: "📉", color: "red" },
  weekly_report: { icon: "📊", color: "green" },
  general: { icon: "📢", color: "blue" },
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

// 格式化时间
const formatTime = (d) => {
  if (!d) return "";
  const s = Math.floor((new Date() - new Date(d)) / 1000);
  if (s < 60) return "刚刚";
  if (s < 3600) return `${Math.floor(s / 60)}分钟前`;
  if (s < 86400) return `${Math.floor(s / 3600)}小时前`;
  return `${Math.floor(s / 86400)}天前`;
};

// 获取时间分组
const getTimeGroup = (d) => {
  if (!d) return "更早";
  const now = new Date();
  const date = new Date(d);
  const diffDays = Math.floor((now - date) / 86400000);
  if (diffDays < 1) return "今天";
  if (diffDays < 2) return "昨天";
  return "更早";
};

export default function ManagerHome() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [showProfile, setShowProfile] = useState(false);

  // 数据状态
  const [dashboard, setDashboard] = useState(null);
  const [teamStatus, setTeamStatus] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // 绑定管理
  const [bindings, setBindings] = useState([]);
  const [showBindingSheet, setShowBindingSheet] = useState(false);
  const [bindingAthlete, setBindingAthlete] = useState(null);
  const [bindingData, setBindingData] = useState(null);
  const [athletes, setAthletes] = useState([]);
  const [allCoaches, setAllCoaches] = useState([]);
  const [allAssistants, setAllAssistants] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [bindingSaving, setBindingSaving] = useState(false);

  // 出勤统计
  const [attRange, setAttRange] = useState("week");

  useEffect(() => { fetchData(); fetchNotifications(); fetchUnreadCount(); fetchBindings(); fetchStaffLists(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashData, statusData, attData] = await Promise.all([
        managerService.getDashboard(),
        managerService.getTeamStatus(),
        managerService.getAttendance({ period: "week" }),
      ]);
      setDashboard(dashData);
      setTeamStatus(statusData);
      setAttendanceData(attData);
    } catch (err) {
      console.error("获取数据失败:", err);
    } finally { setLoading(false); }
  };

  // 切换出勤统计时间范围
  const fetchAttendance = async (period) => {
    setAttRange(period);
    try {
      const attData = await managerService.getAttendance({ period });
      setAttendanceData(attData);
    } catch (err) {
      console.error("获取出勤数据失败:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications({ limit: 20 });
      setNotifications(data.notifications || []);
    } catch {}
  };

  const fetchBindings = async () => {
    try {
      const data = await bindingService.getBindings();
      setBindings(data.bindings || []);
    } catch {}
  };

  const fetchStaffLists = async () => {
    try {
      const users = await authService.getUsers();
      const allUsers = users.users || [];
      setAthletes(allUsers.filter(u => u.role === "athlete"));
      setAllCoaches(allUsers.filter(u => u.role === "head_coach"));
      setAllAssistants(allUsers.filter(u => u.role === "assistant"));
      setAllDoctors(allUsers.filter(u => u.role === "doctor"));
    } catch {}
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch {}
  };

  // 绑定管理
  const openBindingSheet = async (athlete) => {
    setBindingAthlete(athlete);
    setShowBindingSheet(true);
    try {
      const data = await bindingService.getAthleteBinding(athlete.id || athlete.athlete_id);
      setBindingData(data.binding || {
        athlete_id: athlete.id || athlete.athlete_id,
        coach_id: null,
        assistant_id: null,
        doctor_id: null,
      });
    } catch {
      setBindingData({
        athlete_id: athlete.id || athlete.athlete_id,
        coach_id: null,
        assistant_id: null,
        doctor_id: null,
      });
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
      fetchBindings();
      alert("绑定关系已保存");
    } catch (err) {
      alert("保存失败: " + err.message);
    } finally { setBindingSaving(false); }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  };

  // 页面标题映射
  const compactTitles = {
    "home": "",
    "attendance": "出勤统计",
    "notify": "通知",
  };

  // 切换页面
  const switchTab = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 数据
  const today = dashboard?.today || {};
  const week = dashboard?.this_week || {};
  const status = dashboard?.team_status || {};
  const plans = teamStatus?.current_week_plans || [];

  // 本周日期
  const getWeekDays = () => {
    const days = ["日", "一", "二", "三", "四", "五", "六"];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const isToday = date.toDateString() === today.toDateString();
      const plan = plans.find((p) => p.date === date.toISOString().split("T")[0]);
      const status = plan?.status || "rest";
      return {
        label: days[date.getDay()],
        date: date.getDate(),
        isToday,
        status,
      };
    });
  };

  const weekDays = getWeekDays();

  // 出勤数据（从 attendance API 获取）
  const athletesAttendance = attendanceData?.athletes || [];
  const teamAvgAttendance = attendanceData?.team_avg_attendance || "0%";

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 70 }}>
      {/* Header - 完整模式 */}
      {activeTab === "home" && (
        <div className="manager-header">
          <div>
            <div className="manager-greeting-small">{getGreeting()}，</div>
            <div className="manager-greeting-name">{user.display_name}</div>
            <div className="manager-greeting-sub">管理人员 · 恢复周</div>
          </div>
          <div className="manager-avatar-ring" onClick={() => setShowProfile(true)} title="我的">
            <div className="manager-avatar">{user.display_name?.[0]}</div>
          </div>
        </div>
      )}

      {/* Header - 紧凑模式 */}
      {activeTab !== "home" && (
        <div className="manager-header-compact">
          <span className="page-title-inline">{compactTitles[activeTab]}</span>
          <div className="manager-avatar-ring" onClick={() => setShowProfile(true)} title="我的">
            <div className="manager-avatar">{user.display_name?.[0]}</div>
          </div>
        </div>
      )}

      {/* ===== 首页 ===== */}
      {activeTab === "home" && (
        <div className="manager-page active">
          {/* 统计行 */}
          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-value amber">{today.trained_count || 0}<span className="stat-sub">/{today.total_athletes || 0}</span></div>
              <div className="stat-label">出勤</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{today.training_rate || "0%"}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value accent">{status.avg_score || "--"}</div>
              <div className="stat-label">团队均分</div>
              <div className="stat-trend">↑ 趋势</div>
            </div>
            <div className="stat-card">
              <div className="stat-value red">{status.alert_count || 0}</div>
              <div className="stat-label">预警人数</div>
              <div style={{ fontSize: 11, color: "var(--amber)", marginTop: 2 }}>▲ 关注</div>
            </div>
          </div>

          {/* Alert Banner */}
          {status.alert_count > 0 && (
            <div className="alert-banner" onClick={() => switchTab("attendance")}>
              <div className="alert-banner-icon">⚠️</div>
              <div className="alert-banner-text">
                <div className="alert-banner-title">{status.alert_count} 名运动员需要关注</div>
                <div className="alert-banner-desc">出勤率低于 70%，建议跟进了解情况</div>
              </div>
            </div>
          )}

          {/* 本周训练进度 */}
          <div style={{ marginBottom: 4 }}>
            <div className="section-title">本周训练进度</div>
            <div className="week-progress">
              <div className="week-strip">
                {weekDays.map((day, i) => (
                  <div key={i} className={`week-day${day.isToday ? " today" : ""}`}>
                    <span className="day-label">{day.label}</span>
                    <span className="day-date">{day.date}</span>
                    <span className={`day-dot ${day.status}`}></span>
                    <span className="day-status">{day.isToday ? "今天" : day.status === "rest" ? "休息" : "训练"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 本周出勤率 */}
          <div style={{ marginBottom: 4 }}>
            <div className="section-title">本周出勤率</div>
            <div className="completion-card">
              <div className="completion-header">
                <span className="completion-title">团队出勤率</span>
                <span className="completion-badge stable">本周</span>
              </div>
              <div className="completion-bar-track">
                <div className="completion-bar-fill" style={{ width: `${parseInt(teamAvgAttendance) || 0}%` }}></div>
              </div>
              <div className="completion-row">
                <div className="completion-stat">
                  <div className="completion-stat-num" style={{ color: "var(--accent)" }}>{teamAvgAttendance}</div>
                  <div className="completion-stat-label">出勤率</div>
                </div>
                <div className="completion-stat">
                  <div className="completion-stat-num" style={{ color: "var(--green)" }}>{today.trained_count || 0}</div>
                  <div className="completion-stat-label">今日出勤</div>
                </div>
                <div className="completion-stat">
                  <div className="completion-stat-num" style={{ color: "var(--amber)" }}>{today.total_athletes || 0}</div>
                  <div className="completion-stat-label">总运动员</div>
                </div>
              </div>
            </div>
          </div>

          {/* 团队情绪分布 */}
          <div style={{ marginBottom: 4 }}>
            <div className="section-title">团队情绪分布</div>
            <div className="mood-card">
              <div className="mood-bars">
                {[
                  { emoji: "😊", label: "开心", pct: status.emotion_distribution?.positive || 0, color: "green" },
                  { emoji: "😐", label: "中性", pct: status.emotion_distribution?.neutral || 0, color: "accent" },
                  { emoji: "😮‍💨", label: "疲惫", pct: status.emotion_distribution?.tired || 0, color: "amber" },
                  { emoji: "😫", label: "糟糕", pct: status.emotion_distribution?.negative || 0, color: "red" },
                ].map((m, i) => (
                  <div key={i} className="mood-row">
                    <span className="mood-emoji">{m.emoji}</span>
                    <div className="mood-bar-track">
                      <div className={`mood-bar-fill ${m.color}`} style={{ width: `${m.pct}%` }}></div>
                    </div>
                    <span className="mood-pct">{m.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 快捷操作 */}
          <div className="quick-actions">
            <button className="quick-btn" onClick={() => switchTab("attendance")}>
              <div className="quick-btn-icon gold">📊</div>
              <span className="quick-btn-label">出勤统计</span>
            </button>
            <button className="quick-btn" onClick={() => switchTab("notify")}>
              <div className="quick-btn-icon blue">🔔</div>
              <span className="quick-btn-label">查看通知</span>
            </button>
          </div>

          {/* 绑定关系管理 */}
          <div style={{ marginTop: 28 }}>
            <div className="section-title">绑定关系管理</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {bindings.map((b) => {
                const athlete = athletes.find(a => a.id === b.athlete_id);
                const coach = allCoaches.find(c => c.id === b.coach_id);
                const assistant = allAssistants.find(a => a.id === b.assistant_id);
                const doctor = allDoctors.find(d => d.id === b.doctor_id);
                return (
                  <div key={b.athlete_id} style={{
                    padding: "14px 16px", background: "var(--card)", border: "1px solid var(--border)",
                    borderRadius: 12, display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                        {athlete?.display_name || `运动员#${b.athlete_id}`}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)", display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span>主教练: {coach?.display_name || "未绑定"}</span>
                        <span>助教: {assistant?.display_name || "未绑定"}</span>
                        <span>队医: {doctor?.display_name || "未绑定"}</span>
                      </div>
                    </div>
                    <button onClick={() => openBindingSheet(athlete || { id: b.athlete_id, display_name: `运动员#${b.athlete_id}` })} style={{
                      padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)",
                      background: "var(--surface)", color: "var(--text-dim)", fontSize: 11,
                      cursor: "pointer", fontFamily: "inherit",
                    }}>编辑</button>
                  </div>
                );
              })}
              {bindings.length === 0 && (
                <div style={{ textAlign: "center", padding: 30, color: "var(--text-dim)", fontSize: 13 }}>
                  暂无绑定关系，请在运动员列表中点击 ⚙️ 添加
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== 出勤统计 ===== */}
      {activeTab === "attendance" && (
        <div className="manager-page active">
          {/* 时间范围选择器 */}
          <div className="range-selector">
            {["week", "month", "quarter"].map((r) => (
              <button
                key={r}
                className={`range-btn${attRange === r ? " active" : ""}`}
                onClick={() => fetchAttendance(r)}
              >
                {r === "week" ? "本周" : r === "month" ? "本月" : "本季度"}
              </button>
            ))}
          </div>

          {/* Hero 出勤卡片 */}
          <div className="att-hero">
            <div className="att-hero-label">团队平均出勤率</div>
            <div className="att-hero-score">{parseInt(teamAvgAttendance) || 0}<span className="unit">%</span></div>
            <div className="att-hero-date">{attendanceData?.start_date || ""} ~ {attendanceData?.end_date || ""}</div>
          </div>

          {/* 运动员出勤详情 */}
          <div className="att-section-title">运动员出勤详情</div>
          <div className="att-list">
            {athletesAttendance.map((a) => {
              const rate = parseInt(a.attendance_rate) || 0;
              const statusClass = rate >= 85 ? "good" : rate >= 70 ? "normal" : "warn";
              const barColor = rate >= 85 ? "green" : rate >= 70 ? "amber" : "red";
              return (
                <div key={a.athlete_id} className={`att-item ${statusClass}`}>
                  <div className="att-avatar">{a.athlete_name?.[0]}</div>
                  <div className="att-info">
                    <div className="att-name">{a.athlete_name}</div>
                    <div className="att-bar-wrap">
                      <div className="att-bar-track">
                        <div className={`att-bar-fill ${barColor}`} style={{ width: `${Math.max(rate, 5)}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="att-right">
                    <div className="att-pct" style={{ color: `var(--${barColor})` }}>{rate}%</div>
                    <div className="att-count">{a.actual_sessions}/{a.expected_sessions}</div>
                    <span className={`att-status-badge ${statusClass}`}>
                      {statusClass === "good" ? "良好" : statusClass === "normal" ? "一般" : "需关注"}
                    </span>
                  </div>
                </div>
              );
            })}
            {athletesAttendance.length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: "var(--text-dim)" }}>暂无出勤数据</div>
            )}
          </div>

          {/* 图例说明 */}
          <div className="att-legend">
            <div className="att-legend-item"><span className="att-legend-dot green"></span><span className="att-legend-text">≥85% 良好</span></div>
            <div className="att-legend-item"><span className="att-legend-dot amber"></span><span className="att-legend-text">70-85% 一般</span></div>
            <div className="att-legend-item"><span className="att-legend-dot red"></span><span className="att-legend-text">&lt;70% 需关注</span></div>
          </div>
        </div>
      )}

      {/* ===== 通知 ===== */}
      {activeTab === "notify" && (
        <div className="manager-page active">
          {/* 右上角全部已读 */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            {unreadCount > 0 && (
              <button className="section-link" onClick={markAllAsRead}>全部已读</button>
            )}
          </div>

          {/* 通知统计 */}
          <div className="notif-summary">
            <div className="notif-summary-item red">
              <div className="notif-summary-num" style={{ color: "var(--red)" }}>
                {notifications.filter((n) => (n.type === "risk_alert" || n.type === "injury_alert" || n.type === "attendance_alert") && !n.is_read).length}
              </div>
              <div className="notif-summary-label">预警</div>
            </div>
            <div className="notif-summary-item amber">
              <div className="notif-summary-num" style={{ color: "var(--accent)" }}>{unreadCount}</div>
              <div className="notif-summary-label">未读</div>
            </div>
            <div className="notif-summary-item blue">
              <div className="notif-summary-num" style={{ color: "var(--blue)" }}>
                {notifications.filter((n) => n.is_read).length}
              </div>
              <div className="notif-summary-label">已读</div>
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
            const groupOrder = ["今天", "昨天", "更早"];

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
                        onClick={async () => {
                          if (!n.is_read) {
                            try {
                              await notificationService.markAsRead(n.id);
                              setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, is_read: true } : x));
                              setUnreadCount((prev) => Math.max(0, prev - 1));
                            } catch {}
                          }
                        }}
                      >
                        <div className={`notif-card-icon ${config.color}`}>{config.icon}</div>
                        <div className="notif-card-body">
                          <div className="notif-card-title">{n.title}</div>
                          <div className="notif-card-desc">{n.content}</div>
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

          {notifications.length === 0 && (
            <div style={{ textAlign: "center", padding: 60, color: "var(--text-dim)" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
              <div>暂无通知</div>
            </div>
          )}

          {/* 快捷操作 */}
          <div className="notif-actions">
            <button className="notif-action-btn" onClick={markAllAsRead}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              全部标记已读
            </button>
            <button className="notif-action-btn" onClick={() => switchTab("home")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
              返回工作台
            </button>
          </div>
        </div>
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
              <span className="sheet-role">管理人员</span>
            </div>
            <div className="sheet-info-group">
              <div className="sheet-info-row">
                <span className="sheet-info-label">账号名</span>
                <span className="sheet-info-value">{user.display_name}</span>
              </div>
              <div className="sheet-info-row">
                <span className="sheet-info-label">角色</span>
                <span className="sheet-info-value">管理人员</span>
              </div>
              <div className="sheet-info-row">
                <span className="sheet-info-label">用户 ID</span>
                <span className="sheet-info-value">{user.id}</span>
              </div>
            </div>
            <button className="sheet-logout" onClick={() => { setShowProfile(false); logout(); }}>退出登录</button>
          </div>
        </>
      )}

      {/* ===== 绑定管理 Sheet ===== */}
      {showBindingSheet && bindingAthlete && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200 }} onClick={() => setShowBindingSheet(false)} />
          <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", maxWidth: 430, width: "100%", background: "var(--surface)", borderRadius: "20px 20px 0 0", zIndex: 201, padding: "0 24px 20px", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px", cursor: "grab" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)" }} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 20 }}>
              绑定管理 · {bindingAthlete.display_name}
            </div>

            {/* 主教练选择 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>绑定主教练</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <button onClick={() => setBindingData(prev => ({ ...prev, coach_id: null }))} style={{
                  padding: "6px 12px", borderRadius: 14, fontSize: 12, cursor: "pointer",
                  border: !bindingData?.coach_id ? "1px solid var(--accent)" : "1px solid var(--border)",
                  background: !bindingData?.coach_id ? "var(--accent-dim)" : "transparent",
                  color: !bindingData?.coach_id ? "var(--accent)" : "var(--text-dim)",
                  fontFamily: "inherit",
                }}>无</button>
                {allCoaches.map(c => (
                  <button key={c.id} onClick={() => setBindingData(prev => ({ ...prev, coach_id: c.id }))} style={{
                    padding: "6px 12px", borderRadius: 14, fontSize: 12, cursor: "pointer",
                    border: bindingData?.coach_id === c.id ? "1px solid var(--accent)" : "1px solid var(--border)",
                    background: bindingData?.coach_id === c.id ? "var(--accent-dim)" : "transparent",
                    color: bindingData?.coach_id === c.id ? "var(--accent)" : "var(--text-dim)",
                    fontFamily: "inherit",
                  }}>{c.display_name}</button>
                ))}
              </div>
            </div>

            {/* 助教选择 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>绑定助教</div>
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
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>绑定队医</div>
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
              }}>{bindingSaving ? "保存中..." : "保存绑定"}</button>
              <button onClick={() => setShowBindingSheet(false)} style={{
                flex: 1, padding: "12px 0", borderRadius: 10,
                border: "1px solid var(--border)", background: "var(--card)",
                color: "var(--text-secondary)", fontSize: 13, cursor: "pointer",
                fontFamily: "inherit",
              }}>取消</button>
            </div>
          </div>
        </>
      )}

      {/* 底部导航 */}
      <ManagerNav active={activeTab} onNavigate={switchTab} badgeCount={unreadCount} />
    </div>
  );
}

// 底部导航组件
export function ManagerNav({ active, onNavigate, badgeCount = 0 }) {
  const items = [
    {
      key: "home",
      label: "首页",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      key: "attendance",
      label: "出勤统计",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
        </svg>
      ),
    },
    {
      key: "notify",
      label: "通知",
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
    <nav className="manager-nav">
      {items.map((item) => (
        <button
          key={item.key}
          className={`manager-nav-btn${active === item.key ? " active" : ""}`}
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
