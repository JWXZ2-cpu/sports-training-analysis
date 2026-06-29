// 运动员专用结果展示组件
// 只显示 athlete_view 内容，不暴露任何专业指标
export default function AthleteResultView({ result }) {
  if (!result) return null;

  const athleteView = result.athlete_view || {};
  const emotionDisplay = result.emotion_display || "😊 --";
  const fatigueDisplay = result.fatigue_display || "--";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* 一句话总结 */}
      <div style={{
        background: "var(--bg-card)", borderRadius: 12, padding: "16px",
        border: "1px solid var(--border-default)",
      }}>
        <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500, marginBottom: 8 }}>📝 今天的训练</div>
        <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.6 }}>
          {athleteView.summary || "训练已完成"}
        </div>
      </div>

      {/* 训练记录清单 */}
      {athleteView.training_log?.length > 0 && (
        <div style={{
          background: "var(--bg-card)", borderRadius: 12, padding: "14px 16px",
          border: "1px solid var(--border-default)",
        }}>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500, marginBottom: 8 }}>训练记录</div>
          {athleteView.training_log.map((item, i) => (
            <div key={i} style={{ fontSize: 13, color: "var(--text-primary)", padding: "4px 0", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--color-success)" }}>✅</span> {item}
            </div>
          ))}
        </div>
      )}

      {/* 做得好的 */}
      {athleteView.highlights?.length > 0 && (
        <div style={{
          background: "var(--bg-card)", borderRadius: 12, padding: "14px 16px",
          border: "1px solid var(--border-default)",
        }}>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500, marginBottom: 8 }}>💪 做得好的</div>
          {athleteView.highlights.map((item, i) => (
            <div key={i} style={{ fontSize: 13, color: "var(--text-primary)", padding: "3px 0", display: "flex", gap: 6 }}>
              <span style={{ color: "var(--color-success)", fontSize: 10, marginTop: 5 }}>●</span> {item}
            </div>
          ))}
        </div>
      )}

      {/* 可以改进的 */}
      {athleteView.areas_to_work?.length > 0 && (
        <div style={{
          background: "var(--bg-card)", borderRadius: 12, padding: "14px 16px",
          border: "1px solid var(--border-default)",
        }}>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500, marginBottom: 8 }}>🔄 可以改进的</div>
          {athleteView.areas_to_work.map((item, i) => (
            <div key={i} style={{ fontSize: 13, color: "var(--text-primary)", padding: "3px 0", display: "flex", gap: 6 }}>
              <span style={{ color: "var(--color-warning)", fontSize: 10, marginTop: 5 }}>●</span> {item}
            </div>
          ))}
        </div>
      )}

      {/* 鼓励 */}
      {athleteView.encouragement && (
        <div style={{
          background: "var(--color-primary-bg)", borderRadius: 12, padding: "16px",
          border: "1px solid var(--color-primary-border)", textAlign: "center",
        }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>✨</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.6 }}>{athleteView.encouragement}</div>
        </div>
      )}

      {/* 关怀语 */}
      {athleteView.care_message && (
        <div style={{
          background: "var(--color-success-bg)", borderRadius: 12, padding: "14px 16px",
          border: "1px solid var(--color-success-border)", textAlign: "center",
        }}>
          <div style={{ fontSize: 12, color: "var(--color-success)", fontWeight: 500, marginBottom: 4 }}>💚 记得照顾好自己</div>
          <div style={{ fontSize: 13, color: "var(--color-success-dark)", lineHeight: 1.6 }}>{athleteView.care_message}</div>
        </div>
      )}

      {/* 心情和疲劳 */}
      <div style={{
        background: "var(--bg-card)", borderRadius: 12, padding: "14px 16px",
        border: "1px solid var(--border-default)", display: "flex", gap: 24,
      }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 4 }}>你的心情</div>
          <div style={{ fontSize: 14 }}>{emotionDisplay}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 4 }}>疲劳程度</div>
          <div style={{ fontSize: 14 }}>{fatigueDisplay}</div>
        </div>
      </div>

      {/* 训练日记 */}
      {result.diary_text && (
        <div style={{
          background: "var(--bg-card)", borderRadius: 12, padding: "14px 16px",
          border: "1px solid var(--border-default)",
        }}>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500, marginBottom: 6 }}>📖 今天的训练日记</div>
          <div style={{ fontSize: 13, lineHeight: 1.8, color: "var(--text-primary)" }}>{result.diary_text}</div>
        </div>
      )}
    </div>
  );
}
