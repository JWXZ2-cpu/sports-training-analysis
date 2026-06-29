import { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import AthleteOnboarding from "../pages/AthleteOnboarding.jsx";

// 模块级缓存：跨路由实例共享，避免每次切换页面重新检查
let _cachedStatus = null; // null=未检查, "pending"=未完成, "done"=已完成
let _cachedUserId = null; // 记录是哪个用户的缓存，登出后重置

export function resetOnboardingCache() {
  _cachedStatus = null;
  _cachedUserId = null;
}

const OnboardingContext = createContext({ done: null, refresh: () => {} });

export function useOnboarding() {
  return useContext(OnboardingContext);
}

/**
 * 运动员路由守卫
 * 包裹所有运动员页面，首次登录时强制进入体测流程
 * - 仅对 athlete 角色生效
 * - 非运动员角色（教练/队医等）直接放行
 * - 模块级缓存检查结果，路由切换不重复请求
 */
export default function AthleteGuard({ children }) {
  const { user, authFetch } = useAuth();
  const [status, setStatus] = useState(() => {
    // 如果有缓存且是同一用户，直接用缓存
    if (_cachedStatus && _cachedUserId === user?.id) return _cachedStatus;
    return null; // 需要检查
  });

  useEffect(() => {
    // 非运动员不需要检查
    if (user?.role !== "athlete") {
      setStatus("done");
      return;
    }

    // 已有缓存且是同一用户，直接用
    if (_cachedStatus && _cachedUserId === user?.id) {
      setStatus(_cachedStatus);
      return;
    }

    // 需要请求 API
    authFetch("/athlete/onboarding/status")
      .then((res) => res.json())
      .then((data) => {
        const newStatus = data.hasPhysiology ? "done" : "pending";
        _cachedStatus = newStatus;
        _cachedUserId = user?.id;
        setStatus(newStatus);
      })
      .catch(() => {
        _cachedStatus = "done";
        _cachedUserId = user?.id;
        setStatus("done");
      });
  }, [user?.id, user?.role]);

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
      <OnboardingContext.Provider value={{ done: false, refresh: () => {} }}>
        <AthleteOnboarding onComplete={() => {
          _cachedStatus = "done";
          setStatus("done");
        }} />
      </OnboardingContext.Provider>
    );
  }

  // 已完成 → 正常渲染
  return (
    <OnboardingContext.Provider value={{ done: true, refresh: () => {} }}>
      {children}
    </OnboardingContext.Provider>
  );
}
