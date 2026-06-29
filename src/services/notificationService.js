/**
 * 通知相关接口
 */
import { api } from "./api.js";

// GET /api/notifications
export function getNotifications(params) {
  return api.get("/notifications", params);
}

// GET /api/notifications/unread-count
export function getUnreadCount() {
  return api.get("/notifications/unread-count");
}

// PUT /api/notifications/:id/read
export function markAsRead(id) {
  return api.put(`/notifications/${id}/read`);
}

// PUT /api/notifications/read-all
export function markAllAsRead() {
  return api.put("/notifications/read-all");
}

// DELETE /api/notifications/:id
export function deleteNotification(id) {
  return api.delete(`/notifications/${id}`);
}
