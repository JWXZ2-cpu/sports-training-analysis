/**
 * 助教个人资料 Sheet 弹窗
 */
import { useI18n } from "../locales/index.jsx";
import TeamJoinCard from "../components/TeamJoinCard.jsx";

export default function AssistantProfileSheet({ user, onClose, onLogout }) {
  const { t } = useI18n();
  const assistantT = t.assistant || {};

  return (
    <>
      <div className="sheet-overlay open" onClick={onClose} />
      <div className="sheet open">
        <div className="sheet-handle-area" onClick={onClose}>
          <div className="sheet-handle" />
        </div>
        <div className="sheet-header">
          <div className="sheet-avatar-ring">
            <div className="sheet-avatar">{user.display_name?.[0]}</div>
          </div>
          <div className="sheet-name">{user.display_name}</div>
          <span className="sheet-role">{assistantT.role || "助教"}</span>
        </div>
        <div className="sheet-info-group">
          <div className="sheet-info-row">
            <span className="sheet-info-label">{assistantT.accountName || "账号名"}</span>
            <span className="sheet-info-value">{user.display_name}</span>
          </div>
          <div className="sheet-info-row">
            <span className="sheet-info-label">{assistantT.roleLabel || "角色"}</span>
            <span className="sheet-info-value">{assistantT.role || "助教"}</span>
          </div>
          <div className="sheet-info-row">
            <span className="sheet-info-label">{assistantT.userId || "用户 ID"}</span>
            <span className="sheet-info-value">{user.id}</span>
          </div>
        </div>
        {/* 加入团队（无团队时显示） */}
        {!user?.team_id && (
          <div style={{ marginBottom: 12 }}>
            <TeamJoinCard />
          </div>
        )}
        <button className="sheet-logout" onClick={onLogout}>{assistantT.logout || "退出登录"}</button>
      </div>
    </>
  );
}
