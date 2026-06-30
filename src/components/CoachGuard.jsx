import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { teamService } from "../services";
import TeamOnboarding from "../pages/TeamOnboarding.jsx";

const STORAGE_KEY = "coach_team_done";

/**
 * 主教练路由守卫
 * 检测是否已创建团队，未创建则强制进入团队创建流程
 */
export default function CoachGuard({ children }) {
  const { user } = useAuth();
  const [status, setStatus] = useState(() => {
    if (user?.role !== "head_coach") return "done";
    const cached = sessionStorage.getItem(STORAGE_KEY);
    if (cached === "done") return "done";
    return null;
  });

  useEffect(() => {
    if (user?.role !== "head_coach") {
      setStatus("done");
      return;
    }
    if (status === "done") return;

    teamService.getMyTeam()
      .then((data) => {
        if (data.team) {
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

  if (user?.role !== "head_coach") return children;

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
    return <TeamOnboarding onComplete={() => {
      sessionStorage.setItem(STORAGE_KEY, "done");
      setStatus("done");
    }} />;
  }

  return children;
}
