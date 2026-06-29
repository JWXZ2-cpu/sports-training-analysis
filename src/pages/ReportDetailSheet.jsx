/**
 * 报告详情 Sheet 弹窗
 */
import { useState } from "react";
import { useI18n } from "../locales/index.jsx";
import TranslateButton from "../components/TranslateButton.jsx";

export default function ReportDetailSheet({
  report,
  noteContent,
  onNoteContentChange,
  onSubmitNote,
  noteSaving,
  voiceRecording,
  onVoiceToggle,
  onClose,
  onBack,
}) {
  const { t } = useI18n();
  const assistantT = t.assistant || {};
  const resultT = t.result || {};
  const session = report?.session || {};
  const aiReport = report?.report || {};
  const [displayReport, setDisplayReport] = useState(null);

  // 使用翻译后的报告或原始报告
  const currentReport = displayReport || aiReport;

  return (
    <>
      <div className="sheet-overlay open" onClick={onClose} />
      <div className="sheet report-sheet open">
        <div className="sheet-handle-area" onClick={onClose}>
          <div className="sheet-handle" />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button className="report-back" onClick={onBack}>← {assistantT.backToTrainingRecords || "返回训练记录"}</button>
          {aiReport && Object.keys(aiReport).length > 0 && (
            <TranslateButton
              report={aiReport}
              onTranslated={(translated, lang) => {
                setDisplayReport(translated);
              }}
            />
          )}
        </div>

        {/* Hero 区域 */}
        <div className="report-hero">
          <div className="report-hero-name">{session.athlete_name}</div>
          <div className="report-hero-date">{session.session_date} · {session.session_name || (assistantT.trainingSession || "训练")}</div>
          <div className="report-hero-score">
            {session.overall_score || "--"}<span className="unit"> / 10</span>
          </div>
          <div className="report-hero-row">
            <div className="report-hero-stat">
              <div className="report-hero-stat-num" style={{ color: "var(--green)" }}>
                {t.statusLevel?.[session.status_level] || session.status_level || (resultT.trainingQualityLabel === "Training Quality" ? "Good" : "良好")}
              </div>
              <div className="report-hero-stat-label">{resultT.trainingQualityLabel || "训练质量"}</div>
            </div>
            <div className="report-hero-stat">
              <div className="report-hero-stat-num" style={{ color: "var(--accent)" }}>
                {session.training_zone || "E"}
              </div>
              <div className="report-hero-stat-label">{resultT.trainingZoneLabel || "强度区间"}</div>
            </div>
            <div className="report-hero-stat">
              <div className="report-hero-stat-num" style={{ color: "var(--blue)" }}>
                {session.vdot || "--"}
              </div>
              <div className="report-hero-stat-label">{resultT.vdotLabel || "VDOT 估算"}</div>
            </div>
          </div>
        </div>

        {/* 预警提示 */}
        {session.risk_flag && (
          <div className="report-alert">
            <div className="report-alert-icon">🚨</div>
            <div>
              <div className="report-alert-title">{resultT.riskAlert || "需立即关注"}</div>
              <div className="report-alert-text">{session.risk_reason || (assistantT.injuryRisk || "存在受伤风险，请注意")}</div>
            </div>
          </div>
        )}

        {/* 运动员反馈 */}
        <div className="report-section">
          <div className="report-section-header"><span className="sec-icon">🎙️</span>{assistantT.athleteFeedback || "运动员反馈"}</div>
          <div className="report-card">
            <div className="report-feedback-text">{session.transcript || (assistantT.noFeedback || "暂无反馈")}</div>
            <div className="report-scores">
              <div className="report-score-pill">
                <div className="report-score-pill-label">{assistantT.body || "身体"}</div>
                <div className="report-score-pill-val">{session.body_score || "--"}/10</div>
              </div>
              <div className="report-score-pill">
                <div className="report-score-pill-label">{assistantT.mind || "心理"}</div>
                <div className="report-score-pill-val">{session.mind_score || "--"}/10</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI 分析报告 */}
        {currentReport && Object.keys(currentReport).length > 0 && (
          <>
            {/* 训练日记 */}
            {currentReport.diary_text && (
              <div className="report-section">
                <div className="report-section-header"><span className="sec-icon">📓</span>{resultT.diaryTitle || "训练日记"}</div>
                <div className="report-card">
                  <div className="report-diary-text">{currentReport.diary_text}</div>
                </div>
              </div>
            )}

            {/* 教练简报 */}
            {(currentReport.coach_briefing || currentReport.coach_summary) && (
              <div className="report-section">
                <div className="report-section-header"><span className="sec-icon">📋</span>{resultT.coachTitle || "教练简报"}</div>
                <div className="report-briefing-text">{currentReport.coach_briefing || currentReport.coach_summary}</div>
              </div>
            )}

            {/* 明日训练建议 */}
            {(currentReport.tomorrow_suggestions || currentReport.recommendations)?.length > 0 && (
              <div className="report-section">
                <div className="report-section-header"><span className="sec-icon">💡</span>{resultT.recoTitle || "明日训练建议"}</div>
                <ol className="report-suggest-list">
                  {(currentReport.tomorrow_suggestions || currentReport.recommendations).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* 恢复状态 */}
            {currentReport.recovery_status && (
              <div className="report-section">
                <div className="report-section-header"><span className="sec-icon">💤</span>{resultT.recoveryTitle || "恢复状态"}</div>
                <div className="report-card">
                  <div className="report-diary-text">{currentReport.recovery_status}</div>
                </div>
              </div>
            )}
          </>
        )}

        {/* 添加备注 */}
        <div className="report-section">
          <div className="report-section-header"><span className="sec-icon">✏️</span>{assistantT.addTrainingNote || "添加备注"}</div>
          <button
            className={`voice-note-btn${voiceRecording ? " recording" : ""}`}
            onClick={onVoiceToggle}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="1" width="6" height="11" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" />
              <line x1="12" y1="17" x2="12" y2="21" /><line x1="8" y1="21" x2="16" y2="21" />
            </svg>
            <span>{voiceRecording ? (assistantT.recordingStop || "正在录音… 点击结束") : (assistantT.voiceInputNote || "语音输入备注")}</span>
          </button>
          <textarea
            className="report-textarea"
            placeholder={assistantT.notePlaceholder || "点击麦克风语音输入，或直接打字记录训练评价..."}
            value={noteContent}
            onChange={(e) => onNoteContentChange(e.target.value)}
          />
          <button className="report-submit" onClick={onSubmitNote} disabled={noteSaving}>
            {noteSaving ? (assistantT.submitting || "提交中...") : (assistantT.submitNote || "提交备注")}
          </button>
        </div>
      </div>
    </>
  );
}
