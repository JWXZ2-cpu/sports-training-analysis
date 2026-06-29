import { useAuth } from "../contexts/AuthContext.jsx";

const ROLE_CONFIG = {
  assistant: { icon: "📋", title: "助教工作台", desc: "查看运动员数据 · 添加训练备注 · 执行训练计划" },
  doctor: { icon: "🏥", title: "队医工作台", desc: "伤病管理 · 治疗记录 · 治疗-训练协调" },
  manager: { icon: "📈", title: "管理工作台", desc: "团队概览 · 出勤统计 · 训练完成率" },
};

export default function RolePlaceholder() {
  const { user, logout } = useAuth();
  const config = ROLE_CONFIG[user.role] || { icon: "🏠", title: "工作台", desc: "" };

  return (
    <div style={{ fontFamily: "var(--font-primary)", fontSize: 13, color: "var(--text)", minHeight: "100vh" }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: "0.5px solid var(--border)",
        background: "#fff", position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{config.icon} {config.title}</span>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>| {user.display_name}</span>
        </div>
        <button onClick={logout} style={{
          padding: "5px 12px", borderRadius: 6, border: "0.5px solid var(--border)",
          background: "transparent", fontSize: 12, cursor: "pointer", color: "var(--red)",
        }}>退出</button>
      </div>

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        minHeight: "60vh", padding: 20,
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{config.icon}</div>
        <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{config.title}</div>
        <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>{config.desc}</div>
        <div style={{
          background: "var(--surface)", borderRadius: 12, padding: "20px 28px",
          border: "1px dashed var(--border)", textAlign: "center", color: "var(--text-dim)",
          maxWidth: 400,
        }}>
          <div style={{ fontSize: 16, marginBottom: 8 }}>🚧 功能开发中</div>
          <div style={{ fontSize: 12 }}>
            该角色的核心功能正在开发中，敬请期待
          </div>
        </div>
      </div>
    </div>
  );
}
