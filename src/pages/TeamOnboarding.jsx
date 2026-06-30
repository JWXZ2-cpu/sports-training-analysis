import { useState } from "react";
import { useI18n } from "../locales/index.jsx";
import { teamService } from "../services";

export default function TeamOnboarding({ onComplete }) {
  const { lang } = useI18n();
  const isZh = lang === "zh";

  const [step, setStep] = useState("create"); // "create" | "done"
  const [teamName, setTeamName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!teamName.trim()) {
      setError(isZh ? "请输入团队名称" : "Please enter team name");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await teamService.createTeam(teamName.trim());
      setInviteCode(data.team.invite_code);
      setStep("done");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}>
      <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
        {/* Logo */}
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: "linear-gradient(135deg, var(--accent), #C08830)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          marginBottom: 20,
        }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>

        {step === "create" ? (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: "0 0 8px" }}>
              {isZh ? "创建你的团队" : "Create Your Team"}
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 32px", lineHeight: 1.6 }}>
              {isZh
                ? "为你的团队命名，系统会生成邀请码，队员注册时输入邀请码即可加入。"
                : "Name your team. An invite code will be generated for athletes to join during registration."
              }
            </p>

            <div style={{ textAlign: "left", marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
                {isZh ? "团队名称" : "Team Name"}
              </label>
              <input
                value={teamName}
                onChange={(e) => { setTeamName(e.target.value); setError(null); }}
                placeholder={isZh ? "如：XX省中长跑队" : "e.g: City Track Club"}
                style={{
                  width: "100%", padding: "12px 14px",
                  background: "var(--card)", border: "1px solid var(--border)",
                  borderRadius: 10, color: "var(--text)", fontFamily: "inherit",
                  fontSize: 14, outline: "none", boxSizing: "border-box",
                }}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
              />
            </div>

            {error && (
              <div style={{
                background: "rgba(212,92,92,0.12)", border: "1px solid rgba(212,92,92,0.3)",
                borderRadius: 10, padding: "10px 14px", marginBottom: 16,
                color: "var(--red)", fontSize: 13, textAlign: "left",
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={loading}
              style={{
                width: "100%", padding: 14, borderRadius: 10, border: "none",
                background: loading ? "var(--text-dim)" : "linear-gradient(135deg, var(--accent), #C08830)",
                color: "var(--bg)", fontFamily: "inherit", fontSize: 14, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (isZh ? "创建中..." : "Creating...") : (isZh ? "创建团队" : "Create Team")}
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: "0 0 8px" }}>
              {isZh ? "团队创建成功！" : "Team Created!"}
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 28px", lineHeight: 1.6 }}>
              {isZh
                ? "把邀请码发给队员，注册时输入即可加入你的团队。"
                : "Share this invite code with your athletes. They enter it during registration to join your team."
              }
            </p>

            {/* 邀请码展示 */}
            <div style={{
              background: "var(--card)", border: "2px solid var(--accent)",
              borderRadius: 16, padding: "24px 20px", marginBottom: 24,
            }}>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {isZh ? "邀请码" : "Invite Code"}
              </div>
              <div style={{
                fontSize: 36, fontWeight: 700, color: "var(--accent)",
                letterSpacing: "0.2em", fontFamily: "var(--font-primary)",
              }}>
                {inviteCode}
              </div>
            </div>

            {/* 复制按钮 */}
            <button
              onClick={handleCopy}
              style={{
                width: "100%", padding: 14, borderRadius: 10, border: "1px solid var(--accent)",
                background: "transparent", color: "var(--accent)",
                fontFamily: "inherit", fontSize: 14, fontWeight: 600,
                cursor: "pointer", marginBottom: 12,
              }}
            >
              {copied
                ? (isZh ? "✓ 已复制" : "✓ Copied")
                : (isZh ? "复制邀请码" : "Copy Invite Code")
              }
            </button>

            <button
              onClick={onComplete}
              style={{
                width: "100%", padding: 14, borderRadius: 10, border: "none",
                background: "linear-gradient(135deg, var(--accent), #C08830)",
                color: "var(--bg)", fontFamily: "inherit", fontSize: 14, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {isZh ? "进入工作台" : "Enter Dashboard"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
