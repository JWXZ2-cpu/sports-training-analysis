import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useI18n } from "../locales/index.jsx";
import Login from "../pages/Login.jsx";
import { ROLE_HOME } from "../styles/sharedStyles.js";


export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const { t } = useI18n();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--surface)",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>⏳</div>
          <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>{t.loading || "加载中..."}</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // 角色不匹配时自动跳转到对应首页，不显示错误弹窗
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    window.location.href = ROLE_HOME[user.role] || "/";
    return null;
  }

  return children;
}
