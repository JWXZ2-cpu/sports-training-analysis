// API calls migrated to services layer
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useI18n } from "../locales/index.jsx";
import { notificationService } from "../services";
import LoadingState from "../components/LoadingState.jsx";
import NotificationBell from "../components/NotificationBell.jsx";

// 通知类型配置
const TYPE_CONFIG = {
  training_feedback: { icon: "📊", color: "blue" },
  risk_alert: { icon: "⚠️", color: "red" },
  injury_alert: { icon: "🔔", color: "red" },
  treatment_plan: { icon: "💊", color: "green" },
  training_note: { icon: "💬", color: "blue" },
  conflict_alert: { icon: "⚡", color: "amber" },
  plan_approval: { icon: "📋", color: "blue" },
  physiology_alert: { icon: "🔬", color: "amber" },
  general: { icon: "📢", color: "blue" },
};

const COLOR_MAP = {
  red: { bg: "rgba(212,92,92,0.12)" },
  green: { bg: "rgba(107,191,110,0.12)" },
  blue: { bg: "rgba(92,159,212,0.12)" },
  amber: { bg: "rgba(212,164,76,0.10)" },
};

// 样式常量
const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--bg)",
    paddingBottom: 70,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "20px 16px 0",
  },
  backButton: {
    background: "none",
    border: "none",
    color: "var(--accent)",
    fontSize: 12,
    cursor: "pointer",
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "var(--text)",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  markAllButton: {
    background: "none",
    border: "none",
    color: "var(--accent)",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    marginTop: 8,
  },
  content: {
    padding: "0 16px",
  },
  summaryContainer: {
    display: "flex",
    gap: 10,
    marginBottom: 24,
    animation: "fadeUp 0.4s ease 0s both",
  },
  summaryItem: (borderColor) => ({
    flex: 1,
    padding: "14px 10px",
    background: "var(--card)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10,
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  }),
  summaryBorder: (color) => ({
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    background: color,
  }),
  summaryNum: (color) => ({
    fontSize: 24,
    fontWeight: 700,
    color,
    lineHeight: 1,
  }),
  summaryLabel: {
    fontSize: 11,
    color: "var(--text-dim)",
    marginTop: 5,
    fontWeight: 500,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-dim)",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    margin: "24px 0 12px",
    paddingLeft: 4,
    animation: "fadeUp 0.3s ease both",
  },
  notifCard: (isUnread, delay) => ({
    display: "flex",
    gap: 14,
    padding: 18,
    background: "var(--card)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderLeft: isUnread ? "3px solid var(--accent)" : "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    cursor: "pointer",
    marginBottom: 12,
    transition: "border-color 0.2s, background 0.2s",
    animation: `fadeUp 0.4s ease ${delay}s both`,
    position: "relative",
  }),
  unreadDot: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "var(--accent)",
  },
  notifIcon: (bgColor) => ({
    width: 44,
    height: 44,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    flexShrink: 0,
    background: bgColor,
  }),
  notifBody: {
    flex: 1,
    minWidth: 0,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--text)",
    marginBottom: 5,
    paddingRight: 16,
  },
  notifDesc: {
    fontSize: 13,
    color: "var(--text-secondary)",
    lineHeight: 1.55,
  },
  notifTime: {
    fontSize: 11,
    color: "var(--text-dim)",
    marginTop: 10,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  timeDot: {
    width: 4,
    height: 4,
    borderRadius: "50%",
    background: "var(--text-dim)",
  },
  actionsContainer: {
    display: "flex",
    gap: 10,
    marginTop: 20,
    animation: "fadeUp 0.4s ease 0.2s both",
  },
  actionButton: {
    flex: 1,
    padding: "13px 14px",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10,
    background: "var(--card)",
    color: "var(--text-secondary)",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionIcon: {
    width: 15,
    height: 15,
  },
  emptyState: {
    textAlign: "center",
    padding: 60,
    color: "var(--text-dim)",
  },
  loadingState: {
    textAlign: "center",
    padding: 60,
    color: "var(--text-dim)",
  },
};

export default function CoachNotification({ onBack }) {
  const { user } = useAuth();
  const { lang, t } = useI18n();
  const coachT = t.coach || {};
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications({ limit: 20 });
      setNotifications(data.notifications || []);
    } catch {} finally { setLoading(false); }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("标记已读失败:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("批量标记已读失败:", err);
    }
  };

  const handleClick = async (notif) => {
    console.log("点击通知:", notif.id, notif.type);
    try {
      await markAsRead(notif.id);
      console.log("标记已读成功");
    } catch (err) {
      console.error("标记已读失败:", err);
    }

    // 根据通知类型跳转到对应页面
    switch (notif.type) {
      case "risk_alert":
      case "injury_alert":
      case "physiology_alert":
        // 预警/伤病通知 → 跳转到主教练首页查看运动员
        window.location.href = "/coach";
        break;
      case "training_feedback":
        // 训练反馈通知 → 跳转到主教练首页查看记录
        window.location.href = "/coach";
        break;
      case "conflict_alert":
        // 冲突通知 → 跳转到冲突检查页面
        window.location.href = "/doctor/conflict-check";
        break;
      case "treatment_plan":
        // 治疗计划通知 → 跳转到主教练首页
        window.location.href = "/coach";
        break;
      case "training_note":
        // 训练评价通知 → 跳转到主教练首页
        window.location.href = "/coach";
        break;
      case "plan_approval":
        // 计划审批通知 → 跳转到计划管理页面
        window.location.href = "/coach";
        break;
      default:
        // 默认跳转到主教练首页
        window.location.href = "/coach";
        break;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return coachT.justNow || "刚刚";
    if (diff < 3600) return (coachT.minutesAgo || "{n}分钟前").replace("{n}", Math.floor(diff / 60));
    if (diff < 86400) return (coachT.hoursAgo || "{n}小时前").replace("{n}", Math.floor(diff / 3600));
    return (coachT.daysAgo || "{n}天前").replace("{n}", Math.floor(diff / 86400));
  };

  const getTimeGroup = (dateStr) => {
    if (!dateStr) return coachT.earlier || "更早";
    const now = new Date();
    const date = new Date(dateStr);
    const diffDays = Math.floor((now - date) / 86400000);
    if (diffDays < 1) return coachT.today || "今天";
    if (diffDays < 2) return coachT.yesterday || "昨天";
    return coachT.earlier || "更早";
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const alertCount = notifications.filter((n) => (n.type === "risk_alert" || n.type === "injury_alert") && !n.is_read).length;
  const readCount = notifications.filter((n) => n.is_read).length;

  // 按时间分组
  const grouped = {};
  notifications.forEach((n) => {
    const group = getTimeGroup(n.created_at);
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(n);
  });
  const groupOrder = [coachT.today || "今天", coachT.yesterday || "昨天", coachT.earlier || "更早"];

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <button onClick={onBack} style={styles.backButton}>{coachT.back || "← 返回"}</button>
          <h1 style={styles.pageTitle}>{coachT.notifications || "通知"}</h1>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} style={styles.markAllButton}>{coachT.markAllRead || "全部已读"}</button>
        )}
      </div>

      <div style={styles.content}>
        {/* 通知统计 */}
        <div style={styles.summaryContainer}>
          <div style={styles.summaryItem()}>
            <div style={styles.summaryBorder("var(--red)")} />
            <div style={styles.summaryNum("var(--red)")}>{alertCount}</div>
            <div style={styles.summaryLabel}>{coachT.alert || "预警"}</div>
          </div>
          <div style={styles.summaryItem()}>
            <div style={styles.summaryBorder("var(--accent)")} />
            <div style={styles.summaryNum("var(--accent)")}>{unreadCount}</div>
            <div style={styles.summaryLabel}>{coachT.unread || "未读"}</div>
          </div>
          <div style={styles.summaryItem()}>
            <div style={styles.summaryBorder("var(--blue)")} />
            <div style={styles.summaryNum("var(--blue)")}>{readCount}</div>
            <div style={styles.summaryLabel}>{coachT.read || "已读"}</div>
          </div>
        </div>

        {loading ? (
          <LoadingState size="small" />
        ) : notifications.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
            <div>{coachT.noTodayNotif || "暂无通知"}</div>
          </div>
        ) : (
          <>
            {groupOrder.map((group) => {
              const items = grouped[group];
              if (!items?.length) return null;
              return (
                <div key={group}>
                  <div style={styles.groupLabel}>{group}</div>
                  {items.map((notif, i) => {
                    const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.general;
                    const colors = COLOR_MAP[config.color] || COLOR_MAP.blue;
                    const isUnread = !notif.is_read;
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleClick(notif)}
                        style={styles.notifCard(isUnread, 0.05 + i * 0.05)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
                          e.currentTarget.style.background = "#28261F";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                          e.currentTarget.style.background = "var(--card)";
                        }}
                      >
                        {/* 未读标记 */}
                        {isUnread && <div style={styles.unreadDot} />}

                        {/* 图标 */}
                        <div style={styles.notifIcon(colors.bg)}>
                          {config.icon}
                        </div>

                        {/* 内容 */}
                        <div style={styles.notifBody}>
                          <div style={styles.notifTitle}>{notif.title}</div>
                          {notif.content && (
                            <div style={styles.notifDesc}>{notif.content}</div>
                          )}
                          <div style={styles.notifTime}>
                            <span style={styles.timeDot} />
                            {formatTime(notif.created_at)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </>
        )}

        {/* 快捷操作 */}
        <div style={styles.actionsContainer}>
          <button
            onClick={markAllAsRead}
            style={styles.actionButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.color = "var(--accent)";
              e.currentTarget.style.background = "rgba(212,164,76,0.10)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.background = "var(--card)";
            }}
          >
            <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {coachT.markAllReadBtn || "全部标记已读"}
          </button>
          <button
            onClick={onBack}
            style={styles.actionButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.color = "var(--accent)";
              e.currentTarget.style.background = "rgba(212,164,76,0.10)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.background = "var(--card)";
            }}
          >
            <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
            {coachT.backToWorkbench || "返回工作台"}
          </button>
        </div>
      </div>

      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
