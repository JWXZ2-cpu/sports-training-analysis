/**
 * 运动员端 - 训练报告详情页
 * 简化版布局，不显示专业分析内容
 */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useI18n } from "../locales/index.jsx";
import { athleteService } from "../services";
import { getTranslation } from "../utils/translateCache.js";
import { translateService } from "../services";
import LoadingState from "../components/LoadingState.jsx";
import BottomNav from "../components/BottomNav.jsx";
import FitDataCard from "../components/FitDataCard.jsx";

export default function AthleteReport() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const resultT = t.result || {};
  const [translated, setTranslated] = useState({});
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReport(); }, [id]);

  const report = data?.report || {};

  // 翻译报告内容
  useEffect(() => {
    if (lang === "zh" || !data?.report) {
      setTranslated({});
      return;
    }
    const translateReport = async () => {
      const fields = ["diary_text", "coach_summary", "risk_reason", "recovery_status"];
      const translations = {};
      for (const field of fields) {
        if (report[field]) {
          translations[field] = await getTranslation(report[field], lang, translateService.translateText);
        }
      }
      if (report.recommendations?.length > 0) {
        translations.recommendations = [];
        for (const rec of report.recommendations) {
          translations.recommendations.push(await getTranslation(rec, lang, translateService.translateText));
        }
      }
      setTranslated(translations);
    };
    translateReport();
  }, [data, lang]);

  const getText = (field) => {
    if (lang === "zh") return report[field];
    return translated[field] || report[field];
  };

  const fetchReport = async () => {
    try {
      const result = await athleteService.getMyReportById(id);
      setData(result);
    } catch (err) {
      console.error("获取报告失败:", err);
    } finally { setLoading(false); }
  };

  if (loading) return <LoadingState />;

  if (!data?.report) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <div style={{ color: "var(--text-dim)" }}>{resultT.noData || "暂无训练记录"}</div>
        <a href="/athlete" style={{ marginTop: 16, color: "var(--accent)", textDecoration: "none" }}>← {resultT.backToHome || "返回首页"}</a>
      </div>
    );
  }

  const session = data?.session || {};
  const emotion = report.emotion || {};
  const fatigue = report.fatigue || {};

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

  // 状态颜色
  const statusColors = {
    "优秀": { bg: "var(--green-dim)", text: "var(--green)" },
    "正常": { bg: "var(--blue-dim)", text: "var(--blue)" },
    "关注": { bg: "var(--amber-dim)", text: "var(--amber)" },
    "预警": { bg: "var(--red-dim)", text: "var(--red)" },
  };
  const sc = statusColors[report.status_level] || statusColors["正常"];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 70 }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: "1px solid var(--border)",
        background: "var(--surface)", position: "sticky", top: 0, zIndex: 10,
      }}>
        <a href="/athlete" style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12, cursor: "pointer", textDecoration: "none" }}>← {resultT.back || "返回"}</a>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{resultT.reportTitle || "训练报告"}</span>
        <span style={{ width: 40 }}></span>
      </div>

      <div style={{ padding: "16px", maxWidth: 430, margin: "0 auto" }}>

        {/* ====== 1. 核心指标区（Hero Card） ====== */}
        <div style={{
          background: "linear-gradient(145deg, rgba(55,45,25,0.95) 0%, rgba(38,32,20,0.95) 50%, rgba(23,22,19,0.95) 100%)",
          border: "1px solid rgba(212,164,76,0.18)",
          borderRadius: 16,
          padding: "24px 20px",
          marginBottom: 12,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* 日期 */}
          <div style={{ fontSize: 12, color: "var(--text-dim)", textAlign: "center", marginBottom: 16 }}>
            {session.session_date} · {session.session_name || "训练"}
          </div>

          {/* 评分 */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{
              fontSize: 48, fontWeight: 700,
              color: "var(--accent)", letterSpacing: "-0.03em", lineHeight: 1,
            }}>
              {report.overall_score || "--"}<span style={{ fontSize: 20, fontWeight: 400, color: "var(--text-dim)" }}> / 10</span>
            </div>
            <div style={{
              display: "inline-block", marginTop: 8, padding: "4px 16px", borderRadius: 20,
              background: sc.bg, border: `1px solid ${sc.text}33`,
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: sc.text }}>
                {report.status_level || "正常"}
              </span>
            </div>
          </div>

          {/* 核心指标网格 */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12,
            borderTop: "1px solid var(--border)", paddingTop: 16,
          }}>
            {/* 情绪 */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>
                {emotion.polarity === "积极" ? "😊" : emotion.polarity === "消极" ? "😟" : "😐"}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 2 }}>{resultT.emotionPrefix || "情绪"}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: polarityColors[emotion.polarity] || "var(--text-secondary)" }}>
                {t.polarity?.[emotion.polarity] || emotion.polarity || "中性"}
              </div>
            </div>

            {/* 疲劳 */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>💪</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 2 }}>{resultT.fatiguePrefix || "疲劳"}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: fatigueColors[fatigue.level] || "var(--text-secondary)" }}>
                {t.fatigue?.[fatigue.level] || fatigue.level || "中"}
              </div>
            </div>

            {/* 训练区间 */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>📊</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 2 }}>{resultT.trainingZoneLabel || "区间"}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: zoneColors[report.training_zone] || "var(--text-secondary)" }}>
                {report.training_zone || "E"}
              </div>
            </div>
          </div>
        </div>

        {/* ====== 2. 预警提示（如有） ====== */}
        {report.risk_flag && report.risk_reason && (
          <div style={{
            background: "linear-gradient(135deg, rgba(60,24,20,0.5) 0%, rgba(30,26,22,0.4) 100%)",
            borderRadius: 16, padding: "14px 16px", marginBottom: 12,
            border: "1px solid rgba(212,92,92,0.15)",
            display: "flex", gap: 12, alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>🚨</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--red)", marginBottom: 4 }}>{resultT.riskAlert || "需立即关注"}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{getText("risk_reason")}</div>
            </div>
          </div>
        )}

        {/* ====== 3. 关怀信息（如有） ====== */}
        {report.care_message && (
          <div style={{
            background: "linear-gradient(135deg, rgba(107,191,110,0.08) 0%, rgba(92,159,212,0.08) 100%)",
            borderRadius: 16, padding: 18, marginBottom: 12,
            border: "1px solid rgba(107,191,110,0.15)",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>💝</div>
            <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
              {report.care_message}
            </div>
          </div>
        )}

        {/* ====== 4. 教练简报 ====== */}
        {report.coach_summary && (
          <div style={{
            background: "var(--card)", borderRadius: 16, padding: "16px",
            border: "1px solid var(--border)", marginBottom: 12,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
            }}>
              <span style={{ fontSize: 14 }}>📋</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{resultT.coachTitle || "教练简报"}</span>
            </div>
            <div style={{
              fontFamily: "'Noto Serif SC', serif", fontSize: 14, color: "var(--text-secondary)",
              lineHeight: 1.8, padding: "12px 14px", background: "var(--surface)",
              borderRadius: 12, borderLeft: "3px solid var(--accent)",
            }}>
              {getText("coach_summary")}
            </div>
          </div>
        )}

        {/* ====== 5. 训练日记 ====== */}
        {report.diary_text && (
          <div style={{
            background: "var(--card)", borderRadius: 16, padding: "16px",
            border: "1px solid var(--border)", marginBottom: 12,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
            }}>
              <span style={{ fontSize: 14 }}>📖</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{resultT.diaryTitle || "训练日记"}</span>
            </div>
            <div style={{
              fontFamily: "'Noto Serif SC', serif", fontSize: 14, color: "var(--text-secondary)",
              lineHeight: 1.8,
            }}>
              {getText("diary_text")}
            </div>
          </div>
        )}

        {/* ====== 6. 手表数据（如有） ====== */}
        {session.has_fit_data && session.fit_data_json && (
          <div style={{ marginBottom: 12 }}>
            <FitDataCard fitData={session.fit_data_json} />
          </div>
        )}

        {/* ====== 7. 训练难点 ====== */}
        {report.difficulty_points?.length > 0 && (
          <div style={{
            background: "var(--card)", borderRadius: 16, padding: "14px 16px",
            border: "1px solid var(--border)", marginBottom: 12,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
            }}>
              <span style={{ fontSize: 14 }}>⚠️</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{resultT.difficultyTitle || "训练难点"}</span>
            </div>
            {report.difficulty_points.map((item, i) => (
              <div key={i} style={{
                fontSize: 13, color: "var(--text-secondary)", padding: "4px 0",
                display: "flex", gap: 8, alignItems: "flex-start",
              }}>
                <span style={{ color: "var(--amber)", fontSize: 10, marginTop: 5 }}>●</span>
                {item}
              </div>
            ))}
          </div>
        )}

        {/* ====== 8. 恢复状态 ====== */}
        {report.recovery_status && (
          <div style={{
            background: "var(--card)", borderRadius: 16, padding: "14px 16px",
            border: "1px solid var(--border)", marginBottom: 12,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
            }}>
              <span style={{ fontSize: 14 }}>💤</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{resultT.recoveryTitle || "恢复状态"}</span>
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-secondary)" }}>
              {getText("recovery_status")}
            </div>
          </div>
        )}

        {/* ====== 9. 明日建议 ====== */}
        {report.recommendations?.length > 0 && (
          <div style={{
            background: "linear-gradient(135deg, rgba(212,164,76,0.08) 0%, rgba(212,164,76,0.04) 100%)",
            borderRadius: 16, padding: "16px", marginBottom: 12,
            border: "1px solid rgba(212,164,76,0.15)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
            }}>
              <span style={{ fontSize: 14 }}>💡</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>{resultT.recoTitle || "明日建议"}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {report.recommendations.map((rec, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: 6,
                    background: "var(--accent-dim)", color: "var(--accent)",
                    fontSize: 11, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 1,
                  }}>{i + 1}</span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{translated.recommendations?.[i] || rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav active={null} badgeCount={0} />
    </div>
  );
}
