/**
 * 翻译缓存工具
 * 使用 localStorage 缓存翻译结果，避免重复调用 API
 */

const CACHE_KEY = "translate_cache";
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7天过期

/**
 * 获取缓存
 */
function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const cache = JSON.parse(raw);
    // 清理过期缓存
    const now = Date.now();
    const cleaned = {};
    for (const [key, value] of Object.entries(cache)) {
      if (value.expires > now) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  } catch {
    return {};
  }
}

/**
 * 保存缓存
 */
function saveCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

/**
 * 生成缓存键
 */
function getCacheKey(text, targetLang) {
  // 简单哈希：取文本前100字符 + 长度 + 目标语言
  const hash = text.substring(0, 100) + "|" + text.length + "|" + targetLang;
  return hash;
}

/**
 * 获取翻译（带缓存）
 * @param {string} text - 原文
 * @param {string} targetLang - 目标语言
 * @param {Function} translateFn - 翻译函数 (text, lang) => Promise<string>
 * @returns {Promise<string>} 翻译后的文本
 */
export async function getTranslation(text, targetLang, translateFn) {
  if (!text || !text.trim()) return text;
  if (targetLang === "zh") return text; // 中文不需要翻译

  const cacheKey = getCacheKey(text, targetLang);
  const cache = getCache();

  // 检查缓存
  if (cache[cacheKey]) {
    return cache[cacheKey].text;
  }

  // 调用翻译 API
  try {
    const translated = await translateFn(text, targetLang);
    // 保存到缓存
    cache[cacheKey] = {
      text: translated,
      expires: Date.now() + CACHE_EXPIRY,
    };
    saveCache(cache);
    return translated;
  } catch (err) {
    console.error("翻译失败:", err);
    return text; // 翻译失败返回原文
  }
}

/**
 * 批量翻译（带缓存）
 */
export async function getTranslations(texts, targetLang, translateFn) {
  if (targetLang === "zh") return texts;

  const results = [];
  for (const text of texts) {
    const translated = await getTranslation(text, targetLang, translateFn);
    results.push(translated);
  }
  return results;
}
