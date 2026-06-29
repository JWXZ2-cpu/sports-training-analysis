// API calls migrated to services layer
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { athleteService, sessionService, notificationService, analyzeService } from "../services";
import { startMimoAsr } from "../utils/mimoAsr.js";
import LoadingState from "../components/LoadingState.jsx";
import BottomNav from "../components/BottomNav.jsx";
import NotificationBell from "../components/NotificationBell.jsx";
import ProfileSheet from "../components/ProfileSheet.jsx";
import AthleteOnboarding from "./AthleteOnboarding.jsx";

export default function AthleteHome() {
  const { user } = useAuth();
  const [weekPlan, setWeekPlan] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  // 浏览器是否支持录音
  const supportsRecording = typeof MediaRecorder !== "undefined" && navigator.mediaDevices?.getUserMedia;

  // 输入模式：voice 或 text（不支持录音时默认文字）
  const [inputMode, setInputMode] = useState(supportsRecording ? "voice" : "text");
  const [textInput, setTextInput] = useState("");
  const MAX_CHARS = 500;

  // 录音状态
  const [isRecording, setIsRecording] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [voiceLabel, setVoiceLabel] = useState("点击记录今天的训练感受");
  const [voiceLabelColor, setVoiceLabelColor] = useState("var(--text-secondary)");
  const [showVoiceResult, setShowVoiceResult] = useState(false);
  const asrRef = useRef(null);
  const timerRef = useRef(null);

  // 数据确认状态
  const [showConfirm, setShowConfirm] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState(null);
  const [analyzeError, setAnalyzeError] = useState(null);

  // FIT上传
  const fileInputRef = useRef(null);
  const [fitResult, setFitResult] = useState(null);

  // 防重复提交
  const lastSubmitRef = useRef(null);

  // 未读通知数量
  const [unreadCount, setUnreadCount] = useState(0);

  // 体测状态
  const [physiologyStatus, setPhysiologyStatus] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    fetchData();
    fetchUnreadCount();
    fetchPhysiologyStatus();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (asrRef.current) asrRef.current.stop();
    };
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch {}
  };

  const fetchPhysiologyStatus = async () => {
    try {
      const data = await athleteService.getOnboardingStatus();
      setPhysiologyStatus(data);
    } catch {}
  };

  const fetchData = async () => {
    try {
      const [planData, reportsData] = await Promise.all([
        athleteService.getMyWeekPlan(),
        athleteService.getMyReports({ page: 1, limit: 3 }),
      ]);
      setWeekPlan(planData);
      setRecentReports(reportsData.reports || []);
    } catch {} finally { setLoading(false); }
  };

  const toggleRecording = () => {
    if (isRecognizing) return;

    if (isRecording) {
      // 停止录音，开始识别
      if (asrRef.current) asrRef.current.stop();
      setIsRecording(false);
      setIsRecognizing(true);
      clearInterval(timerRef.current);
      setVoiceLabel("识别中...");
      setVoiceLabelColor("var(--accent)");
    } else {
      // 开始录音
      setTranscript("");
      setShowVoiceResult(false);
      setAnalyzeResult(null);
      setAnalyzeError(null);
      setRecordSeconds(0);

      const asr = startMimoAsr({
        language: "zh",
        onResult: (text) => {
          setIsRecognizing(false);
          setTranscript(text);
          if (text.trim()) {
            setShowVoiceResult(true);
            setVoiceLabel("识别完成，请确认内容");
            setVoiceLabelColor("var(--text-secondary)");
          } else {
            setVoiceLabel("未识别到内容，请重试");
            setVoiceLabelColor("var(--amber)");
          }
        },
        onError: (msg) => {
          setIsRecognizing(false);
          setIsRecording(false);
          clearInterval(timerRef.current);
          setVoiceLabel(msg);
          setVoiceLabelColor("var(--red)");
        },
      });

      asrRef.current = asr;
      asr.start();
      setIsRecording(true);
      setVoiceLabel("正在录音… 点击结束");
      setVoiceLabelColor("var(--red)");
      timerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // 检测数据不一致
  const checkDataConsistency = (text, fitData) => {
    if (!fitData) return null;

    const inconsistencies = [];
    const textLower = text.toLowerCase();

    // 提取文字中的距离信息
    const distanceMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:公里|km|千米)/i);
    if (distanceMatch) {
      const textDistance = parseFloat(distanceMatch[1]);
      const fitDistance = fitData.total_distance_meters / 1000;
      const diff = Math.abs(textDistance - fitDistance);
      if (diff > 2) {  // 差异超过2公里
        inconsistencies.push(`距离差异：你说${textDistance}公里，手表显示${fitDistance.toFixed(1)}公里`);
      }
    }

    // 提取文字中的心率信息
    const hrMatch = text.match(/心率[^\d]*(\d+)/);
    if (hrMatch && fitData.avg_heart_rate) {
      const textHR = parseInt(hrMatch[1]);
      const fitHR = fitData.avg_heart_rate;
      if (Math.abs(textHR - fitHR) > 20) {
        inconsistencies.push(`心率差异：你说${textHR}bpm，手表显示${fitHR}bpm`);
      }
    }

    // 检查是否有"休息"但手表有训练数据
    if (textLower.includes("休息") || textLower.includes("没练") || textLower.includes("没跑")) {
      if (fitData.total_distance_meters > 1000) {
        inconsistencies.push(`状态矛盾：你说今天休息，但手表显示有${(fitData.total_distance_meters / 1000).toFixed(1)}公里训练数据`);
      }
    }

    return inconsistencies.length > 0 ? inconsistencies : null;
  };

  // 分析
  const handleAnalyze = async (text) => {
    // 防重复提交检查
    const fitHash = fitResult?.parsed_data ? JSON.stringify(fitResult.parsed_data) : "";
    const submitKey = `${text}|||${fitHash}`;
    if (lastSubmitRef.current === submitKey) {
      setVoiceLabel("该反馈已提交，请勿重复提交");
      setVoiceLabelColor("var(--amber)");
      setShowVoiceResult(true);
      setTimeout(() => {
        setShowVoiceResult(false);
        setVoiceLabel("点击记录今天的训练感受");
        setVoiceLabelColor("var(--text-secondary)");
      }, 3000);
      return;
    }

    // 数据一致性检查
    if (fitResult?.parsed_data) {
      const inconsistencies = checkDataConsistency(text, fitResult.parsed_data);
      if (inconsistencies) {
        const confirmed = window.confirm(
          `⚠️ 检测到数据不一致：\n\n${inconsistencies.join('\n')}\n\n是否继续提交？`
        );
        if (!confirmed) return;
      }
    }

    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const plan = weekPlan?.plans?.find((p) => p.is_today);
      const fields = {
        transcript: text,
        body_score: "", mind_score: "", difficulty_score: "",
        tags: "", mood_tags: "", mood_description: "",
        athlete_name: user.display_name, session_name: plan?.title || "训练",
        date: new Date().toISOString().split("T")[0],
        today_plan_content: plan?.title || "无今日计划",
        today_plan_zone: plan?.training_zone || "--",
        today_plan_pace: plan?.full_content?.target_pace || "--",
        today_plan_distance: plan?.estimated_distance || "--",
      };

      let msg = `【运动员基本信息】\n姓名：${fields.athlete_name}\n训练课程：${fields.session_name}\n日期：${fields.date}\n\n【今日训练计划】\n计划内容：${fields.today_plan_content}\n目标强度区间：${fields.today_plan_zone}\n目标配速：${fields.today_plan_pace}\n预计距离：${fields.today_plan_distance}\n\n【心理状态】\n情绪标签：${fields.mood_tags}\n心理感受描述：${fields.mood_description}\n\n【语音转文字内容】\n${text}`;

      // 追加FIT数据
      let fitDataForSession = null;
      if (fitResult?.parsed_data) {
        const fit = fitResult.parsed_data;
        fitDataForSession = fitResult.parsed_data;
        msg += `\n\n【客观训练数据（运动手表）】\n设备：${fit.device}\n总距离：${(fit.total_distance_meters / 1000).toFixed(2)}km\n总时长：${Math.round(fit.total_duration_seconds / 60)}分钟\n平均配速：${fit.avg_pace_sec_per_km ? Math.floor(fit.avg_pace_sec_per_km / 60) + ':' + String(fit.avg_pace_sec_per_km % 60).padStart(2, '0') : '--'}/km\n平均心率：${fit.avg_heart_rate || "--"}bpm\n最大心率：${fit.max_heart_rate || "--"}bpm\n步频：${fit.avg_cadence || "--"}spm`;
      }

      // 保存训练记录（包含FIT数据）
      const sessionPayload = { ...fields };
      if (fitDataForSession) {
        sessionPayload.fit_data_json = JSON.stringify(fitDataForSession);
        sessionPayload.has_fit_data = 1;
        sessionPayload.device_name = fitDataForSession.device;
      }
      const sessionData = await sessionService.createSession(sessionPayload);

      // AI分析（带重试）
      let parsed = null;
      let lastError = null;

      for (let attempt = 0; attempt < 2; attempt++) {
        const aiData = await analyzeService.analyze({
          system: `你是一个运动训练数据分析师，精通丹尼尔斯跑步训练法和邦帕周期化训练理论。

请严格按照以下JSON格式输出分析结果，字段名必须完全一致，不要输出任何其他内容。

【必须输出的JSON格式】
{
  "overall_score": 7.5,
  "status_level": "正常",
  "emotion": {"polarity": "中性", "confidence": 0.7, "signals": []},
  "fatigue": {"level": "中", "body_parts": [], "evidence": ""},
  "difficulty_points": ["难点1"],
  "training_zone": "E",
  "zone_distribution": {"E": 60, "M": 20, "T": 10, "I": 5, "R": 5},
  "vdot_estimate": 45,
  "training_quality": "良好",
  "intensity_feedback": "强度区间分析",
  "diary_text": "训练日记内容",
  "coach_summary": "教练简报内容",
  "recommendations": ["建议1", "建议2"],
  "daniels_recommendation": "基于丹尼尔斯理论的建议",
  "periodization_recommendation": "基于邦帕理论的建议",
  "recovery_status": "恢复状态评估",
  "load_management": {"acwr_estimate": "正常", "load_trend": "稳定", "monotony_risk": "低"},
  "risk_flag": false,
  "risk_reason": null,
  "care_message": "null或温暖的关怀文字"
}

【字段说明】
- overall_score: 综合评分 1.0-10.0
- status_level: "优秀"|"正常"|"关注"|"预警"
- emotion.polarity: "积极"|"中性"|"消极"
- fatigue.level: "低"|"中"|"高"
- training_zone: "E"|"M"|"T"|"I"|"R"（主要训练区间）
- zone_distribution: 各区间占比百分比，总和=100
- vdot_estimate: VDOT估算值，数字
- training_quality: "优秀"|"良好"|"一般"|"需改进"
- daniels_recommendation: 基于丹尼尔斯理论的具体建议（50字以内）
- periodization_recommendation: 基于邦帕周期化理论的具体建议（50字以内）
- recovery_status: 恢复状态评估（30字以内）
- risk_flag: true 或 false
- data_consistency: {"is_consistent": true/false, "inconsistencies": ["不一致描述1", "不一致描述2"]}
- care_message: 当检测到运动员情绪低落、焦虑、疲惫时，生成一句温暖的关怀话语（30字以内）。如果情绪正常或积极，设为 null。

【关怀信息生成规则】
- 如果 emotion.polarity 是"消极"，必须生成 care_message
- 如果 fatigue.level 是"高"且有身体疼痛，生成关怀信息
- 如果检测到焦虑、压力大等信号，生成关怀信息
- 关怀信息要温暖、真诚，像朋友一样关心，不要说教
- 例如："今天辛苦了，记得好好休息，明天会更好 💪"
- 例如："身体在告诉你需要恢复，别着急，休息也是训练的一部分"
- 例如："能坚持完成训练已经很棒了，给自己一点掌声 👏"

【数据一致性检查要求】
如果同时提供了语音反馈和手表数据，请对比以下内容：
1. 距离：语音中提到的距离 vs 手表记录的距离（差异>2km视为不一致）
2. 心率：语音中提到的心率 vs 手表记录的心率（差异>20bpm视为不一致）
3. 状态：语音中说"休息"但手表有训练数据
4. 其他明显矛盾

如果只有语音反馈或只有手表数据，is_consistent 设为 true。

【警告】
1. 字段名必须完全一致，不能使用中文键名
2. 不要输出markdown代码块，只输出纯JSON
3. 所有字段都必须填写，不能省略${attempt > 0 ? '\n4. 上次输出格式错误，请严格按照要求输出。' : ''}`,
          user: msg,
        });

        if (aiData.error) {
          lastError = aiData.error;
          continue;
        }

        const aiText = aiData.content?.map((b) => b.text || "").join("") || "";

        // 解析 JSON
        parsed = parseAIResponse(aiText);

        // 校验必要字段
        if (parsed && parsed.overall_score && parsed.status_level) {
          // 补全缺失字段
          parsed = fillMissingFields(parsed);
          break;
        }

        lastError = "AI返回格式不符";
        parsed = null;
      }

      if (!parsed) {
        throw new Error(lastError || "AI未返回有效结果，请重试");
      }

      // 保存报告
      await analyzeService.saveReport({ session_id: sessionData.session.id, report: parsed });

      // 记录本次提交内容，防止重复提交
      lastSubmitRef.current = submitKey;

      setAnalyzeResult(parsed);
      setVoiceLabel("今天的感受已记录 ✓");
      setVoiceLabelColor("var(--green)");
      // 清空输入并重置状态
      setTranscript("");
      setTextInput("");
      setShowVoiceResult(false);
      setFitResult(null); // 清空FIT数据
      fetchData();
    } catch (err) {
      setAnalyzeError(err.message);
      setVoiceLabel("分析出错，请重试");
      setVoiceLabelColor("var(--red)");
    } finally { setAnalyzing(false); }
  };

  // FIT上传
  const [fitUploading, setFitUploading] = useState(false);
  const handleFitUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFitUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const data = await athleteService.uploadFitFile(fd);
      setFitResult(data);
      // 显示成功提示
      setVoiceLabel("✅ 手表数据导入成功");
      setVoiceLabelColor("var(--green)");
      setShowVoiceResult(true);
      setTimeout(() => {
        setShowVoiceResult(false);
        setVoiceLabel("点击记录今天的训练感受");
        setVoiceLabelColor("var(--text-secondary)");
      }, 3000);
    } catch (err) {
      setVoiceLabel("❌ " + err.message);
      setVoiceLabelColor("var(--red)");
      setShowVoiceResult(true);
      setTimeout(() => {
        setShowVoiceResult(false);
        setVoiceLabel("点击记录今天的训练感受");
        setVoiceLabelColor("var(--text-secondary)");
      }, 3000);
    } finally {
      setFitUploading(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 解析 AI 返回的 JSON，支持多种格式
  const parseAIResponse = (text) => {
    // 方式1：直接解析
    try { return JSON.parse(text.trim()); } catch {}

    // 方式2：提取 markdown 代码块
    const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) {
      try { return JSON.parse(codeBlock[1].trim()); } catch {}
    }

    // 方式3：提取第一个完整的 JSON 对象
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      let depth = 0, end = -1;
      for (let i = 0; i < jsonMatch[0].length; i++) {
        if (jsonMatch[0][i] === '{') depth++;
        if (jsonMatch[0][i] === '}') depth--;
        if (depth === 0) { end = i; break; }
      }
      if (end >= 0) {
        try { return JSON.parse(jsonMatch[0].substring(0, end + 1)); } catch {}
      }
    }

    // 方式4：清理后重试
    let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try { return JSON.parse(cleaned.substring(start, end + 1)); } catch {}
    }

    return null;
  };

  // 补全缺失字段
  const fillMissingFields = (parsed) => {
    const defaults = {
      overall_score: 6,
      status_level: "正常",
      emotion: { polarity: "中性", confidence: 0.5, signals: [] },
      fatigue: { level: "中", body_parts: [], evidence: "" },
      difficulty_points: [],
      training_zone: "E",
      zone_distribution: { E: 60, M: 20, T: 10, I: 5, R: 5 },
      vdot_estimate: null,
      training_quality: "一般",
      intensity_feedback: "暂无强度分析",
      diary_text: "训练已完成",
      coach_summary: "暂无教练简报",
      recommendations: [],
      daniels_recommendation: "暂无丹尼尔斯理论建议",
      periodization_recommendation: "暂无周期化建议",
      recovery_status: "暂无恢复状态评估",
      load_management: { acwr_estimate: "未知", load_trend: "未知", monotony_risk: "低" },
      risk_flag: false,
      risk_reason: null,
      care_message: null,
    };

    const result = { ...parsed };

    // 补全缺失字段
    for (const [key, defaultValue] of Object.entries(defaults)) {
      if (result[key] === undefined || result[key] === null) {
        result[key] = defaultValue;
      }
    }

    // 确保 status_level 是有效值
    const validStatusLevels = ["优秀", "正常", "关注", "预警"];
    if (!validStatusLevels.includes(result.status_level)) {
      const score = result.overall_score;
      result.status_level = score >= 8 ? "优秀" : score >= 6 ? "正常" : score >= 4 ? "关注" : "预警";
    }

    // 确保 emotion.polarity 是有效值
    const validPolarities = ["积极", "中性", "消极"];
    if (!validPolarities.includes(result.emotion?.polarity)) {
      result.emotion = { ...result.emotion, polarity: "中性" };
    }

    // 确保 fatigue.level 是有效值
    const validLevels = ["低", "中", "高"];
    if (!validLevels.includes(result.fatigue?.level)) {
      result.fatigue = { ...result.fatigue, level: "中" };
    }

    return result;
  };

  const todayPlan = weekPlan?.plans?.find((p) => p.is_today);

  if (loading) {
    return <LoadingState />;
  }

  // 数据确认弹窗
  if (showConfirm) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 70 }}>
        <div style={{ padding: "20px 22px", maxWidth: 430, margin: "0 auto" }}>
        <button onClick={() => setShowConfirm(false)} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12, cursor: "pointer", marginBottom: 16 }}>← 返回</button>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>确认提交</h2>
          <div style={{ background: "var(--card)", borderRadius: 16, padding: 18, border: "1px solid var(--border)", marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{transcript}</div>
          </div>
          {fitResult && (
            <div style={{ background: "var(--green-dim)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "var(--green)" }}>
              ✅ 手表数据：{fitResult.summary?.distance} · {fitResult.summary?.duration} · {fitResult.summary?.avg_pace}
            </div>
          )}
          <button onClick={() => { setShowConfirm(false); handleAnalyze(transcript); }} style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, var(--accent), #C08830)", color: "var(--bg)",
            fontSize: 15, fontWeight: 600, cursor: "pointer",
          }}>确认提交分析</button>
        </div>
        <BottomNav active="home" />
      </div>
    );
  }

  // 分析结果弹窗
  if (analyzeResult || analyzeError) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 70 }}>
        <div style={{ padding: "20px 22px", maxWidth: 430, margin: "0 auto" }}>
          <button onClick={() => { setAnalyzeResult(null); setAnalyzeError(null); setTranscript(""); setVoiceLabel("点击记录今天的训练感受"); setVoiceLabelColor("var(--text-secondary)"); }} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12, cursor: "pointer", marginBottom: 16 }}>← 返回首页</button>

          {analyzeError && (
            <div style={{ background: "var(--red-dim)", borderRadius: 12, padding: 16, border: "1px solid rgba(212,92,92,0.3)", color: "var(--red)", marginBottom: 16 }}>❌ {analyzeError}</div>
          )}

          {analyzeResult && (
            <>
              <div style={{ background: "var(--card)", borderRadius: 16, padding: 18, border: "1px solid var(--border)", marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 8 }}>📝 今天的训练</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{analyzeResult.athlete_view?.summary || analyzeResult.diary_text?.substring(0, 50) || "训练已完成"}</div>
              </div>

              {analyzeResult.athlete_view?.highlights?.length > 0 && (
                <div style={{ background: "var(--card)", borderRadius: 16, padding: 18, border: "1px solid var(--border)", marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 8 }}>💪 做得好的</div>
                  {analyzeResult.athlete_view.highlights.map((h, i) => (
                    <div key={i} style={{ fontSize: 13, color: "var(--text-secondary)", padding: "3px 0" }}>• {h}</div>
                  ))}
                </div>
              )}

              {analyzeResult.athlete_view?.encouragement && (
                <div style={{ background: "var(--accent-dim)", borderRadius: 16, padding: 18, border: "1px solid rgba(212,164,76,0.15)", textAlign: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>✨</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{analyzeResult.athlete_view.encouragement}</div>
                </div>
              )}

              {/* 关怀信息 */}
              {analyzeResult.care_message && (
                <div style={{
                  background: "linear-gradient(135deg, rgba(107,191,110,0.08) 0%, rgba(92,159,212,0.08) 100%)",
                  borderRadius: 16, padding: 18, marginBottom: 12,
                  border: "1px solid rgba(107,191,110,0.15)",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>💝</div>
                  <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                    {analyzeResult.care_message}
                  </div>
                </div>
              )}

              {analyzeResult.diary_text && (
                <div style={{ background: "var(--card)", borderRadius: 16, padding: 18, border: "1px solid var(--border)", marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>📖 训练日记</div>
                  <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 14, lineHeight: 1.75, color: "var(--text-secondary)" }}>{analyzeResult.diary_text}</div>
                </div>
              )}
            </>
          )}
        </div>
        <BottomNav active="home" />
      </div>
    );
  }

  // 主页
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 70 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 22px 0" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 400, color: "var(--text-secondary)", letterSpacing: "0.02em" }}>{getGreeting()}，</div>
          <div style={{ fontSize: 24, fontWeight: 600, color: "var(--text-secondary)", marginTop: 2, letterSpacing: "-0.01em" }}>{user.display_name}</div>
          <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 6 }}>{getDateString(weekPlan)}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <NotificationBell />
          <div onClick={() => setShowProfile(true)} style={{
            width: 46, height: 46, borderRadius: "50%", padding: 2.5,
            background: "linear-gradient(135deg, var(--accent), #E87040)",
            cursor: "pointer", transition: "transform 0.2s, box-shadow 0.3s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(212,164,76,0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{
              width: "100%", height: "100%", borderRadius: "50%", background: "var(--card)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17, fontWeight: 600, color: "var(--accent)",
            }}>{user.display_name?.[0]}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 22px", maxWidth: 430, margin: "0 auto" }}>
        {/* Status Card */}
        <div style={{
          marginTop: 28, padding: 20, borderRadius: 16, display: "flex", alignItems: "center", gap: 16,
          background: "linear-gradient(135deg, rgba(30,38,52,0.6) 0%, rgba(30,26,22,0.4) 100%)",
          border: "1px solid rgba(92,159,212,0.08)",
          animation: "fadeUp 0.5s ease 0.1s both",
        }}>
          <div style={{ fontSize: 28, flexShrink: 0 }}>{todayPlan?.title ? "🏃" : "🌙"}</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{todayPlan?.title ? `今天：${todayPlan.title}` : "今天好好休息"}</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.5 }}>
              {todayPlan?.title ? `${todayPlan.training_zone || ""} ${todayPlan.estimated_distance || ""} ${todayPlan.full_content?.target_pace || ""}`.trim() : "身体恢复也是训练的一部分，为接下来的训练储备能量"}
            </div>
          </div>
        </div>

        {/* Physiology Card - 体测数据/更新入口 */}
        {physiologyStatus && (
          <div
            onClick={() => setShowOnboarding(true)}
            style={{
              marginTop: 12, padding: "12px 16px", borderRadius: 12,
              background: physiologyStatus.isStale
                ? "rgba(212,92,92,0.08)"
                : "rgba(212,164,76,0.06)",
              border: `1px solid ${physiologyStatus.isStale ? "rgba(212,92,92,0.2)" : "rgba(212,164,76,0.12)"}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              cursor: "pointer", transition: "all 0.2s",
              animation: "fadeUp 0.5s ease 0.12s both",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = physiologyStatus.isStale ? "rgba(212,92,92,0.4)" : "rgba(212,164,76,0.25)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = physiologyStatus.isStale ? "rgba(212,92,92,0.2)" : "rgba(212,164,76,0.12)"; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>📊</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                  {physiologyStatus.vdot ? `VDOT ${physiologyStatus.vdot}` : "更新体测数据"}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
                  {physiologyStatus.isStale
                    ? "⚠ 已超过 6 周，建议更新"
                    : physiologyStatus.assessedAt
                      ? `上次: ${physiologyStatus.assessedAt.substring(0, 10)}`
                      : "点击设置训练区间"
                  }
                </div>
              </div>
            </div>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>›</span>
          </div>
        )}

        {/* Week Strip */}
        {weekPlan && (
          <div style={{ marginTop: 24, display: "flex", gap: 4, animation: "fadeUp 0.5s ease 0.15s both" }}>
            {weekPlan.plans.map((p) => {
              const isToday = p.is_today;
              const hasPlan = !!p.title;
              const dotColor = !hasPlan ? "var(--text-dim)" : p.intensity_level === "high" ? "var(--amber)" : "var(--green)";
              return (
                <div key={p.date} style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  padding: "12px 0", borderRadius: 10,
                  background: isToday ? "var(--accent-dim)" : "var(--surface)",
                  border: isToday ? "1px solid var(--accent)" : "1px solid var(--border)",
                  transition: "all 0.2s ease",
                }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: isToday ? "var(--accent)" : "var(--text-dim)" }}>{p.day_of_week?.replace("周", "")}</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: isToday ? "var(--accent)" : "var(--text-secondary)" }}>{p.date?.substring(8)}</span>
                  <span style={{ width: isToday ? 7 : 6, height: isToday ? 7 : 6, borderRadius: "50%", background: dotColor }} />
                </div>
              );
            })}
          </div>
        )}

        {/* Voice / Text Input Section */}
        <div style={{ marginTop: 44, animation: "fadeUp 0.5s ease 0.2s both" }}>
          {/* 不支持录音的提示 */}
          {!supportsRecording && (
            <div style={{
              marginBottom: 16, padding: "10px 14px", borderRadius: 10,
              background: "rgba(212,164,76,0.08)", border: "1px solid rgba(212,164,76,0.15)",
              fontSize: 12, color: "var(--accent)", lineHeight: 1.5,
            }}>
              ⚠️ 当前浏览器不支持语音输入，请使用文字输入。推荐使用 Chrome 或 Edge 浏览器获得完整体验。
            </div>
          )}

          {/* Mode Toggle */}
          <div style={{
            display: "flex", padding: 3, background: "var(--surface)",
            borderRadius: 10, border: "1px solid var(--border)", marginBottom: 20,
          }}>
            {supportsRecording && (
            <button onClick={() => { setInputMode("voice"); setShowVoiceResult(false); setTranscript(""); }} style={{
              flex: 1, padding: "10px 0", border: "none", borderRadius: 7,
              background: inputMode === "voice" ? "var(--accent-dim)" : "transparent",
              color: inputMode === "voice" ? "var(--accent)" : "var(--text-dim)",
              fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.25s ease",
              ...(inputMode === "voice" ? { border: "1px solid rgba(212,164,76,0.15)" } : {}),
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="1" width="6" height="11" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              语音录入
            </button>
            )}
            <button onClick={() => { setInputMode("text"); if (isRecording) { asrRef.current?.stop(); clearInterval(timerRef.current); setIsRecording(false); } }} style={{
              flex: 1, padding: "10px 0", border: "none", borderRadius: 7,
              background: inputMode === "text" ? "var(--accent-dim)" : "transparent",
              color: inputMode === "text" ? "var(--accent)" : "var(--text-dim)",
              fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.25s ease",
              ...(inputMode === "text" ? { border: "1px solid rgba(212,164,76,0.15)" } : {}),
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" /><line x1="9" y1="9" x2="15" y2="9" /><line x1="9" y1="13" x2="13" y2="13" />
              </svg>
              文字输入
            </button>
          </div>

          {/* Voice Panel */}
          {inputMode === "voice" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!isRecording && (
                  <>
                    <span style={ringStyle(108, 0.25, "2.5s")} />
                    <span style={ringStyle(132, 0.15, "2.5s", "0.4s")} />
                    <span style={ringStyle(156, 0.08, "2.5s", "0.8s")} />
                  </>
                )}
                {isRecording && (
                  <>
                    <span style={{ ...ringStyle(108, 0.25, "2.5s"), borderColor: "var(--red)" }} />
                    <span style={{ ...ringStyle(132, 0.15, "2.5s", "0.4s"), borderColor: "var(--red)" }} />
                    <span style={{ ...ringStyle(156, 0.08, "2.5s", "0.8s"), borderColor: "var(--red)" }} />
                  </>
                )}
                <button onClick={toggleRecording} style={{
                  width: 88, height: 88, borderRadius: "50%", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isRecording ? "linear-gradient(135deg, var(--red), #B84040)" : "linear-gradient(135deg, var(--accent), #C08830)",
                  color: "var(--bg)", transition: "transform 0.2s, box-shadow 0.3s", zIndex: 2,
                  boxShadow: isRecording ? "0 0 50px rgba(212,92,92,0.3)" : "none",
                  animation: isRecording ? "recordPulse 1.5s ease infinite" : "none",
                }}
                  onMouseEnter={(e) => { if (!isRecording) { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(212,164,76,0.2)"; } }}
                  onMouseLeave={(e) => { if (!isRecording) { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; } }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="1" width="6" height="11" rx="3" />
                    <path d="M5 10a7 7 0 0 0 14 0" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                  </svg>
                </button>
              </div>

              {/* Waveform */}
              <div style={{ display: isRecording ? "flex" : "none", alignItems: "center", justifyContent: "center", gap: 3, height: 40, marginTop: 20 }}>
                {[12,20,28,16,32,22,18,26,14,24,20,30,16].map((h, i) => (
                  <div key={i} style={{
                    width: 3, borderRadius: 2, background: "var(--red)", opacity: 0.7, height: h,
                    animation: "waveAnim 0.8s ease-in-out infinite alternate",
                    animationDelay: `${[0,0.1,0.15,0.2,0.05,0.25,0.12,0.18,0.08,0.22,0.06,0.16,0.1][i]}s`,
                  }} />
                ))}
              </div>

              {/* Timer */}
              {isRecording && (
                <div style={{ fontSize: 22, fontWeight: 600, color: "var(--red)", marginTop: 12, letterSpacing: "0.05em", fontVariantNumeric: "tabular-nums" }}>
                  {formatTime(recordSeconds)}
                </div>
              )}

              {/* Label */}
              <p style={{ marginTop: 24, fontSize: 14, color: voiceLabelColor, transition: "color 0.3s" }}>{voiceLabel}</p>

              {/* Voice Result Area */}
              {showVoiceResult && (
                <div style={{ marginTop: 20, width: "100%", animation: "fadeUp 0.3s ease both" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-dim)", marginBottom: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)" }} />
                    语音已识别，请确认内容是否准确
                  </div>
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="识别内容将显示在这里..."
                    style={{
                      width: "100%", minHeight: 100, padding: "14px 16px",
                      background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10,
                      color: "var(--text)", fontFamily: "'Noto Serif SC', serif", fontSize: 14.5, lineHeight: 1.7,
                      resize: "vertical", outline: "none", boxSizing: "border-box",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                  />
                  <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    你可以直接编辑识别出的文字，确认无误后提交
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Text Panel */}
          {inputMode === "text" && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="用文字记录今天的训练感受...&#10;&#10;比如：今天跑了8公里，感觉腿很轻松，配速比上周快了，心情不错。"
                style={{
                  width: "100%", minHeight: 160, padding: 16,
                  background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10,
                  color: "var(--text)", fontFamily: "'Noto Serif SC', serif", fontSize: 14.5, lineHeight: 1.7,
                  resize: "vertical", outline: "none", boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border)"}
              />
              <div style={{ fontSize: 11, color: "var(--text-dim)", textAlign: "right", marginTop: 6 }}>
                {textInput.length} 字
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={() => {
              const content = inputMode === "voice" ? transcript : textInput;
              if (content.trim()) handleAnalyze(content);
            }}
            disabled={analyzing || (inputMode === "voice" ? !transcript.trim() : !textInput.trim())}
            style={{
              marginTop: 20, width: "100%", padding: 14, borderRadius: 10, border: "none",
              background: analyzing
                ? "var(--text-dim)"
                : (inputMode === "voice" ? transcript.trim() : textInput.trim())
                  ? "linear-gradient(135deg, var(--accent), #C08830)"
                  : "var(--text-dim)",
              color: "var(--bg)", fontFamily: "inherit", fontSize: 14, fontWeight: 600,
              cursor: analyzing ? "wait" : (inputMode === "voice" ? transcript.trim() : textInput.trim()) ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s",
            }}
          >
            {analyzing ? (
              <>
                <span style={{
                  width: 16, height: 16, border: "2px solid var(--bg)", borderTopColor: "transparent",
                  borderRadius: "50%", animation: "spin 0.8s linear infinite",
                }} />
                分析中...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                提交训练反馈
              </>
            )}
          </button>

          {/* Import link */}
          <label style={{
            marginTop: 16, fontSize: 12, color: "var(--text-dim)", display: "flex",
            alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", transition: "color 0.2s",
          }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-dim)"}
          >
            <input ref={fileInputRef} type="file" accept=".fit,.bin_tmp" onChange={handleFitUpload} style={{ display: "none" }} />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {fitUploading ? "导入中..." : "导入手表数据"}
          </label>
          {fitResult && (
            <div style={{
              marginTop: 8, fontSize: 12, color: "var(--green)", textAlign: "center",
              background: "var(--green-dim)", padding: "8px 12px", borderRadius: 8,
            }}>
              ✅ 已导入：{fitResult.summary?.distance} · {fitResult.summary?.duration} · {fitResult.summary?.avg_pace}
              {fitResult.summary?.avg_hr !== "--" && <> · 心率 {fitResult.summary?.avg_hr}</>}
            </div>
          )}
        </div>

        {/* Recent Section */}
        <div style={{ marginTop: 44, animation: "fadeUp 0.5s ease 0.3s both" }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 14, letterSpacing: "-0.01em" }}>最近记录</div>
          {recentReports.length > 0 ? recentReports.map((r) => (
            <a key={r.id} href={`/athlete/report/${r.id}`} style={{
              display: "block", background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 16, padding: 18, marginBottom: 12,
              textDecoration: "none", color: "inherit",
              transition: "border-color 0.2s, background 0.2s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.background = "var(--card-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--card)"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{r.date}</span>
                <span style={{ fontSize: 20 }}>
                  {r.emotion_display?.includes("积极") ? "😊" : r.emotion_display?.includes("消极") ? "😟" : "😐"}
                </span>
              </div>
              <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 14.5, lineHeight: 1.7, color: "var(--text-secondary)", margin: 0 }}>
                {r.summary || "训练已完成"}
              </p>
            </a>
          )) : (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-dim)" }}>暂无训练记录</div>
          )}
        </div>
      </div>

      <ProfileSheet isOpen={showProfile} onClose={() => setShowProfile(false)} />
      <BottomNav active="home" badgeCount={unreadCount} />

      {/* 体测更新弹窗 */}
      {showOnboarding && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 300,
          background: "var(--bg)", overflow: "auto",
        }}>
          <AthleteOnboarding
            isUpdate={true}
            onComplete={() => {
              setShowOnboarding(false);
              fetchPhysiologyStatus();
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ringPulse { 0% { transform: scale(0.85); opacity: 0.3; } 100% { transform: scale(1.15); opacity: 0; } }
        @keyframes recordPulse { 0%, 100% { box-shadow: 0 0 30px rgba(212,92,92,0.25); } 50% { box-shadow: 0 0 60px rgba(212,92,92,0.4); } }
        @keyframes waveAnim { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function ringStyle(size, opacity, duration, delay = "0s") {
  return {
    position: "absolute", width: size, height: size, borderRadius: "50%",
    border: "1.5px solid var(--accent)", opacity,
    animation: `ringPulse ${duration} ease-out ${delay} infinite`,
    pointerEvents: "none",
  };
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return "夜深了";
  if (h < 11) return "早上好";
  if (h < 14) return "中午好";
  if (h < 18) return "下午好";
  return "晚上好";
}

function getDateString(weekPlan) {
  const now = new Date();
  const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  let str = `${now.getMonth() + 1}月${now.getDate()}日 · ${days[now.getDay()]}`;
  try {
    if (weekPlan?.week_start) {
      const weekNum = Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7);
      str += ` · 第${weekNum}周`;
    }
  } catch (e) {
    // ignore date parsing errors
  }
  return str;
}
