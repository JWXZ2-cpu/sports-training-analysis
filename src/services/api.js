/**
 * 基础 API 请求封装
 * - 自动添加 Authorization header
 * - 统一错误处理
 * - 支持 JSON 和 FormData
 */

const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(method, url, { body, params, isFormData = false } = {}) {
  let fullUrl = `${API_BASE}${url}`;

  // 拼接 query params
  if (params && Object.keys(params).length > 0) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ).toString();
    if (qs) fullUrl += `?${qs}`;
  }

  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData && body) headers["Content-Type"] = "application/json";

  const fetchOptions = { method, headers };
  if (body) {
    fetchOptions.body = isFormData ? body : JSON.stringify(body);
  }

  const res = await fetch(fullUrl, fetchOptions);

  if (!res.ok) {
    let errMsg;
    try {
      const errData = await res.json();
      errMsg = errData.error || `请求失败 (${res.status})`;
    } catch {
      errMsg = `请求失败 (${res.status})`;
    }
    throw new Error(errMsg);
  }

  // 处理空响应 (204 No Content 或空 body)
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    console.error("[API] 非 JSON 响应:", res.url, res.status, text.substring(0, 200));
    throw new Error(`服务器返回了非 JSON 响应 (${res.status}): ${text.substring(0, 100)}`);
  }
}

export const api = {
  get: (url, params) => request("GET", url, { params }),
  post: (url, body, { isFormData } = {}) => request("POST", url, { body, isFormData }),
  put: (url, body) => request("PUT", url, { body }),
  delete: (url) => request("DELETE", url),
};
