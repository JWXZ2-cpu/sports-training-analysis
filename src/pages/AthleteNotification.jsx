// API calls migrated to services layer
import { useState, useEffect } from "react";
import { notificationService } from "../services";
import BottomNav from "../components/BottomNav.jsx";

/**
 * 运动员端 - 通知页面
 * 设计风格与 AthleteHome / AthleteDiary / AthleteSummary 保持一致
 */

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

const COLOR_BG = {
  blue: "rgba(92,159,212,0.12)",
  amber: "rgba(212,164,76,0.10)",
  green: "rgba(107,191,110,0.12)",
  red: "rgba(212,92,92,0.12)",
};

export default function AthleteNotification() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications({ limit: 20 });
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("获取通知失败:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {}
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

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 70 }}>
      <div style={{ padding: "20px 16px 0" }}>
        {/* 页面标题 + 全部已读 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#F0EBE0", margin: 0, letterSpacing: "-0.02em" }}>消息</h1>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{
              background: "none", border: "none", color: "var(--accent)",
              fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
            }}>全部已读</button>
          )}
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
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-dim)", letterSpacing: "0.04em", textTransform: "uppercase", margin: "24px 0 12px", paddingLeft: 4 }}>
                    {group}
                  </div>
                  {items.map((notif, i) => {
                    const config = NOTIF_CONFIG[notif.type] || NOTIF_CONFIG.general;
                    return (
                      <div
                        key={notif.id}
                        onClick={async () => {
                          if (!notif.is_read) {
                            try {
                              await notificationService.markAsRead(notif.id);
                              setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n));
                            } catch {}
                          }
                        }}
                        style={{
                          display: "flex", gap: 14, padding: 18,
                          background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)",
                          borderLeft: !notif.is_read ? "3px solid var(--accent)" : "1px solid rgba(255,255,255,0.06)",
                          borderRadius: 16, cursor: "pointer", marginBottom: 12,
                          transition: "border-color 0.2s, background 0.2s",
                          animation: `fadeUp 0.4s ease ${0.05 + i * 0.05}s both`,
                          position: "relative",
                          width: "100%",
                          boxSizing: "border-box",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"; e.currentTarget.style.background = "#28261F"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "var(--card)"; }}
                      >
                        {/* 未读标记 */}
                        {!notif.is_read && (
                          <div style={{ position: "absolute", top: 18, right: 18, width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
                        )}

                        {/* 图标 */}
                        <div style={{
                          width: 44, height: 44, borderRadius: 14,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 20, flexShrink: 0,
                          background: COLOR_BG[config.color] || COLOR_BG.blue,
                        }}>
                          {config.icon}
                        </div>

                        {/* 内容 */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#F0EBE0", marginBottom: 5, paddingRight: 16 }}>
                            {notif.title}
                          </div>
                          {notif.content && (
                            <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>
                              {notif.content}
                            </div>
                          )}
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
      </div>

      <BottomNav active="notify" badgeCount={unreadCount} />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
