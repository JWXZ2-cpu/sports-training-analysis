import { useAuth } from "../contexts/AuthContext.jsx";
import BottomNav from "../components/BottomNav.jsx";

export default function MyProfile() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div style={{ fontFamily: "var(--font-primary)", fontSize: 13, color: "var(--text-primary)", minHeight: "100vh", paddingBottom: 60 }}>
      {/* 顶部 */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "12px 16px", borderBottom: "1px solid var(--border-default)",
        background: "var(--bg-card)", position: "sticky", top: 0, zIndex: 10,
      }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>我的</span>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "16px" }}>
        {/* 个人信息卡片 */}
        <div style={{
          background: "var(--bg-card)", borderRadius: 12, padding: "20px",
          border: "1px solid var(--border-default)", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-light))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, color: "var(--bg-card)", fontWeight: 600,
          }}>
            {user?.display_name?.[0] || "?"}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{user?.display_name || "未知"}</div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>运动员</div>
          </div>
        </div>

        {/* 账号信息 */}
        <div style={{
          background: "var(--bg-card)", borderRadius: 12, padding: "14px 16px",
          border: "1px solid var(--border-default)", marginBottom: 16,
        }}>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500, marginBottom: 10 }}>账号信息</div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ color: "var(--text-secondary)" }}>账号名</span>
            <span style={{ fontWeight: 500 }}>{user?.username || "--"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ color: "var(--text-secondary)" }}>角色</span>
            <span style={{ fontWeight: 500 }}>运动员</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
            <span style={{ color: "var(--text-secondary)" }}>用户ID</span>
            <span style={{ fontWeight: 500, color: "var(--text-tertiary)" }}>{user?.id || "--"}</span>
          </div>
        </div>

        {/* 退出登录 */}
        <button onClick={handleLogout} style={{
          width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
          background: "var(--color-danger-bg)", color: "var(--color-danger)", fontSize: 15, fontWeight: 500,
          cursor: "pointer",
        }}>
          退出登录
        </button>
      </div>

      <BottomNav active="profile" badgeCount={0} />
    </div>
  );
}
