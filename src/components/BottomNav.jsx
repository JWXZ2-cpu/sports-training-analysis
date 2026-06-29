/**
 * MiMo 风格底部导航栏
 * - 毛玻璃背景
 * - SVG 圆角图标
 * - 激活态：金色 + 放大
 * - 四个导航项：首页 | 日记 | 数据 | 通知
 */
export default function BottomNav({ active, badgeCount = 0 }) {
  const items = [
    {
      key: "home",
      label: "首页",
      href: "/athlete",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      key: "diary",
      label: "日记",
      href: "/athlete/diary",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ),
    },
    {
      key: "data",
      label: "数据",
      href: "/athlete/summary",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      key: "notify",
      label: "通知",
      href: "/athlete/notify",
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
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      maxWidth: 430,
      width: "100%",
      display: "flex",
      justifyContent: "space-around",
      padding: "8px 8px",
      paddingBottom: "max(8px, env(safe-area-inset-bottom))",
      background: "rgba(13,12,10,0.92)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      zIndex: 100,
    }}>
      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <a
            key={item.key}
            href={item.href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "10px 0",
              textDecoration: "none",
              color: isActive ? "var(--accent)" : "var(--text-dim)",
              fontFamily: "inherit",
              fontSize: 11,
              fontWeight: 500,
              transition: "color 0.2s",
              position: "relative",
            }}
          >
            <span style={{
              width: 22,
              height: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: isActive ? "scale(1.08)" : "scale(1)",
              transition: "transform 0.2s",
            }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
            {/* Badge - 只在 badgeCount > 0 时显示 */}
            {item.badge > 0 && (
              <span style={{
                position: "absolute",
                top: 4,
                right: "50%",
                transform: "translateX(14px)",
                minWidth: 16,
                height: 16,
                padding: "0 5px",
                borderRadius: 9,
                background: "var(--red)",
                color: "white",
                fontSize: 10,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {item.badge}
              </span>
            )}
          </a>
        );
      })}
    </nav>
  );
}
