/**
 * 助教专属接口
 */
import { api } from "./api.js";

// POST /api/assistant/notes
export function createNote(data) {
  return api.post("/assistant/notes", data);
}

// GET /api/assistant/notes
export function getNotes(params) {
  return api.get("/assistant/notes", params);
}

// GET /api/assistant/coach/notes
export function getCoachNotes(params) {
  return api.get("/assistant/coach/notes", params);
}
