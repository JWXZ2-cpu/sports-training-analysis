/**
 * 训练记录相关接口
 */
import { api } from "./api.js";

// GET /api/sessions
export function getSessions(params) {
  return api.get("/sessions", params);
}

// GET /api/sessions/overview/team
export function getTeamOverview() {
  return api.get("/sessions/overview/team");
}

// GET /api/sessions/:id
export function getSessionById(id) {
  return api.get(`/sessions/${id}`);
}

// POST /api/sessions
export function createSession(data) {
  return api.post("/sessions", data);
}
