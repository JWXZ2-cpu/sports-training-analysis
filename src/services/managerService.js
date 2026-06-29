/**
 * 管理人员专属接口
 */
import { api } from "./api.js";

// GET /api/manager/dashboard
export function getDashboard() {
  return api.get("/manager/dashboard");
}

// GET /api/manager/attendance
export function getAttendance(params) {
  return api.get("/manager/attendance", params);
}

// GET /api/manager/team-status
export function getTeamStatus() {
  return api.get("/manager/team-status");
}
