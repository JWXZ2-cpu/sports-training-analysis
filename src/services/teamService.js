/**
 * 团队管理接口
 */
import { api } from "./api.js";

// POST /api/teams - 创建团队
export function createTeam(name) {
  return api.post("/teams", { name });
}

// GET /api/teams/my - 获取我的团队信息
export function getMyTeam() {
  return api.get("/teams/my");
}

// POST /api/teams/invite-code/regenerate - 重新生成邀请码
export function regenerateInviteCode() {
  return api.post("/teams/invite-code/regenerate");
}

// POST /api/teams/verify-code - 验证邀请码
export function verifyInviteCode(invite_code) {
  return api.post("/teams/verify-code", { invite_code });
}

// GET /api/teams/members - 获取团队成员
export function getMembers() {
  return api.get("/teams/members");
}
