/**
 * 队医专属接口
 */
import { api } from "./api.js";

// POST /api/doctor/treatment
export function createTreatment(data) {
  return api.post("/doctor/treatment", data);
}

// POST /api/doctor/parse-voice
export function parseVoice(data) {
  return api.post("/doctor/parse-voice", data);
}

// GET /api/doctor/treatments
export function getTreatments(params) {
  return api.get("/doctor/treatments", params);
}

// GET /api/doctor/treatments/:id
export function getTreatmentById(id) {
  return api.get(`/doctor/treatments/${id}`);
}

// POST /api/doctor/injury
export function createInjury(data) {
  return api.post("/doctor/injury", data);
}

// GET /api/doctor/injuries
export function getInjuries(params) {
  return api.get("/doctor/injuries", params);
}

// GET /api/doctor/injury-alerts
export function getInjuryAlerts() {
  return api.get("/doctor/injury-alerts");
}

// GET /api/doctor/athlete/:id/health
export function getAthleteHealth(id) {
  return api.get(`/doctor/athlete/${id}/health`);
}

// POST /api/doctor/upload-check (FormData)
export function uploadCheck(formData) {
  return api.post("/doctor/upload-check", formData, { isFormData: true });
}

// GET /api/doctor/tomorrow-plans
export function getTomorrowPlans() {
  return api.get("/doctor/tomorrow-plans");
}

// GET /api/doctor/today-treatments
export function getTodayTreatments() {
  return api.get("/doctor/today-treatments");
}

// GET /api/doctor/conflict-check
export function getConflictCheck() {
  return api.get("/doctor/conflict-check");
}
