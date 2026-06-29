// API calls migrated to services layer
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useI18n } from "../locales/index.jsx";
import { notificationService } from "../services";

// 通知类型图标和颜色
const TYPE_CONFIG = {
  training_feedback: { icon: "📝", color: "blue" },
  risk_alert: { icon: "🔔", color: "red" },
  injury_alert: { icon: "🔔", color: "red" },
  treatment_plan: { icon: "💊", color: "green" },
  training_note: { icon: "💬", color: "blue" },
  conflict_alert: { icon: "⚠️", color: "amber" },
  plan_approval: { icon: "📋", color: "blue" },
  physiology_alert: { icon: "🔬", color: "amber" },
  general: { icon: "📢", color: "blue" },
};

const COLOR_MAP = {
  blue: { bg: "rgba(92,159,212,0.12)" },
  amber: { bg: "rgba(212,164,76,0.12)" },
  green: { bg: "rgba(107,191,110,0.12)" },
  red: { bg: "rgba(212,92,92,0.12)" },
};

const TYPE_ROUTES = {
  risk_alert: (n) => `/coach`,
  injury_alert: (n) => `/doctor/athlete/${n.related_entity_id}`,
  training_feedback: (n) => `/coach`,
  treatment_plan: (n) => `/doctor`,
  training_note: (n) => `/coach`,
  conflict_alert: (n) => `/doctor/conflict-check`,
  plan_approval: (n) => `/coach`,
};

export default function NotificationBell() {
  const { user } = useAuth();
  const { t } = useI18n();
  const sharedT = t;
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowPanel(false);
      }
    };
    if (showPanel) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPanel]);

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch {}
  };

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications({ limit: 20 });
      setNotifications(data.notifications || []);
    } catch {}
  };

  const togglePanel = () => {
    // 根据用户角色跳转到对应的通知页面
    if (user?.role === "athlete") {
      window.location.href = "/athlete/notify";
    } else if (user?.role === "head_coach") {
      window.location.href = "/coach";
    } else if (user?.role === "assistant") {
      window.location.href = "/assistant";
    } else if (user?.role === "doctor") {
      window.location.href = "/doctor";
    } else {
      window.location.href = "/";
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleClickNotification = async (notif) => {
    await markAsRead(notif.id);
    setShowPanel(false);
    const routeFn = TYPE_ROUTES[notif.type];
    if (routeFn) window.location.href = routeFn(notif);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return sharedT.time?.justNow || "刚刚";
    if (diff < 3600) return (sharedT.time?.minutesAgo || "{n}分钟前").replace("{n}", Math.floor(diff / 60));
    if (diff < 86400) return (sharedT.time?.hoursAgo || "{n}小时前").replace("{n}", Math.floor(diff / 3600));
    return (sharedT.time?.daysAgo || "{n}天前").replace("{n}", Math.floor(diff / 86400));
  };

  return (
    <div ref={panelRef} style={{ position: "relative" }}>
      {/* 铃铛按钮 */}
      <button onClick={togglePanel} style={{
        background: "none", border: "none", cursor: "pointer",
        position: "relative", padding: "4px", fontSize: 18,
      }}>
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: -2, right: -6,
            background: "var(--red)", color: "#fff",
            fontSize: 10, fontWeight: 600,
            minWidth: 16, height: 16, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 4px",
          }}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* 通知面板 */}
      {showPanel && (
        <div style={{
          position: "absolute", top: "100%", right: 0,
          width: 360, maxHeight: 480, overflow: "auto",
          background: "var(--card)", borderRadius: 16,
          boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          border: "1px solid var(--border)", zIndex: 1000,
        }}>
          {/* 头部 */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 18px", borderBottom: "1px solid var(--border)",
            position: "sticky", top: 0, background: "var(--card)", zIndex: 1,
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
              {sharedT.coach?.notifications || "通知"} {unreadCount > 0 && <span style={{ color: "var(--red)", fontSize: 12 }}>({unreadCount})</span>}
            </span>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={{
                background: "none", border: "none", color: "var(--accent)",
                fontSize: 11, cursor: "pointer", fontWeight: 500,
              }}>{sharedT.coach?.markAllRead || "全部已读"}</button>
            )}
          </div>

          {/* 通知列表 */}
          {notifications.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-dim)", fontSize: 12 }}>
              {sharedT.coach?.noTodayNotif || "暂无通知"}
            </div>
          ) : (
            <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 12 }}>
              {notifications.map((notif, i) => {
                const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.general;
                const colorConfig = COLOR_MAP[config.color] || COLOR_MAP.blue;
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleClickNotification(notif)}
                    style={{
                      display: "flex", gap: 14, padding: 18,
                      background: "var(--card)", border: "1px solid var(--border)",
                      borderRadius: 16, cursor: "pointer",
                      transition: "border-color 0.2s, background 0.2s",
                      animation: `fadeUp 0.4s ease ${0.05 + i * 0.05}s both`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-light)";
                      e.currentTarget.style.background = "var(--card-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.background = "var(--card)";
                    }}
                  >
                    {/* 图标方块 */}
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, flexShrink: 0,
                      background: colorConfig.bg,
                    }}>
                      {config.icon}
                    </div>

                    {/* 内容 */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{
                          fontSize: 14, fontWeight: notif.is_read ? 400 : 600,
                          color: "var(--text)",
                        }}>
                          {notif.title}
                        </span>
                        {!notif.is_read && (
                          <span style={{
                            width: 6, height: 6, borderRadius: "50%",
                            background: "var(--accent)", display: "inline-block", flexShrink: 0,
                          }} />
                        )}
                      </div>
                      {notif.content && (
                        <div style={{
                          fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5,
                        }}>
                          {notif.content}
                        </div>
                      )}
                      <span style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 8, display: "block" }}>
                        {formatTime(notif.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* fadeUp 动画 */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
