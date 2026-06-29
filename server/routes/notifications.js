import { Router } from "express";
import db from "../db/index.js";
import { authenticateToken, getTeamUserIds } from "../middleware/auth.js";

const router = Router();

// 角色分类
const COACH_ROLES = ["head_coach", "assistant", "doctor", "manager"];

// ============================================
// GET /api/notifications — 获取通知列表
// 运动员：只看到与自己相关的通知
// 教练组：看到所有通知
// ============================================
router.get("/", authenticateToken, (req, res) => {
  try {
    const { unread_only, limit } = req.query;
    const limitNum = parseInt(limit) || 20;
    const userId = req.user.id;
    const userRole = req.user.role;

    // 获取所有通知
    let notifications = db.notifications.query({
      orderBy: ["created_at", "DESC"],
    });

    // 根据角色过滤
    notifications = notifications.filter((n) => {
      // 1. 直接发给自己的通知
      if (n.recipient_id === userId) return true;
      // 2. 在 recipient_ids 数组中
      if (n.recipient_ids && n.recipient_ids.includes(userId)) return true;
      // 3. 没有指定接收者的全局通知
      if (!n.recipient_id && !n.recipient_ids) return true;
      return false;
    });

    // 按团队过滤全局通知
    if (req.user.team_id) {
      const teamUserIds = getTeamUserIds(req.user.team_id);
      notifications = notifications.filter((n) => {
        // 用户特定通知已过滤
        if (n.recipient_id || (n.recipient_ids && n.recipient_ids.length > 0)) return true;
        // 全局通知：只显示发送者在同一团队的
        return n.sender_id ? teamUserIds.includes(n.sender_id) : true;
      });
    }

    // 根据当前用户判断已读状态
    const enrichedAll = notifications.map((n) => {
      const sender = n.sender_id ? db.users.findById(n.sender_id) : null;
      const readBy = n.read_by || [];
      const isRead = readBy.includes(userId);
      return {
        ...n,
        sender_name: sender?.display_name || "系统",
        is_read: isRead,
      };
    });

    // 过滤未读
    let filtered = enrichedAll;
    if (unread_only === "1" || unread_only === "true") {
      filtered = enrichedAll.filter((n) => !n.is_read);
    }

    const total = filtered.length;
    const sliced = filtered.slice(0, limitNum);

    const unreadCount = enrichedAll.filter((n) => !n.is_read).length;

    res.json({
      total,
      unread_count: unreadCount,
      notifications: sliced,
    });
  } catch (err) {
    console.error("获取通知失败:", err);
    res.status(500).json({ error: "获取通知失败" });
  }
});

// ============================================
// GET /api/notifications/unread-count — 获取未读数量（当前用户）
// ============================================
router.get("/unread-count", authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    let allNotifs = db.notifications.query({});

    // 按用户过滤通知
    allNotifs = allNotifs.filter((n) => {
      if (n.recipient_id === userId) return true;
      if (n.recipient_ids && n.recipient_ids.includes(userId)) return true;
      if (!n.recipient_id && !n.recipient_ids) return true;
      return false;
    });

    // 按团队过滤全局通知
    if (req.user.team_id) {
      const teamUserIds = getTeamUserIds(req.user.team_id);
      allNotifs = allNotifs.filter((n) => {
        if (n.recipient_id || (n.recipient_ids && n.recipient_ids.length > 0)) return true;
        return n.sender_id ? teamUserIds.includes(n.sender_id) : true;
      });
    }

    const count = allNotifs.filter((n) => {
      const readBy = n.read_by || [];
      return !readBy.includes(userId);
    }).length;
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "获取未读数量失败" });
  }
});

// ============================================
// PUT /api/notifications/:id/read — 标记单条为已读（当前用户）
// ============================================
router.put("/:id/read", authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const notif = db.notifications.findById(parseInt(req.params.id));
    if (!notif) return res.status(404).json({ error: "通知不存在" });

    // 将当前用户添加到 read_by 数组
    const readBy = notif.read_by || [];
    if (!readBy.includes(userId)) {
      readBy.push(userId);
      db.notifications.update(notif.id, { read_by: readBy });
    }
    res.json({ message: "已标记为已读" });
  } catch (err) {
    res.status(500).json({ error: "操作失败" });
  }
});

// ============================================
// PUT /api/notifications/read-all — 标记所有为已读（当前用户）
// ============================================
router.put("/read-all", authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    let allNotifs = db.notifications.query({});

    // 按用户过滤通知
    allNotifs = allNotifs.filter((n) => {
      if (n.recipient_id === userId) return true;
      if (n.recipient_ids && n.recipient_ids.includes(userId)) return true;
      if (!n.recipient_id && !n.recipient_ids) return true;
      return false;
    });

    // 按团队过滤全局通知
    if (req.user.team_id) {
      const teamUserIds = getTeamUserIds(req.user.team_id);
      allNotifs = allNotifs.filter((n) => {
        if (n.recipient_id || (n.recipient_ids && n.recipient_ids.length > 0)) return true;
        return n.sender_id ? teamUserIds.includes(n.sender_id) : true;
      });
    }

    let count = 0;
    for (const n of allNotifs) {
      const readBy = n.read_by || [];
      if (!readBy.includes(userId)) {
        readBy.push(userId);
        db.notifications.update(n.id, { read_by: readBy });
        count++;
      }
    }
    res.json({ message: `已标记 ${count} 条通知为已读` });
  } catch (err) {
    res.status(500).json({ error: "操作失败" });
  }
});

// ============================================
// DELETE /api/notifications/:id — 删除单条通知
// ============================================
router.delete("/:id", authenticateToken, (req, res) => {
  try {
    const notif = db.notifications.findById(parseInt(req.params.id));
    if (!notif) return res.status(404).json({ error: "通知不存在" });
    if (notif.recipient_id !== req.user.id) {
      return res.status(403).json({ error: "无权删除此通知" });
    }
    db.notifications.delete(notif.id);
    res.json({ message: "已删除" });
  } catch (err) {
    res.status(500).json({ error: "删除失败" });
  }
});

export default router;
