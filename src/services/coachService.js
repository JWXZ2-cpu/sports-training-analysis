/**
 * 教练专属接口
 */
import { api } from "./api.js";

// POST /api/coach/session-record
export function createSessionRecord(data) {
  return api.post("/coach/session-record", data);
}

// GET /api/coach/session-records
export function getSessionRecords(params) {
  return api.get("/coach/session-records", params);
}

// GET /api/coach/session-records/:id
export function getSessionRecordById(id) {
  return api.get(`/coach/session-records/${id}`);
}
