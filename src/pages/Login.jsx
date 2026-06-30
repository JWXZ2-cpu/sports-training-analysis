import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useI18n } from "../locales/index.jsx";
import LanguageSwitch from "../components/LanguageSwitch.jsx";
import '../styles/auth-pages.css';

const ROLE_OPTIONS_MAP = {
  zh: [
    { key: "athlete", icon: "🏃", label: "运动员" },
    { key: "head_coach", icon: "📋", label: "主教练" },
    { key: "doctor", icon: "🩺", label: "队医" },
    { key: "assistant", icon: "🤝", label: "助教" },
    { key: "manager", icon: "👔", label: "管理人员", fiveCol: true },
  ],
  en: [
    { key: "athlete", icon: "🏃", label: "Athlete" },
    { key: "head_coach", icon: "📋", label: "Head Coach" },
    { key: "doctor", icon: "🩺", label: "Doctor" },
    { key: "assistant", icon: "🤝", label: "Assistant" },
    { key: "manager", icon: "👔", label: "Manager", fiveCol: true },
  ],
  it: [
    { key: "athlete", icon: "🏃", label: "Atleta" },
    { key: "head_coach", icon: "📋", label: "Allenatore" },
    { key: "doctor", icon: "🩺", label: "Medico" },
    { key: "assistant", icon: "🤝", label: "Assistente" },
    { key: "manager", icon: "👔", label: "Manager", fiveCol: true },
  ],
};

export default function Login() {
  const { login, register } = useAuth();
  const { lang, t } = useI18n();
  const authT = t.auth || {};
  const ROLE_OPTIONS = ROLE_OPTIONS_MAP[lang] || ROLE_OPTIONS_MAP.zh;
  const [isRegister, setIsRegister] = useState(false);

  // 登录表单
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginShowPwd, setLoginShowPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginErrors, setLoginErrors] = useState({});
  const [loginLoading, setLoginLoading] = useState(false);

  // 注册表单
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regShowPwd, setRegShowPwd] = useState(false);
  const [regShowConfirm, setRegShowConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [regErrors, setRegErrors] = useState({});
  const [regLoading, setRegLoading] = useState(false);

  // Toast
  const [errorToast, setErrorToast] = useState({ show: false, msg: "" });
  const [successToast, setSuccessToast] = useState({ show: false, msg: "" });
  const [successOverlay, setSuccessOverlay] = useState({ show: false, role: "" });

  // 页面切换动画
  const loginRef = useRef(null);
  const registerRef = useRef(null);

  const switchToRegister = () => {
    setIsRegister(false);
    setTimeout(() => setIsRegister(true), 10);
  };

  const switchToLogin = () => {
    setIsRegister(true);
    setTimeout(() => setIsRegister(false), 10);
  };

  // 显示 Toast
  const showErrorToast = (msg) => {
    setErrorToast({ show: true, msg });
    setTimeout(() => setErrorToast({ show: false, msg: "" }), 3000);
  };

  const showSuccessToast = (msg) => {
    setSuccessToast({ show: true, msg });
    setTimeout(() => setSuccessToast({ show: false, msg: "" }), 3000);
  };

  // 登录处理
  const handleLogin = async () => {
    const errors = {};
    if (!loginUsername.trim()) errors.username = authT.usernameRequired || "请输入用户名";
    if (!loginPassword.trim()) errors.password = authT.passwordRequired || "请输入密码";
    setLoginErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoginLoading(true);
    try {
      await login(loginUsername, loginPassword);
    } catch (err) {
      showErrorToast(err.message || (authT.loginFailed || "用户名或密码错误"));
    } finally {
      setLoginLoading(false);
    }
  };

  // 注册处理
  const handleRegister = async () => {
    const errors = {};
    if (!regUsername.trim()) errors.username = authT.usernameRequired || "请输入用户名";
    if (!regPassword.trim() || regPassword.length < 6) errors.password = authT.passwordRequired || "请输入密码（至少6位）";
    if (regConfirm !== regPassword) errors.confirm = authT.passwordMismatch || "两次密码不一致";
    if (!selectedRole) errors.role = authT.roleRequired || "请选择身份";
    setRegErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setRegLoading(true);
    try {
      await register(regUsername, regPassword, regUsername, selectedRole, inviteCode || undefined);
      const roleLabel = ROLE_OPTIONS.find(r => r.key === selectedRole)?.label || selectedRole;
      setSuccessOverlay({ show: true, role: roleLabel });
    } catch (err) {
      showErrorToast(err.message || (authT.registerFailed || "注册失败"));
    } finally {
      setRegLoading(false);
    }
  };

  // Enter 键提交
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Enter") {
        if (isRegister) handleRegister();
        else handleLogin();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isRegister, loginUsername, loginPassword, regUsername, regPassword, regConfirm, selectedRole, inviteCode]);

  // 清除错误
  const clearLoginError = (field) => {
    setLoginErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  const clearRegError = (field) => {
    setRegErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 20, overflow: "hidden" }}>
      <div className="auth-grain" />
      <div className="auth-bg-glow" />

      <div className="auth-page-wrap">
        {/* Logo 区域 */}
        <div className="auth-logo-area">
          <div className="auth-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div className="auth-logo-title">脉</div>
          <div className="auth-logo-sub">M<span style={{ opacity: 0.8 }}>ovement</span> · A<span style={{ opacity: 0.8 }}>nalysis</span> · I<span style={{ opacity: 0.8 }}>ntelligence</span></div>
          <div style={{ marginTop: 16, fontSize: 12, fontWeight: 300, color: "var(--text-dim)", letterSpacing: "0.3em", fontFamily: "var(--font-primary)" }}>
            你的训练，脉络清晰
          </div>
        </div>

        {/* ===== 登录页面 ===== */}
        {!isRegister && (
          <div className="auth-page active" ref={loginRef}>
            <div className="auth-card">
              <div className="auth-card-title" style={{ textAlign: "center", marginBottom: 20 }}>{authT.loginTitle || "登录您的账户"}</div>

              {/* 用户名 */}
              <div className="auth-field">
                <div className="auth-field-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  {authT.username || "用户名"}
                </div>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    className={`auth-field-input${loginErrors.username ? " error" : ""}`}
                    placeholder={authT.usernamePlaceholder || "请输入用户名"}
                    value={loginUsername}
                    onChange={(e) => { setLoginUsername(e.target.value); clearLoginError("username"); }}
                    autoComplete="username"
                  />
                </div>
                <div className={`auth-field-error${loginErrors.username ? " show" : ""}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{loginErrors.username}</span>
                </div>
              </div>

              {/* 密码 */}
              <div className="auth-field">
                <div className="auth-field-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  {authT.password || "密码"}
                </div>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type={loginShowPwd ? "text" : "password"}
                    className={`auth-field-input${loginErrors.password ? " error" : ""}`}
                    placeholder={authT.passwordPlaceholder || "请输入密码"}
                    value={loginPassword}
                    onChange={(e) => { setLoginPassword(e.target.value); clearLoginError("password"); }}
                    autoComplete="current-password"
                  />
                  <button className="auth-pwd-toggle" onClick={() => setLoginShowPwd(!loginShowPwd)} type="button">
                    {loginShowPwd ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className={`auth-field-error${loginErrors.password ? " show" : ""}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{loginErrors.password}</span>
                </div>
              </div>

              {/* 记住我 & 忘记密码 */}
              <div className="auth-field-row">
                <div className="auth-remember-wrap" onClick={() => setRememberMe(!rememberMe)}>
                  <div className={`auth-remember-checkbox${rememberMe ? " checked" : ""}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="auth-remember-text">{authT.rememberMe || "记住我"}</span>
                </div>
                <button className="auth-forgot-link" onClick={() => showErrorToast(authT.contactAdmin || "请联系管理员重置密码")}>{authT.forgotPassword || "忘记密码？"}</button>
              </div>

              {/* 语言切换 */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <LanguageSwitch />
              </div>

              {/* 登录按钮 */}
              <button className={`auth-submit-btn${loginLoading ? " loading" : ""}`} onClick={handleLogin}>
                {authT.login || "登录"}
                <div className="auth-spinner" />
              </button>
            </div>

            <div className="auth-footer-link">
              <span className="auth-footer-link-text">{authT.noAccount || "没有账户？"}<a onClick={switchToRegister}>{authT.goRegister || "去注册"}</a></span>
            </div>
          </div>
        )}

        {/* ===== 注册页面 ===== */}
        {isRegister && (
          <div className="auth-page active" ref={registerRef}>
            <div className="auth-card">
              <div className="auth-card-title" style={{ textAlign: "center", marginBottom: 20 }}>{authT.registerTitle || "创建新账户"}</div>

              {/* 用户名 */}
              <div className="auth-field">
                <div className="auth-field-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  {authT.username || "用户名"}
                </div>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    className={`auth-field-input${regErrors.username ? " error" : ""}`}
                    placeholder={authT.usernamePlaceholder || "请输入用户名"}
                    value={regUsername}
                    onChange={(e) => { setRegUsername(e.target.value); clearRegError("username"); }}
                    autoComplete="off"
                  />
                </div>
                <div className={`auth-field-error${regErrors.username ? " show" : ""}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{regErrors.username}</span>
                </div>
              </div>

              {/* 密码 */}
              <div className="auth-field">
                <div className="auth-field-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  {authT.password || "密码"}
                </div>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type={regShowPwd ? "text" : "password"}
                    className={`auth-field-input${regErrors.password ? " error" : ""}`}
                    placeholder={authT.passwordPlaceholder || "请输入密码"}
                    value={regPassword}
                    onChange={(e) => { setRegPassword(e.target.value); clearRegError("password"); }}
                    autoComplete="new-password"
                  />
                  <button className="auth-pwd-toggle" onClick={() => setRegShowPwd(!regShowPwd)} type="button">
                    {regShowPwd ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className={`auth-field-error${regErrors.password ? " show" : ""}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{regErrors.password}</span>
                </div>
              </div>

              {/* 确认密码 */}
              <div className="auth-field">
                <div className="auth-field-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  {authT.confirmPassword || "确认密码"}
                </div>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type={regShowConfirm ? "text" : "password"}
                    className={`auth-field-input${regErrors.confirm ? " error" : ""}`}
                    placeholder={authT.confirmPasswordPlaceholder || "请再次输入密码"}
                    value={regConfirm}
                    onChange={(e) => { setRegConfirm(e.target.value); clearRegError("confirm"); }}
                    autoComplete="new-password"
                  />
                  <button className="auth-pwd-toggle" onClick={() => setRegShowConfirm(!regShowConfirm)} type="button">
                    {regShowConfirm ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className={`auth-field-error${regErrors.confirm ? " show" : ""}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{regErrors.confirm}</span>
                </div>
              </div>

              {/* 身份选择 */}
              <div className="auth-field">
                <div className="auth-role-grid-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  {authT.selectRole || "选择身份"}
                </div>
                <div className="auth-role-grid">
                  {ROLE_OPTIONS.map((role) => (
                    <button
                      key={role.key}
                      className={`auth-role-option${selectedRole === role.key ? " selected" : ""}${role.fiveCol ? " five-col" : ""}`}
                      onClick={() => { setSelectedRole(role.key); clearRegError("role"); }}
                    >
                      <div className="auth-role-option-check">
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className="auth-role-option-icon">{role.icon}</span>
                      <span className="auth-role-option-label">{role.label}</span>
                    </button>
                  ))}
                </div>
                <div className={`auth-field-error${regErrors.role ? " show" : ""}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{regErrors.role}</span>
                </div>
              </div>

              {/* 邀请码 */}
              <div className="auth-field">
                <div className="auth-field-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  {lang === "zh" ? "团队邀请码（选填）" : lang === "it" ? "Codice Invito Squadra (opzionale)" : "Team Invite Code (optional)"}
                </div>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type="text"
                    className="auth-field-input"
                    placeholder={lang === "zh" ? "输入邀请码加入团队" : lang === "it" ? "Inserisci codice per unirti" : "Enter code to join team"}
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    autoComplete="off"
                    style={{ textTransform: "uppercase", letterSpacing: "0.15em" }}
                  />
                </div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4, paddingLeft: 4 }}>
                  {lang === "zh"
                    ? "主教练可留空，注册后创建团队"
                    : lang === "it"
                      ? "L'allenatore può lasciare vuoto, crea squadra dopo"
                      : "Head coach can leave empty, create team after"
                  }
                </div>
              </div>

              {/* 语言切换 */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16, marginTop: 16 }}>
                <LanguageSwitch />
              </div>

              {/* 注册按钮 */}
              <button className={`auth-submit-btn${regLoading ? " loading" : ""}`} onClick={handleRegister} style={{ marginTop: 28 }}>
                {authT.register || "注册"}
                <div className="auth-spinner" />
              </button>
            </div>

            <div className="auth-footer-link">
              <span className="auth-footer-link-text">{authT.hasAccount || "已有账户？"}<a onClick={switchToLogin}>{authT.goLogin || "去登录"}</a></span>
            </div>
          </div>
        )}
      </div>

      {/* Error Toast */}
      <div className={`auth-error-toast${errorToast.show ? " show" : ""}`}>
        <svg className="auth-error-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span className="auth-error-toast-text">{errorToast.msg}</span>
      </div>

      {/* Success Toast */}
      <div className={`auth-success-toast${successToast.show ? " show" : ""}`}>
        <svg className="auth-success-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <span className="auth-success-toast-text">{successToast.msg}</span>
      </div>

      {/* Success Overlay */}
      <div className={`auth-success-overlay${successOverlay.show ? " show" : ""}`}>
        <div className="auth-success-check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="auth-success-text">{authT.registerSuccess || "注册成功"}</div>
        <div className="auth-success-sub">{authT.registeredAs || "您已注册为"}{successOverlay.role}，{authT.enteringSystem || "正在进入系统..."}</div>
      </div>
    </div>
  );
}
