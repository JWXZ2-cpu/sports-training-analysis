/**
 * AI 翻译服务
 * 用于将中文训练报告翻译为其他语言
 */
import { api } from "./api.js";

// 翻译缓存
const cache = new Map();

/**
 * 翻译文本
 * @param {string} text - 要翻译的文本
 * @param {string} targetLang - 目标语言 (en/it)
 * @returns {Promise<string>} 翻译后的文本
 */
export async function translateText(text, targetLang = "en") {
  if (!text || text.trim() === "") return text;

  // 检查缓存
  const cacheKey = `${text}_${targetLang}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const result = await api.post("/translate", {
      text,
      target_lang: targetLang,
    });

    const translated = result.translated_text || text;
    cache.set(cacheKey, translated);
    return translated;
  } catch (err) {
    console.error("翻译失败:", err);
    return text; // 翻译失败返回原文
  }
}

/**
 * 批量翻译对象中的文本字段
 * @param {Object} obj - 包含文本的对象
 * @param {string[]} fields - 要翻译的字段名
 * @param {string} targetLang - 目标语言
 * @returns {Promise<Object>} 翻译后的对象
 */
export async function translateFields(obj, fields, targetLang = "en") {
  if (!obj) return obj;

  const result = { ...obj };

  for (const field of fields) {
    if (result[field] && typeof result[field] === "string") {
      result[field] = await translateText(result[field], targetLang);
    } else if (Array.isArray(result[field])) {
      result[field] = await Promise.all(
        result[field].map((item) =>
          typeof item === "string" ? translateText(item, targetLang) : item
        )
      );
    }
  }

  return result;
}

/**
 * 翻译 AI 分析报告
 * @param {Object} report - AI 分析报告
 * @param {string} targetLang - 目标语言
 * @returns {Promise<Object>} 翻译后的报告
 */
export async function translateReport(report, targetLang = "en") {
  if (!report) return report;

  // 需要翻译的字段
  const textFields = [
    "diary_text",
    "coach_summary",
    "risk_reason",
    "training_quality",
    "intensity_feedback",
    "periodization_analysis",
    "recovery_status",
    "phase_alignment",
    "daniels_recommendation",
    "periodization_recommendation",
  ];

  // 翻译数组字段
  const arrayFields = ["difficulty_points", "recommendations"];

  // 翻译嵌套对象
  const nestedFields = {
    emotion: ["signals"],
    fatigue: ["evidence", "body_parts"],
  };

  let translated = { ...report };

  // 翻译顶层文本字段
  translated = await translateFields(translated, textFields, targetLang);

  // 翻译数组字段
  for (const field of arrayFields) {
    if (Array.isArray(translated[field])) {
      translated[field] = await Promise.all(
        translated[field].map((item) =>
          typeof item === "string" ? translateText(item, targetLang) : item
        )
      );
    }
  }

  // 翻译嵌套对象
  for (const [objKey, objFields] of Object.entries(nestedFields)) {
    if (translated[objKey]) {
      translated[objKey] = await translateFields(translated[objKey], objFields, targetLang);
    }
  }

  // 翻译状态等级
  const statusMap = {
    en: { "优秀": "Excellent", "正常": "Normal", "关注": "Attention", "预警": "Alert" },
    it: { "优秀": "Eccellente", "正常": "Normale", "关注": "Attenzione", "预警": "Allerta" },
  };

  if (statusMap[targetLang]?.[translated.status_level]) {
    translated.status_level_display = statusMap[targetLang][translated.status_level];
  }

  // 翻译情绪极性
  const polarityMap = {
    en: { "积极": "Positive", "中性": "Neutral", "消极": "Negative" },
    it: { "积极": "Positivo", "中性": "Neutro", "消极": "Negativo" },
  };

  if (translated.emotion?.polarity && polarityMap[targetLang]?.[translated.emotion.polarity]) {
    translated.emotion = {
      ...translated.emotion,
      polarity_display: polarityMap[targetLang][translated.emotion.polarity],
    };
  }

  // 翻译疲劳等级
  const fatigueMap = {
    en: { "低": "Low", "中": "Medium", "高": "High" },
    it: { "低": "Basso", "中": "Medio", "高": "Alto" },
  };

  if (translated.fatigue?.level && fatigueMap[targetLang]?.[translated.fatigue.level]) {
    translated.fatigue = {
      ...translated.fatigue,
      level_display: fatigueMap[targetLang][translated.fatigue.level],
    };
  }

  return translated;
}

/**
 * 清除翻译缓存
 */
export function clearCache() {
  cache.clear();
}
