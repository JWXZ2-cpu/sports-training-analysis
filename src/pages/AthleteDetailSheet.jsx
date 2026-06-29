/**
 * 运动员详情 Sheet 弹窗
 */
import { useI18n } from "../locales/index.jsx";
import { STATUS_COLORS } from "../styles/sharedStyles.js";

export default function AthleteDetailSheet({
  athlete,
  sessions,
  notes,
  loading,
  noteContent,
  onNoteContentChange,
  onSubmitNote,
  noteSaving,
  voiceRecording,
  onVoiceToggle,
  onClose,
  onOpenReport,
}) {
  const { t } = useI18n();
  const assistantT = t.assistant || {};
  const resultT = t.result || {};
  const sc = STATUS_COLORS[athlete?.status_level] || STATUS_COLORS["正常"];

  return (
    <>
      <div className="sheet-overlay open" onClick={onClose} />
      <div className="sheet detail-sheet open">
        <div className="sheet-handle-area" onClick={onClose}>
          <div className="sheet-handle" />
        </div>
        <button className="detail-back" onClick={onClose}>{assistantT.backToWorkbenchBtn || "← 返回工作台"}</button>
        <div className="detail-header">
          <div className="detail-avatar">{athlete?.name?.[0]}</div>
          <div>
            <div className="detail-name">{athlete?.name}</div>
            <span className="detail-status" style={{ background: sc.bg, color: sc.text }}>
              {t.statusLevel?.[athlete?.status_level] || athlete?.status_level || t.statusLevel?.["正常"] || "正常"}
            </span>
          </div>
        </div>

        <div className="section-title" style={{ marginTop: 0 }}>{assistantT.trainingRecord || "训练记录"}</div>
        <div className="detail-records">
          {loading ? (
            <div style={{ textAlign: "center", padding: 20, color: "var(--text-dim)" }}>{assistantT.loadingRecords || "加载中..."}</div>
          ) : sessions.length > 0 ? (
            sessions.map((s) => {
              const sSc = STATUS_COLORS[s.status_level] || STATUS_COLORS["正常"];
              return (
                <div key={s.id} className="detail-record" onClick={() => onOpenReport(s.id)}>
                  <div className="detail-record-score" style={{ color: s.risk_flag ? "var(--red)" : s.status_level === "关注" ? "var(--amber)" : "var(--green)" }}>
                    {s.overall_score || "—"}
                  </div>
                  <div className="detail-record-info">
                    <div className="detail-record-date">
                      {s.session_date}
                      <span className="detail-record-status" style={{ background: sSc.bg, color: sSc.text }}>
                        {t.statusLevel?.[s.status_level] || s.status_level || t.statusLevel?.["正常"] || "正常"}
                      </span>
                    </div>
                    {s.risk_flag && <div className="detail-record-tag">{assistantT.fatigue || "疲劳"}</div>}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: "center", padding: 20, color: "var(--text-dim)" }}>{assistantT.noSessionRecords || "暂无训练记录"}</div>
          )}
        </div>

        {/* 添加训练备注 */}
        <div className="detail-note-area">
          <div className="detail-note-label">📝 {assistantT.addTrainingNote || "添加训练备注"}</div>
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

        {/* 历史备注 */}
        {notes.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div className="section-title">{assistantT.historyNotes || "历史备注"}</div>
            {notes.map((n) => (
              <div key={n.id} style={{
                padding: "12px 14px", background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: 10, marginBottom: 8,
              }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{n.note_date || n.created_at?.split("T")[0]}</span>
                  <span style={{
                    fontSize: 10, padding: "1px 6px", borderRadius: 8,
                    background: n.note_type === "evaluation" ? "var(--green-dim)" : "var(--accent-dim)",
                    color: n.note_type === "evaluation" ? "var(--green)" : "var(--text-secondary)",
                  }}>
                    {n.note_type === "evaluation" ? (assistantT.evaluation || "评价") : (assistantT.observation || "观察")}
                  </span>
                </div>
                <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{n.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
