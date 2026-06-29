/**
 * 认证相关接口
 */
import { api } from "./api.js";

// POST /api/auth/register
export function register(username, password, display_name, role) {
  return api.post("/auth/register", { username, password, display_name, role });
}

// POST /api/auth/login
export function login(username, password) {
  return api.post("/auth/login", { username, password });
}

// GET /api/auth/me
export function getMe() {
  return api.get("/auth/me");
}

// PUT /api/auth/profile
export function updateProfile(data) {
  return api.put("/auth/profile", data);
}

// GET /api/auth/users
export function getUsers(params) {
  return api.get("/auth/users", params);
}

// GET /api/auth/athletes
export function getAthletes() {
  return api.get("/auth/athletes");
}
