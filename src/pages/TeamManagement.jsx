import { useState, useEffect } from "react";
import { useI18n } from "../locales/index.jsx";
import { teamService } from "../services";

const ROLE_LABELS_MAP = {
  zh: {
    head_coach: "主教练",
    assistant: "助教",
    doctor: "队医",
    athlete: "运动员",
    manager: "管理人员",
  },
  en: {
    head_coach: "Head Coach",
    assistant: "Assistant",
    doctor: "Doctor",
    athlete: "Athlete",
    manager: "Manager",
  },
  it: {
    head_coach: "Allenatore",
    assistant: "Assistente",
    doctor: "Medico",
    athlete: "Atleta",
    manager: "Manager",
  },
};

const ROLE_ICONS = {
  head_coach: "📋",
  assistant: "🤝",
  doctor: "🩺",
  athlete: "🏃",
  manager: "👔",
};

export default function TeamManagement({ onBack }) {
  const { lang } = useI18n();
  const isZh = lang === "zh";
  const roleLabels = ROLE_LABELS_MAP[lang] || ROLE_LABELS_MAP.zh;

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);

  useEffect(() => { fetchTeam(); }, []);

  const fetchTeam = async () => {
    try {
      const data = await teamService.getMyTeam();
      setTeam(data.team);
    } catch {} finally { setLoading(false); }
  };

  const handleCopy = () => {
    if (!team?.invite_code) return;
    navigator.clipboard.writeText(team.invite_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const data = await teamService.regenerateInviteCode();
      setTeam((prev) => ({ ...prev, invite_code: data.invite_code }));
      setShowRegenConfirm(false);
    } catch (err) {
      alert(err.message);
    } finally { setRegenerating(false); }
  };

  // 按角色分组成员
  const membersByRole = {};
  if (team?.members) {
    team.members.forEach((m) => {
      if (!membersByRole[m.role]) membersByRole[m.role] = [];
      membersByRole[m.role].push(m);
    });
  }
  const roleOrder = ["head_coach", "assistant", "doctor", "athlete", "manager"];

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>⏳</div>
          <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>{isZh ? "加载中..." : "Loading..."}</div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>👥</div>
          <div style={{ fontSize: 16, color: "var(--text-secondary)" }}>{isZh ? "暂无团队信息" : "No team found"}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "20px 16px 0" }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", color: "var(--accent)",
          fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: 0,
        }}>
          ← {isZh ? "返回" : "Back"}
        </button>
      </div>

      <div style={{ padding: "16px", maxWidth: 430, margin: "0 auto" }}>
        {/* 团队名称 */}
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: "0 0 20px" }}>
          {team.name}
        </h1>

        {/* 邀请码卡片 */}
        <div style={{
          background: "var(--card)", border: "1px solid var(--accent)",
          borderRadius: 16, padding: "20px", marginBottom: 20,
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 12,
          }}>
            <span style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {isZh ? "邀请码" : "Invite Code"}
            </span>
            <button
              onClick={() => setShowRegenConfirm(true)}
              style={{
                background: "none", border: "none", color: "var(--text-dim)",
                fontSize: 11, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {isZh ? "重新生成" : "Regenerate"}
            </button>
          </div>

          <div style={{
            fontSize: 32, fontWeight: 700, color: "var(--accent)",
            letterSpacing: "0.2em", fontFamily: "var(--font-primary)",
            textAlign: "center", marginBottom: 16,
          }}>
            {team.invite_code}
          </div>

          <button
            onClick={handleCopy}
            style={{
              width: "100%", padding: 12, borderRadius: 10,
              border: "1px solid var(--accent)", background: "transparent",
              color: "var(--accent)", fontFamily: "inherit", fontSize: 13,
              fontWeight: 600, cursor: "pointer",
            }}
          >
            {copied ? (isZh ? "✓ 已复制到剪贴板" : "✓ Copied") : (isZh ? "复制邀请码" : "Copy Invite Code")}
          </button>
        </div>

        {/* 成员统计 */}
        <div style={{
          display: "flex", gap: 10, marginBottom: 20,
        }}>
          {roleOrder.map((role) => {
            const count = membersByRole[role]?.length || 0;
            if (count === 0) return null;
            return (
              <div key={role} style={{
                flex: 1, padding: "12px 8px", background: "var(--card)",
                border: "1px solid var(--border)", borderRadius: 10,
                textAlign: "center",
              }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>{count}</div>
                <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>{roleLabels[role]}</div>
              </div>
            );
          })}
        </div>

        {/* 成员列表 */}
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>
          {isZh ? "团队成员" : "Team Members"} ({team.members?.length || 0})
        </div>

        <div style={{
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: 12, overflow: "hidden",
        }}>
          {roleOrder.map((role) => {
            const members = membersByRole[role];
            if (!members?.length) return null;
            return (
              <div key={role}>
                {/* 角色分组标题 */}
                <div style={{
                  padding: "10px 16px", fontSize: 11, fontWeight: 600,
                  color: "var(--text-dim)", background: "rgba(255,255,255,0.02)",
                  borderBottom: "1px solid var(--border)",
                  textTransform: "uppercase", letterSpacing: "0.05em",
                }}>
                  {ROLE_ICONS[role]} {roleLabels[role]} ({members.length})
                </div>
                {/* 成员行 */}
                {members.map((m, i) => (
                  <div key={m.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 16px",
                    borderBottom: i < members.length - 1 ? "1px solid var(--border)" : "none",
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "var(--accent-dim)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 600, color: "var(--accent)", flexShrink: 0,
                    }}>
                      {m.display_name?.[0] || "?"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>
                        {m.display_name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                        @{m.username}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* 重新生成确认弹窗 */}
      {showRegenConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }} onClick={(e) => { if (e.target === e.currentTarget) setShowRegenConfirm(false); }}>
          <div style={{
            background: "var(--surface)", borderRadius: 16,
            padding: "24px 20px", maxWidth: 340, width: "100%", textAlign: "center",
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
              {isZh ? "重新生成邀请码？" : "Regenerate Invite Code?"}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.5 }}>
              {isZh
                ? "旧的邀请码将立即失效，已加入的成员不受影响。"
                : "The old code will expire immediately. Existing members won't be affected."
              }
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowRegenConfirm(false)}
                style={{
                  flex: 1, padding: 12, borderRadius: 10,
                  border: "1px solid var(--border)", background: "var(--card)",
                  color: "var(--text-secondary)", fontFamily: "inherit", fontSize: 13,
                  fontWeight: 500, cursor: "pointer",
                }}
              >
                {isZh ? "取消" : "Cancel"}
              </button>
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                style={{
                  flex: 1, padding: 12, borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg, var(--red), #B84040)",
                  color: "#fff", fontFamily: "inherit", fontSize: 13,
                  fontWeight: 600, cursor: regenerating ? "not-allowed" : "pointer",
                }}
              >
                {regenerating ? "..." : (isZh ? "确认重新生成" : "Regenerate")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
