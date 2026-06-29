import { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import AthleteOnboarding from "../pages/AthleteOnboarding.jsx";

// 全局缓存 onboarding 状态，避免每次路由切换都请求
const OnboardingContext = createContext({ done: null, refresh: () => {} });

export function useOnboarding() {
  return useContext(OnboardingContext);
}

/**
 * 运动员路由守卫
 * 包裹所有运动员页面，首次登录时强制进入体测流程
 * - 仅对 athlete 角色生效
 * - 非运动员角色（教练/队医等）直接放行
 * - 缓存检查结果，路由切换不重复请求
 */
export default function AthleteGuard({ children }) {
  const { user, authFetch } = useAuth();
  const [status, setStatus] = useState(null); // null=检查中, "pending"=未完成, "done"=已完成

  const checkStatus = () => {
    if (user?.role !== "athlete") {
      setStatus("done");
      return;
    }
    authFetch("/api/athlete/onboarding/status")
      .then((res) => res.json())
      .then((data) => setStatus(data.hasPhysiology ? "done" : "pending"))
      .catch(() => setStatus("done")); // 出错时放行
  };

  useEffect(() => {
    checkStatus();
  }, [user?.role]);

  // 非运动员直接放行
  if (user?.role !== "athlete") {
    return children;
  }

  // 检查中
  if (status === null) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--bg)",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>⏳</div>
          <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>加载中...</div>
        </div>
      </div>
    );
  }

  // 未完成体测 → 强制展示 onboarding
  if (status === "pending") {
    return (
      <OnboardingContext.Provider value={{ done: false, refresh: checkStatus }}>
        <AthleteOnboarding onComplete={() => setStatus("done")} />
      </OnboardingContext.Provider>
    );
  }

  // 已完成 → 正常渲染
  return (
    <OnboardingContext.Provider value={{ done: true, refresh: checkStatus }}>
      {children}
    </OnboardingContext.Provider>
  );
}
