/**
 * 运动员绑定关系数据访问层
 * 复用项目现有的 JSON 文件数据库读写模式
 */
import db from "./index.js";

const bindings = new (Object.getPrototypeOf(db.users).constructor)("athlete_bindings");

/**
 * 获取所有绑定关系
 */
export function getAll() {
  return bindings.findAll();
}

/**
 * 根据运动员 ID 获取绑定关系
 */
export function getByAthleteId(athleteId) {
  return bindings.findOne({ athlete_id: athleteId });
}

/**
 * 根据工作人员 ID 获取其负责的所有运动员绑定
 */
export function getByStaffId(staffId) {
  return bindings.findAll().filter(
    (b) => b.coach_id === staffId || b.assistant_id === staffId || b.doctor_id === staffId
  );
}

/**
 * 创建绑定关系
 */
export function create(binding) {
  return bindings.create(binding);
}

/**
 * 更新绑定关系（根据运动员 ID）
 */
export function update(athleteId, updates) {
  const existing = bindings.findOne({ athlete_id: athleteId });
  if (!existing) return null;
  return bindings.update(existing.id, updates);
}

/**
 * 删除绑定关系（根据运动员 ID）
 */
export function remove(athleteId) {
  const existing = bindings.findOne({ athlete_id: athleteId });
  if (!existing) return false;
  return bindings.delete(existing.id);
}

export default { getAll, getByAthleteId, getByStaffId, create, update, remove };
