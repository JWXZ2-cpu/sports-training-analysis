/**
 * AI 分析报告展示组件（教练视角）
 * 设计理念：分层展示，渐进式披露，视觉层次分明
 */
import { useState, useEffect } from "react";
import Badge from "./Badge.jsx";
import { useI18n } from "../locales/index.jsx";
import { translateService } from "../services";
import { getTranslation } from "../utils/translateCache.js";

// 折叠区块组件
function CollapsibleSection({ icon, title, children, defaultOpen = false, accentColor = "var(--accent)" }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{
      background: "var(--card)",
      borderRadius: 16,
      border: "1px solid var(--border)",
      overflow: "hidden",
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          color: "var(--text)",
        }}
      >
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 600 }}>{title}</span>
        <span style={{
          fontSize: 12,
          color: "var(--text-dim)",
          transform: isOpen ? "rotate(180deg)" : "rotate(0)",
          transition: "transform 0.2s",
        }}>▾</span>
      </button>
      {isOpen && (
        <div style={{
          padding: "0 16px 16px",
          borderTop: "1px solid var(--border)",
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function ResultView({ result, reportLang }) {
  const { t } = useI18n();
  if (!result) return null;

  // 使用 reportLang（由 TranslateButton 控制），默认中文
  const currentReportLang = reportLang || "zh";

  const emotion = result.emotion || {};
  const fatigue = result.fatigue || {};
  const loadMgmt = result.load_management || {};
  const psychology = result.psychology_assessment || {};

  // 翻译状态
  const [translated, setTranslated] = useState({});

  // 翻译 AI 报告内容
  useEffect(() => {
    if (currentReportLang === "zh" || !result) {
      setTranslated({});
      return;
    }

    const translateReport = async () => {
      const fields = [
        "diary_text", "coach_summary", "risk_reason",
        "intensity_feedback", "recovery_status",
        "daniels_recommendation", "periodization_recommendation",
        "training_quality",
      ];

      const translations = {};
      for (const field of fields) {
        if (result[field] && typeof result[field] === "string") {
          translations[field] = await getTranslation(result[field], currentReportLang, translateService.translateText);
        }
      }

      // 翻译数组字段
      if (result.recommendations?.length > 0) {
        translations.recommendations = [];
        for (const rec of result.recommendations) {
          translations.recommendations.push(await getTranslation(rec, currentReportLang, translateService.translateText));
        }
      }

      if (result.difficulty_points?.length > 0) {
        translations.difficulty_points = [];
        for (const dp of result.difficulty_points) {
          translations.difficulty_points.push(await getTranslation(dp, currentReportLang, translateService.translateText));
        }
      }

      // 翻译负荷管理字段
      if (result.load_management) {
        if (result.load_management.acwr_estimate) {
          translations.acwr_estimate = await getTranslation(result.load_management.acwr_estimate, currentReportLang, translateService.translateText);
        }
        if (result.load_management.load_trend) {
          translations.load_trend = await getTranslation(result.load_management.load_trend, currentReportLang, translateService.translateText);
        }
      }

      // 翻译心理分析
      if (result.psychology_assessment) {
        if (result.psychology_assessment.analysis) {
          translations.psychology_analysis = await getTranslation(result.psychology_assessment.analysis, currentReportLang, translateService.translateText);
        }
        if (result.psychology_assessment.suggestion) {
          translations.psychology_suggestion = await getTranslation(result.psychology_assessment.suggestion, currentReportLang, translateService.translateText);
        }
      }

      setTranslated(translations);
    };

    translateReport();
  }, [result, currentReportLang]);

  // 获取翻译后的文本
  const getText = (field) => {
    if (currentReportLang === "zh") return result[field];
    return translated[field] || result[field];
  };

  const getArrayText = (field) => {
    if (currentReportLang === "zh") return result[field];
    return translated[field] || result[field];
  };

  // 状态颜色映射
  const statusColors = {
    "优秀": { bg: "var(--green-dim)", text: "var(--green)", border: "var(--green)" },
    "正常": { bg: "var(--blue-dim)", text: "var(--blue)", border: "var(--blue)" },
    "关注": { bg: "var(--amber-dim)", text: "var(--amber)", border: "var(--amber)" },
    "预警": { bg: "var(--red-dim)", text: "var(--red)", border: "var(--red)" },
  };
  const sc = statusColors[result.status_level] || statusColors["正常"];

  // 情绪颜色
  const polarityColors = {
    "积极": "var(--green)",
    "中性": "var(--text-dim)",
    "消极": "var(--red)",
  };

  // 疲劳颜色
  const fatigueColors = {
    "低": "var(--green)",
    "中": "var(--amber)",
    "高": "var(--red)",
  };

  // 区间颜色
  const zoneColors = {
    "E": "var(--blue)",
    "M": "var(--green)",
    "T": "var(--accent)",
    "I": "var(--amber)",
    "R": "var(--red)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* ====== 1. 核心指标区（Hero Card） ====== */}
      <div style={{
        background: "linear-gradient(145deg, rgba(31,30,25,0.95) 0%, rgba(23,22,19,0.95) 100%)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "24px 20px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* 右上角光晕 */}
        <div style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 140,
          height: 140,
          background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }} />

        {/* 预警提示 */}
        {result.risk_flag && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
            padding: "8px 12px",
            background: "var(--red-dim)",
            borderRadius: 10,
            border: "1px solid rgba(212,92,92,0.2)",
          }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--red)" }}>{t.result?.riskAlert || "需立即关注"}</span>
          </div>
        )}

        {/* 评分 */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            fontSize: 48,
            fontWeight: 700,
            color: "var(--accent)",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}>
            {result.overall_score || "--"}<span style={{ fontSize: 20, fontWeight: 400, color: "var(--text-dim)" }}> / 10</span>
          </div>
          <div style={{
            display: "inline-block",
            marginTop: 8,
            padding: "4px 16px",
            borderRadius: 20,
            background: sc.bg,
            border: `1px solid ${sc.border}`,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: sc.text }}>
              {t.statusLevel?.[result.status_level] || result.status_level || t.statusLevel?.["正常"] || "正常"}
            </span>
          </div>
        </div>

        {/* 核心指标网格 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
          borderTop: "1px solid var(--border)",
          paddingTop: 16,
        }}>
          {/* 情绪 */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>
              {emotion.polarity === "积极" ? "😊" : emotion.polarity === "消极" ? "😟" : "😐"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 2 }}>{t.result?.emotionPrefix || "情绪"}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: polarityColors[emotion.polarity] || "var(--text-secondary)" }}>
              {t.polarity?.[emotion.polarity] || emotion.polarity || "中性"}
            </div>
          </div>

          {/* 疲劳 */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>💪</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 2 }}>{t.result?.fatiguePrefix || "疲劳"}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: fatigueColors[fatigue.level] || "var(--text-secondary)" }}>
              {t.fatigue?.[fatigue.level] || fatigue.level || "中"}
            </div>
          </div>

          {/* 训练区间 */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>📊</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 2 }}>{t.result?.trainingZoneLabel || "区间"}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: zoneColors[result.training_zone] || "var(--text-secondary)" }}>
              {result.training_zone || "E"}
            </div>
          </div>
        </div>
      </div>

      {/* ====== 2. 行动建议区（最醒目） ====== */}
      {result.recommendations?.length > 0 && (
        <div style={{
          background: "linear-gradient(135deg, rgba(212,164,76,0.08) 0%, rgba(212,164,76,0.04) 100%)",
          borderRadius: 16,
          padding: "16px",
          border: "1px solid rgba(212,164,76,0.15)",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}>
            <span style={{ fontSize: 16 }}>💡</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>{t.result?.recoTitle || "今日建议"}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(getArrayText("recommendations") || []).map((rec, i) => (
              <div key={i} style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}>
                <span style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  background: "var(--accent-dim)",
                  color: "var(--accent)",
                  fontSize: 11,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 1,
                }}>{i + 1}</span>
                <span style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====== 3. 预警提示（如有） ====== */}
      {result.risk_flag && result.risk_reason && (
        <div style={{
          background: "linear-gradient(135deg, rgba(60,24,20,0.5) 0%, rgba(30,26,22,0.4) 100%)",
          borderRadius: 16,
          padding: "14px 16px",
          border: "1px solid rgba(212,92,92,0.15)",
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>🚨</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--red)", marginBottom: 4 }}>{t.result?.riskAlert || "需立即关注"}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{getText("risk_reason")}</div>
          </div>
        </div>
      )}

      {/* ====== 4. 训练日记区（教练简报） ====== */}
      {result.coach_summary && (
        <div style={{
          background: "var(--card)",
          borderRadius: 16,
          padding: "16px",
          border: "1px solid var(--border)",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
          }}>
            <span style={{ fontSize: 14 }}>📋</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{t.result?.coachTitle || "教练简报"}</span>
          </div>
          <div style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: 14,
            color: "var(--text-secondary)",
            lineHeight: 1.8,
            padding: "12px 14px",
            background: "var(--surface)",
            borderRadius: 12,
            borderLeft: "3px solid var(--accent)",
          }}>
            {getText("coach_summary")}
          </div>
        </div>
      )}

      {/* ====== 5. 折叠详情区 ====== */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

        {/* 训练强度详情 */}
        <CollapsibleSection
          icon="🏃"
          title={t.result?.intensityFeedbackTitle || "训练强度详情"}
          accentColor="var(--blue)"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 12 }}>
            {/* 强度区间分析 */}
            {result.intensity_feedback && (
              <div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>{t.result?.intensityFeedbackTitle || "强度区间分析"}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{getText("intensity_feedback")}</div>
              </div>
            )}

            {/* 丹尼尔斯建议 */}
            {result.daniels_recommendation && (
              <div style={{
                padding: "12px",
                background: "var(--blue-dim)",
                borderRadius: 12,
                border: "1px solid rgba(92,159,212,0.2)",
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--blue)", marginBottom: 6 }}>🏃 {t.result?.danielsRecoTitle || "丹尼尔斯理论建议"}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{getText("daniels_recommendation")}</div>
              </div>
            )}

            {/* VDOT */}
            {result.vdot_estimate && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "var(--text-dim)" }}>VDOT 估算：</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>{result.vdot_estimate}</span>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* 负荷与恢复 */}
        <CollapsibleSection
          icon="📊"
          title={t.result?.loadManagementTitle || "负荷与恢复"}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 12 }}>
            {/* 负荷管理 */}
            {loadMgmt && (loadMgmt.acwr_estimate || loadMgmt.load_trend || loadMgmt.monotony_risk) && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
              }}>
                <div style={{ textAlign: "center", padding: "10px", background: "var(--surface)", borderRadius: 10 }}>
                  <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 4 }}>{t.result?.acwrLabel || "急慢性负荷比"}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{getText("acwr_estimate") || loadMgmt.acwr_estimate || "--"}</div>
                </div>
                <div style={{ textAlign: "center", padding: "10px", background: "var(--surface)", borderRadius: 10 }}>
                  <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 4 }}>{t.result?.loadTrendLabel || "负荷趋势"}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{getText("load_trend") || loadMgmt.load_trend || "--"}</div>
                </div>
                <div style={{ textAlign: "center", padding: "10px", background: "var(--surface)", borderRadius: 10 }}>
                  <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 4 }}>{t.result?.monotonyLabel || "单调性风险"}</div>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: loadMgmt.monotony_risk === "高" ? "var(--red)" : loadMgmt.monotony_risk === "中" ? "var(--amber)" : "var(--green)",
                  }}>{t.fatigue?.[loadMgmt.monotony_risk] || loadMgmt.monotony_risk || "低"}</div>
                </div>
              </div>
            )}

            {/* 邦帕建议 */}
            {result.periodization_recommendation && (
              <div style={{
                padding: "12px",
                background: "var(--accent-dim)",
                borderRadius: 12,
                border: "1px solid rgba(212,164,76,0.15)",
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 6 }}>📐 {t.result?.periodizationRecoTitle || "邦帕周期化建议"}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{getText("periodization_recommendation")}</div>
              </div>
            )}

            {/* 恢复状态 */}
            {result.recovery_status && (
              <div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>{t.result?.recoveryTitle || "恢复状态"}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{getText("recovery_status")}</div>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* 心理状态分析 */}
        {(psychology.analysis || psychology.detected_signals?.length > 0) && (
          <CollapsibleSection
            icon="🧠"
            title={t.result?.psychologyTitle || "心理状态分析"}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 12 }}>
              {/* 检测信号 */}
              {psychology.detected_signals?.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {psychology.detected_signals.map((signal, i) => {
                    const signalColors = {
                      "动机下降": { bg: "var(--amber-dim)", color: "var(--amber)" },
                      "焦虑": { bg: "var(--red-dim)", color: "var(--red)" },
                      "不自信": { bg: "var(--amber-dim)", color: "var(--amber)" },
                      "注意力分散": { bg: "var(--amber-dim)", color: "var(--amber)" },
                      "职业倦怠": { bg: "var(--red-dim)", color: "var(--red)" },
                      "恢复不足": { bg: "var(--amber-dim)", color: "var(--amber)" },
                      "积极": { bg: "var(--green-dim)", color: "var(--green)" },
                      "自信": { bg: "var(--green-dim)", color: "var(--green)" },
                      "专注": { bg: "var(--green-dim)", color: "var(--green)" },
                      "恢复良好": { bg: "var(--green-dim)", color: "var(--green)" },
                    };
                    const sc = signalColors[signal] || { bg: "var(--surface)", color: "var(--text-dim)" };
                    return (
                      <span key={i} style={{
                        fontSize: 11,
                        padding: "4px 10px",
                        borderRadius: 10,
                        background: sc.bg,
                        color: sc.color,
                        fontWeight: 500,
                      }}>{signal}</span>
                    );
                  })}
                </div>
              )}

              {/* 分析 */}
              {psychology.analysis && (
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {translated.psychology_analysis || psychology.analysis}
                </div>
              )}

              {/* 建议 */}
              {psychology.suggestion && (
                <div style={{
                  fontSize: 12,
                  color: "var(--amber)",
                  borderLeft: "2px solid var(--amber)",
                  paddingLeft: 10,
                  fontStyle: "italic",
                }}>
                  💡 {translated.psychology_suggestion || psychology.suggestion}
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
}
