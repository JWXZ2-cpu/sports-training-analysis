/**
 * 运动员绑定关系相关接口
 */
import { api } from "./api.js";

// GET /api/bindings
export function getBindings() {
  return api.get("/bindings");
}

// GET /api/bindings/athlete/:athleteId
export function getAthleteBinding(athleteId) {
  return api.get(`/bindings/athlete/${athleteId}`);
}

// GET /api/bindings/staff/:staffId
export function getStaffAthletes(staffId) {
  return api.get(`/bindings/staff/${staffId}`);
}

// POST /api/bindings
export function createBinding(data) {
  return api.post("/bindings", data);
}

// PUT /api/bindings/:athleteId
export function updateBinding(athleteId, data) {
  return api.put(`/bindings/${athleteId}`, data);
}

// DELETE /api/bindings/:athleteId
export function deleteBinding(athleteId) {
  return api.delete(`/bindings/${athleteId}`);
}
