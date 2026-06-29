/**
 * 运动员专属接口
 */
import { api } from "./api.js";

// GET /api/athlete/my-plan/this-week
export function getMyWeekPlan() {
  return api.get("/athlete/my-plan/this-week");
}

// GET /api/athlete/my-reports
export function getMyReports(params) {
  return api.get("/athlete/my-reports", params);
}

// GET /api/athlete/my-reports/:id
export function getMyReportById(id) {
  return api.get(`/athlete/my-reports/${id}`);
}

// GET /api/athlete/summary
export function getSummary() {
  return api.get("/athlete/summary");
}

// POST /api/athlete/upload-fit (FormData)
export function uploadFitFile(formData) {
  return api.post("/athlete/upload-fit", formData, { isFormData: true });
}

// POST /api/athlete/onboarding/vdot
export function calcVDOT(data) {
  return api.post("/athlete/onboarding/vdot", data);
}

// POST /api/athlete/onboarding/conconi
export function calcConconi(data) {
  return api.post("/athlete/onboarding/conconi", data);
}

// POST /api/athlete/onboarding/save
export function saveOnboarding(data) {
  return api.post("/athlete/onboarding/save", data);
}

// GET /api/athlete/onboarding/status
export function getOnboardingStatus() {
  return api.get("/athlete/onboarding/status");
}
