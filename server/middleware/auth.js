import jwt from "jsonwebtoken";
import db from "../db/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "training-analysis-secret-key-2026";

// 获取团队内所有用户 ID（用于数据表间接过滤）
export function getTeamUserIds(teamId) {
  if (!teamId) return null;
  return db.users.findAll({ team_id: teamId }).map((u) => u.id);
}

// 检查用户是否在指定团队中
export function isUserInTeam(userId, teamId) {
  if (!teamId) return true; // 无团队限制时放行
  const user = db.users.findById(userId);
  return user && user.team_id === teamId;
}

// 角色权限定义
const ROLE_PERMISSIONS = {
  athlete: {
    canView: ["own_sessions", "own_reports", "own_plans_today", "own_plans_week", "own_injuries"],
    canEdit: ["own_sessions"],
    canCreate: ["own_sessions"],
    canViewAll: false,
    label: "运动员",
  },
  head_coach: {
    canView: ["all_sessions", "all_reports", "all_plans", "all_injuries", "all_treatments", "all_notes", "all_athletes", "ai_planning"],
    canEdit: ["all_plans", "all_sessions"],
    canCreate: ["all_plans"],
    canApprove: ["plans"],
    canViewAll: true,
    label: "主教练",
  },
  assistant: {
    canView: ["all_sessions", "all_reports", "all_plans", "all_injuries", "all_treatments", "all_athletes"],
    canEdit: [],
    canCreate: ["training_notes"],
    canViewAll: true,
    label: "助教",
  },
  doctor: {
    canView: ["all_sessions", "all_reports", "all_plans", "all_injuries", "all_treatments", "all_athletes"],
    canEdit: ["own_treatments", "own_injuries"],
    canCreate: ["injury_records", "treatment_records", "treatment_plans", "hospital_checks"],
    canViewAll: true,
    label: "队医",
  },
  manager: {
    canView: ["overview", "attendance", "plans_overview", "coach_records"],
    canEdit: [],
    canCreate: [],
    canExport: true,
    canViewAll: false,
    label: "管理人员",
  },
};

// JWT验证中间件
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "未登录，请先登录" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "登录已过期，请重新登录" });
  }
}

// 角色检查中间件
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "未登录" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "无权访问此功能" });
    }
    next();
  };
}

// 权限检查中间件
export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "未登录" });
    }
    const perms = ROLE_PERMISSIONS[req.user.role];
    if (!perms) {
      return res.status(403).json({ error: "未知角色" });
    }
    // 检查是否在 canView/canEdit/canCreate 中
    const allPerms = [...(perms.canView || []), ...(perms.canEdit || []), ...(perms.canCreate || [])];
    if (perms.canApprove) allPerms.push(...perms.canApprove);
    if (perms.canExport) allPerms.push("export");

    if (!allPerms.includes(permission) && !perms.canViewAll) {
      return res.status(403).json({ error: "无此权限" });
    }
    next();
  };
}

// 数据过滤函数：根据角色过滤运动员数据
export function filterAthleteData(req, data, athleteIdField = "athlete_id") {
  if (req.user.role === "athlete") {
    // 运动员只能看自己的数据
    return data.filter((item) => item[athleteIdField] === req.user.id);
  }
  // 其他角色可以看到所有运动员数据
  return data;
}

// 生成JWT token
export function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, display_name: user.display_name, team_id: user.team_id || null },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

export { JWT_SECRET, ROLE_PERMISSIONS };
