/**
 * 主教练底部导航栏
 * 4个Tab：工作台 | 计划 | 记录 | 通知
 */
import { useI18n } from "../locales/index.jsx";

export default function CoachNav({ active, onNavigate, badgeCount = 0 }) {
  const { t } = useI18n();
  const coachT = t.coach || {};

  const items = [
    {
      key: "home",
      label: coachT.navWorkbench || "工作台",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      key: "plan",
      label: coachT.navPlan || "计划",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      key: "session",
      label: coachT.navRecord || "记录",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      key: "notify",
      label: coachT.navNotify || "通知",
      badge: badgeCount,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
  ];

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      maxWidth: 430, width: "100%", display: "flex", justifyContent: "space-around",
      padding: "8px 8px", paddingBottom: "max(8px, env(safe-area-inset-bottom))",
      background: "rgba(13,12,10,0.92)", backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.06)",
      zIndex: 100,
    }}>
      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              gap: 4, padding: "10px 0", border: "none", background: "none",
              cursor: "pointer", color: isActive ? "var(--accent)" : "var(--text-dim)",
              fontFamily: "inherit", fontSize: 11, fontWeight: 500,
              transition: "color 0.2s", position: "relative",
            }}
          >
            <span style={{
              width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
              transform: isActive ? "scale(1.08)" : "scale(1)", transition: "transform 0.2s",
            }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
            {item.badge > 0 && (
              <span style={{
                position: "absolute", top: 4, right: "50%", transform: "translateX(14px)",
                minWidth: 16, height: 16, padding: "0 5px", borderRadius: 9,
                background: "var(--red)", color: "white", fontSize: 10, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{item.badge > 99 ? "99+" : item.badge}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
