/**
 * AI 分析相关接口
 */
import { api } from "./api.js";

// POST /api/analyze
export function analyze(data) {
  return api.post("/analyze", data);
}

// POST /api/reports
export function saveReport(data) {
  return api.post("/reports", data);
}
