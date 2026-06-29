/**
 * 训练计划相关接口
 */
import { api } from "./api.js";

// GET /api/plans
export function getPlans(params) {
  return api.get("/plans", params);
}

// GET /api/plans/today
export function getTodayPlans() {
  return api.get("/plans/today");
}

// GET /api/plans/:id
export function getPlanById(id) {
  return api.get(`/plans/${id}`);
}

// POST /api/plans
export function createPlan(data) {
  return api.post("/plans", data);
}

// PUT /api/plans/:id
export function updatePlan(id, data) {
  return api.put(`/plans/${id}`, data);
}

// DELETE /api/plans/:id
export function deletePlan(id) {
  return api.delete(`/plans/${id}`);
}

// POST /api/plans/:id/approve
export function approvePlan(id, data) {
  return api.post(`/plans/${id}/approve`, data);
}

// POST /api/plans/ai-plan-suggestion
export function getAIPlanSuggestion(data) {
  return api.post("/plans/ai-plan-suggestion", data);
}
