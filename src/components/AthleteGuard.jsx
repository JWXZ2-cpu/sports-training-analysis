import { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import AthleteOnboarding from "../pages/AthleteOnboarding.jsx";

const STORAGE_KEY = "athlete_onboarding_done";

const OnboardingContext = createContext({ done: null, refresh: () => {} });

export function useOnboarding() {
  return useContext(OnboardingContext);
}

export function resetOnboardingCache() {
  sessionStorage.removeItem(STORAGE_KEY);
}

/**
 * 运动员路由守卫
 * 包裹所有运动员页面，首次登录时强制进入体测流程
 * - 仅对 athlete 角色生效
 * - 非运动员角色（教练/队医等）直接放行
 * - 用 sessionStorage 缓存，整页刷新后仍生效
 */
export default function AthleteGuard({ children }) {
  const { user, authFetch } = useAuth();

  // 初始化：先检查 sessionStorage，有缓存就不请求 API
  const [status, setStatus] = useState(() => {
    if (user?.role !== "athlete") return "done";
    const cached = sessionStorage.getItem(STORAGE_KEY);
    if (cached === "done") return "done";
    return null; // 需要检查
  });

  useEffect(() => {
    if (user?.role !== "athlete") {
      setStatus("done");
      return;
    }

    // 已有缓存，不请求
    if (status === "done") return;

    // 请求 API 检查体测状态
    authFetch("/athlete/onboarding/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.hasPhysiology) {
          sessionStorage.setItem(STORAGE_KEY, "done");
          setStatus("done");
        } else {
          setStatus("pending");
        }
      })
      .catch(() => {
        sessionStorage.setItem(STORAGE_KEY, "done");
        setStatus("done");
      });
  }, [user?.id, user?.role]);

  if (user?.role !== "athlete") return children;

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

  if (status === "pending") {
    return (
      <OnboardingContext.Provider value={{ done: false, refresh: () => {} }}>
        <AthleteOnboarding onComplete={() => {
          sessionStorage.setItem(STORAGE_KEY, "done");
          setStatus("done");
        }} />
      </OnboardingContext.Provider>
    );
  }

  return (
    <OnboardingContext.Provider value={{ done: true, refresh: () => {} }}>
      {children}
    </OnboardingContext.Provider>
  );
}
