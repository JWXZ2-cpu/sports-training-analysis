import db from "../db/index.js";
import bindings from "../db/bindings.js";

/**
 * 创建单条通知
 */
export function createNotification({
  recipient_id,
  sender_id = null,
  type = "general",
  title,
  content = null,
  related_entity_type = null,
  related_entity_id = null,
  related_athlete_id = null,
  priority = "normal",
}) {
  try {
    db.notifications.create({
      recipient_id,
      sender_id,
      type,
      title,
      content,
      related_entity_type,
      related_entity_id,
      related_athlete_id,
      priority,
      is_read: 0,
      read_by: [],
    });
  } catch (err) {
    console.error("创建通知失败:", err);
  }
}

/**
 * 通知指定角色的所有用户（每个角色只创建一条通知）
 */
export function notifyRole({
  role,
  sender_id = null,
  type = "general",
  title,
  content = null,
  related_entity_type = null,
  related_entity_id = null,
  related_athlete_id = null,
  priority = "normal",
  exclude_user_id = null,
}) {
  try {
    const users = db.users.findAll({ role, is_active: 1 });
    const recipientIds = users
      .filter((u) => u.id !== exclude_user_id)
      .map((u) => u.id);

    if (recipientIds.length > 0) {
      // 只创建一条通知，用 recipient_ids 数组存储所有接收者
      db.notifications.create({
        recipient_ids: recipientIds,
        sender_id,
        type,
        title,
        content,
        related_entity_type,
        related_entity_id,
        related_athlete_id,
        priority,
        is_read: 0,
        read_by: [],
      });
    }
  } catch (err) {
    console.error("批量通知失败:", err);
  }
}

/**
 * 通知多个角色
 */
export function notifyRoles({
  roles,
  sender_id = null,
  type = "general",
  title,
  content = null,
  related_entity_type = null,
  related_entity_id = null,
  related_athlete_id = null,
  priority = "normal",
  exclude_user_id = null,
}) {
  for (const role of roles) {
    notifyRole({
      role,
      sender_id,
      type,
      title,
      content,
      related_entity_type,
      related_entity_id,
      related_athlete_id,
      priority,
      exclude_user_id,
    });
  }
}

// ============================================
// 基于绑定关系的通知分发
// ============================================

/**
 * 运动员提交训练反馈后，基于绑定关系精确分发通知
 * @param {number} athleteId - 运动员 ID
 * @param {number} sessionId - 训练记录 ID
 * @param {object} sessionInfo - 训练记录信息
 */
export function notifyTrainingSubmitted(athleteId, sessionId, sessionInfo) {
  try {
    const athlete = db.users.findById(athleteId);
    if (!athlete) return;

    const binding = bindings.getByAthleteId(athleteId);
    const sessionDate = sessionInfo?.session_date || new Date().toISOString().split("T")[0];
    const sessionName = sessionInfo?.session_name || "训练";
    const summary = sessionInfo?.transcript
      ? sessionInfo.transcript.substring(0, 50) + (sessionInfo.transcript.length > 50 ? "..." : "")
      : "已提交训练反馈";

    // 去重：今天是否已经给该运动员发过 training_feedback 通知
    const today = new Date().toISOString().split("T")[0];
    const existing = db.notifications.findOne({
      type: "training_feedback",
      related_athlete_id: athleteId,
    });
    if (existing && existing.created_at && existing.created_at.startsWith(today)) {
      return; // 今天已发过，跳过
    }

    // 1. 给运动员自己发通知
    createNotification({
      recipient_id: athleteId,
      sender_id: athleteId,
      type: "training_feedback",
      title: "训练反馈已提交",
      content: `${sessionDate} ${sessionName} 反馈已记录`,
      related_entity_type: "session",
      related_entity_id: sessionId,
      related_athlete_id: athleteId,
      priority: "normal",
    });

    // 2. 如果有绑定关系，给绑定的工作人员发通知
    if (binding) {
      const staffContent = `${athlete.display_name}提交了${sessionDate}的训练反馈：${summary}`;

      // 通知绑定的主教练
      if (binding.coach_id) {
        createNotification({
          recipient_id: binding.coach_id,
          sender_id: athleteId,
          type: "training_feedback",
          title: "运动员提交了训练反馈",
          content: staffContent,
          related_entity_type: "session",
          related_entity_id: sessionId,
          related_athlete_id: athleteId,
          priority: "normal",
        });
      }

      // 通知绑定的助教
      if (binding.assistant_id) {
        createNotification({
          recipient_id: binding.assistant_id,
          sender_id: athleteId,
          type: "training_feedback",
          title: "运动员提交了训练反馈",
          content: staffContent,
          related_entity_type: "session",
          related_entity_id: sessionId,
          related_athlete_id: athleteId,
          priority: "normal",
        });
      }

      // 通知绑定的队医
      if (binding.doctor_id) {
        createNotification({
          recipient_id: binding.doctor_id,
          sender_id: athleteId,
          type: "training_feedback",
          title: "运动员提交了训练反馈",
          content: staffContent,
          related_entity_type: "session",
          related_entity_id: sessionId,
          related_athlete_id: athleteId,
          priority: "normal",
        });
      }
    }
  } catch (err) {
    console.error("通知分发失败:", err);
  }
}

// ============================================
// 业务场景通知函数（保留旧接口兼容）
// ============================================

/**
 * 运动员提交训练反馈后通知（旧接口，保留兼容）
 */
export function notifyTrainingFeedback(athleteName, athleteId) {
  // 通知主教练和助教
  notifyRoles({
    roles: ["head_coach", "assistant"],
    type: "training_feedback",
    title: "训练反馈",
    content: `${athleteName}提交了今日训练反馈`,
    related_entity_type: "athlete",
    related_entity_id: athleteId,
    related_athlete_id: athleteId,
    priority: "normal",
  });
}

/**
 * AI报告预警通知
 */
export function notifyRiskAlert(athleteName, athleteId, riskReason) {
  // 通知主教练和助教
  notifyRoles({
    roles: ["head_coach", "assistant"],
    type: "risk_alert",
    title: "⚠️ 训练预警",
    content: `${athleteName}训练数据出现预警：${riskReason}`,
    related_entity_type: "athlete",
    related_entity_id: athleteId,
    related_athlete_id: athleteId,
    priority: "high",
  });
  // 同时通知运动员本人
  createNotification({
    recipient_id: athleteId,
    type: "risk_alert",
    title: "⚠️ 训练预警",
    content: `您的训练数据出现预警：${riskReason}`,
    related_entity_type: "athlete",
    related_entity_id: athleteId,
    related_athlete_id: athleteId,
    priority: "high",
  });
}

/**
 * 伤病预警通知队医
 */
export function notifyInjuryAlert(athleteName, athleteId, reason) {
  notifyRole({
    role: "doctor",
    type: "injury_alert",
    title: "伤病预警",
    content: `${athleteName}：${reason}`,
    related_entity_type: "athlete",
    related_entity_id: athleteId,
    related_athlete_id: athleteId,
    priority: "high",
  });
}

/**
 * 队医提交治疗计划通知
 */
export function notifyTreatmentPlan(doctorName, athleteId = null) {
  notifyRoles({
    roles: ["head_coach", "assistant"],
    type: "treatment_plan",
    title: "治疗计划",
    content: `${doctorName}提交了今晚治疗计划`,
    related_entity_type: "treatment",
    related_athlete_id: athleteId,
    priority: "normal",
  });
}

/**
 * 助教提交训练评价通知
 */
export function notifyTrainingNote(assistantName, athleteName, athleteId = null) {
  notifyRole({
    role: "head_coach",
    type: "training_note",
    title: "训练评价",
    content: `${assistantName}提交了${athleteName}的训练评价`,
    related_entity_type: "note",
    related_athlete_id: athleteId,
    priority: "normal",
  });
}

/**
 * 治疗-训练冲突通知
 */
export function notifyConflict(conflictDetails, athleteId = null) {
  notifyRoles({
    roles: ["head_coach", "assistant"],
    type: "conflict_alert",
    title: "⚠️ 治疗-训练冲突",
    content: conflictDetails,
    related_entity_type: "conflict",
    related_athlete_id: athleteId,
    priority: "high",
  });
}

/**
 * 体能教练提交计划需审批通知
 */
export function notifyPlanApproval(coachName, planTitle) {
  notifyRole({
    role: "head_coach",
    type: "plan_approval",
    title: "计划审批",
    content: `${coachName}提交了训练计划"${planTitle}"，等待审批`,
    related_entity_type: "plan",
    priority: "normal",
  });
}

/**
 * 生理数据异常通知
 */
export function notifyPhysiologyAlert(athleteName, athleteId, abnormalItems) {
  notifyRoles({
    roles: ["head_coach", "doctor"],
    type: "physiology_alert",
    title: "生理数据异常",
    content: `${athleteName}的生理数据异常：${abnormalItems}`,
    related_entity_type: "athlete",
    related_entity_id: athleteId,
    related_athlete_id: athleteId,
    priority: "high",
  });
}
