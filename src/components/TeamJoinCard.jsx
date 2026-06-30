import { useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useI18n } from "../locales/index.jsx";

/**
 * 加入团队卡片
 * 显示在个人资料页，供无团队的用户输入邀请码加入
 */
export default function TeamJoinCard() {
  const { user, authFetch } = useAuth();
  const { lang } = useI18n();
  const isZh = lang === "zh";

  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // 已有团队则不显示
  if (user?.team_id) return null;

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      setError(isZh ? "请输入邀请码" : "Please enter invite code");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // 先验证邀请码
      const verifyRes = await authFetch("/teams/verify-code", {
        method: "POST",
        body: JSON.stringify({ invite_code: inviteCode.trim().toUpperCase() }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || (isZh ? "邀请码无效" : "Invalid invite code"));
      }

      // 通过 authFetch 更新用户的 team_id
      const updateRes = await authFetch("/auth/join-team", {
        method: "POST",
        body: JSON.stringify({ invite_code: inviteCode.trim().toUpperCase() }),
      });
      const updateData = await updateRes.json();
      if (!updateRes.ok) {
        throw new Error(updateData.error || (isZh ? "加入失败" : "Join failed"));
      }

      setSuccess(isZh ? `已加入「${verifyData.team_name}」` : `Joined "${verifyData.team_name}"`);
      setInviteCode("");
      // 刷新页面以更新 user.team_id
      setTimeout(() => { window.location.reload(); }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 12, padding: "16px", marginBottom: 16,
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
        👥 {isZh ? "加入团队" : "Join Team"}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 12, lineHeight: 1.5 }}>
        {isZh
          ? "输入主教练提供的邀请码，加入团队后即可查看团队数据。"
          : "Enter the invite code from your head coach to join the team."
        }
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={inviteCode}
          onChange={(e) => { setInviteCode(e.target.value.toUpperCase()); setError(null); }}
          placeholder={isZh ? "输入邀请码" : "Enter code"}
          maxLength={6}
          style={{
            flex: 1, padding: "10px 12px",
            background: "var(--bg)", border: "1px solid var(--border)",
            borderRadius: 8, color: "var(--text)", fontFamily: "inherit",
            fontSize: 14, outline: "none", letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
          onKeyDown={(e) => { if (e.key === "Enter") handleJoin(); }}
        />
        <button
          onClick={handleJoin}
          disabled={loading || !inviteCode.trim()}
          style={{
            padding: "10px 16px", borderRadius: 8, border: "none",
            background: loading || !inviteCode.trim()
              ? "var(--text-dim)"
              : "linear-gradient(135deg, var(--accent), #C08830)",
            color: "var(--bg)", fontFamily: "inherit", fontSize: 13,
            fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "..." : (isZh ? "加入" : "Join")}
        </button>
      </div>

      {error && (
        <div style={{ fontSize: 12, color: "var(--red)", marginTop: 8 }}>{error}</div>
      )}
      {success && (
        <div style={{ fontSize: 12, color: "var(--green)", marginTop: 8 }}>✓ {success}</div>
      )}
    </div>
  );
}
