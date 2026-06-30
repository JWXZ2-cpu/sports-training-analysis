import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useI18n } from "../locales/index.jsx";
import { teamService } from "../services";
import { ROLE_LABELS } from "../styles/sharedStyles.js";


/**
 * MiMo 风格底部滑出个人资料面板
 */
export default function ProfileSheet({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { lang, t } = useI18n();
  const coachT = t.coach || {};
  const isZh = lang === "zh";
  const [teamInfo, setTeamInfo] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && user?.role === "head_coach") {
      teamService.getMyTeam().then((data) => setTeamInfo(data.team)).catch(() => {});
    }
  }, [isOpen, user?.role]);

  const handleLogout = () => {
    onClose();
    setTimeout(() => {
      logout();
      window.location.href = "/login";
    }, 300);
  };

  const handleCopy = () => {
    if (!teamInfo?.invite_code) return;
    navigator.clipboard.writeText(teamInfo.invite_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      {/* 遮罩层 */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 200,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* 面板 */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%",
        transform: isOpen ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(100%)",
        maxWidth: 430, width: "100%",
        background: "var(--surface)",
        borderRadius: "20px 20px 0 0",
        zIndex: 201,
        transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
        padding: "0 24px 20px",
        maxHeight: "85vh", overflowY: "auto",
      }}>
        {/* 拖拽手柄 */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px", cursor: "grab" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)" }} />
        </div>

        {/* 头像和姓名 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0 24px" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%", padding: 3,
            background: "linear-gradient(135deg, var(--accent), #E87040)",
            marginBottom: 16,
          }}>
            <div style={{
              width: "100%", height: "100%", borderRadius: "50%",
              background: "var(--card)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 700, color: "var(--accent)",
            }}>
              {user?.display_name?.[0] || "?"}
            </div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>
            {user?.display_name || (t.unknown || "未知")}
          </div>
          <span style={{
            marginTop: 6, fontSize: 12, fontWeight: 500, color: "var(--accent)",
            padding: "4px 14px", borderRadius: 20,
            background: "var(--accent-dim)", letterSpacing: "0.03em",
          }}>
            {ROLE_LABELS[user?.role] || user?.role}
          </span>
        </div>

        {/* 信息组 */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 0,
          border: "1px solid var(--border)", borderRadius: 10,
          overflow: "hidden", marginBottom: 24,
        }}>
          <InfoRow label={coachT.accountName || "账号名"} value={user?.username || "--"} />
          <InfoRow label={coachT.roleLabel || "角色"} value={ROLE_LABELS[user?.role] || user?.role} />
          <InfoRow label={coachT.userId || "用户 ID"} value={user?.id || "--"} />
        </div>

        {/* 团队管理入口（仅主教练） */}
        {user?.role === "head_coach" && teamInfo && (
          <div
            onClick={() => { onClose(); setTimeout(() => { window.location.href = "/coach/team"; }, 300); }}
            style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 10, padding: "14px 16px", marginBottom: 24,
              cursor: "pointer", transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                👥 {teamInfo.name}
              </span>
              <span style={{ fontSize: 12, color: "var(--text-dim)" }}>›</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{
                fontSize: 16, fontWeight: 700, color: "var(--accent)",
                letterSpacing: "0.15em", fontFamily: "var(--font-primary)",
              }}>
                {teamInfo.invite_code}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
                {teamInfo.members?.length || 0} {isZh ? "名成员" : "members"}
              </span>
            </div>
          </div>
        )}

        {/* 退出登录 */}
        <button onClick={handleLogout} style={{
          width: "100%", padding: 15,
          border: "none",
          borderRadius: 10,
          background: "linear-gradient(135deg, var(--red) 0%, #B84040 100%)",
          color: "#F0EBE0", fontFamily: "inherit", fontSize: 14,
          fontWeight: 600, cursor: "pointer", letterSpacing: "0.01em",
          marginBottom: 8, transition: "all 0.2s ease",
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 0 30px rgba(212,92,92,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {coachT.logout || "退出登录"}
        </button>
      </div>
    </>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "15px 16px",
      borderBottom: "1px solid var(--border)",
    }}>
      <span style={{ fontSize: 13, color: "var(--text-dim)", fontWeight: 400 }}>{label}</span>
      <span style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}
