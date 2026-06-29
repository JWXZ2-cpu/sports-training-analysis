-- 体育训练分析系统 数据库Schema
-- SQLite3

-- ============================================
-- 1. 用户表
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN (
    'athlete', 'head_coach', 'assistant', 'doctor',
    'strength_coach', 'scientist', 'manager'
  )),
  avatar_url TEXT,
  phone TEXT,
  email TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================
-- 2. 运动员档案表（运动员专属扩展信息）
-- ============================================
CREATE TABLE IF NOT EXISTS athlete_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  sport TEXT,
  team TEXT,
  birth_date TEXT,
  gender TEXT CHECK(gender IN ('male', 'female')),
  height_cm REAL,
  weight_kg REAL,
  vdot_current REAL,
  vdot_updated_at TEXT,
  max_hr INTEGER,
  resting_hr INTEGER,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================
-- 3. 训练计划表
-- ============================================
CREATE TABLE IF NOT EXISTS training_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  plan_date TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK(plan_type IN ('daily', 'weekly', 'monthly')),
  target_athletes TEXT,
  content_json TEXT NOT NULL,
  intensity_level TEXT CHECK(intensity_level IN ('high', 'medium', 'low', 'recovery')),
  focus_body_parts TEXT,
  created_by INTEGER NOT NULL,
  approved_by INTEGER,
  approval_status TEXT NOT NULL DEFAULT 'draft' CHECK(approval_status IN ('draft', 'pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- ============================================
-- 4. 训练记录表（运动员每次训练）
-- ============================================
CREATE TABLE IF NOT EXISTS training_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  athlete_id INTEGER NOT NULL,
  session_date TEXT NOT NULL,
  session_name TEXT,
  body_score INTEGER CHECK(body_score BETWEEN 1 AND 10),
  mind_score INTEGER CHECK(mind_score BETWEEN 1 AND 10),
  difficulty_score INTEGER CHECK(difficulty_score BETWEEN 1 AND 10),
  tags TEXT,
  transcript TEXT,
  week_body_avg REAL,
  week_mind_avg REAL,
  recent_trend TEXT,
  training_phase TEXT,
  cycle_week TEXT,
  weekly_volume_trend TEXT,
  target_race_date TEXT,
  days_to_race INTEGER,
  recent_injury TEXT,
  sleep_quality TEXT,
  training_monotony TEXT,
  objective_data_json TEXT,
  plan_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (athlete_id) REFERENCES users(id),
  FOREIGN KEY (plan_id) REFERENCES training_plans(id)
);

-- ============================================
-- 5. AI分析报告表
-- ============================================
CREATE TABLE IF NOT EXISTS ai_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  athlete_id INTEGER NOT NULL,
  overall_score INTEGER,
  status_level TEXT CHECK(status_level IN ('优秀', '正常', '关注', '预警')),
  emotion_json TEXT,
  fatigue_json TEXT,
  difficulty_points TEXT,
  training_zone TEXT,
  zone_distribution_json TEXT,
  vdot_estimate REAL,
  training_quality TEXT,
  intensity_feedback TEXT,
  periodization_analysis TEXT,
  load_management_json TEXT,
  recovery_status TEXT,
  phase_alignment TEXT,
  treatment_coordination TEXT,
  body_region_conflict TEXT,
  coordination_suggestion TEXT,
  diary_text TEXT,
  coach_summary TEXT,
  recommendations TEXT,
  daniels_recommendation TEXT,
  periodization_recommendation TEXT,
  risk_flag INTEGER NOT NULL DEFAULT 0,
  risk_reason TEXT,
  raw_ai_response TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES training_sessions(id),
  FOREIGN KEY (athlete_id) REFERENCES users(id)
);

-- ============================================
-- 6. 伤病记录表
-- ============================================
CREATE TABLE IF NOT EXISTS injury_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  athlete_id INTEGER NOT NULL,
  injury_date TEXT NOT NULL,
  body_part TEXT NOT NULL,
  injury_type TEXT,
  severity TEXT CHECK(severity IN ('mild', 'moderate', 'severe')),
  description TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  recovery_status TEXT NOT NULL DEFAULT 'active' CHECK(recovery_status IN ('active', 'recovering', 'recovered')),
  estimated_recovery_date TEXT,
  actual_recovery_date TEXT,
  hospital_check_files TEXT,
  notes TEXT,
  recorded_by INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (athlete_id) REFERENCES users(id),
  FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- ============================================
-- 7. 治疗记录表（队医专属）
-- ============================================
CREATE TABLE IF NOT EXISTS treatment_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  athlete_id INTEGER NOT NULL,
  treatment_date TEXT NOT NULL,
  treatment_time TEXT,
  body_part TEXT NOT NULL,
  treatment_method TEXT NOT NULL,
  equipment TEXT,
  post_treatment_notes TEXT,
  recovery_period_hours INTEGER,
  restrictions TEXT,
  injury_id INTEGER,
  hospital_check_file TEXT,
  recorded_by INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (athlete_id) REFERENCES users(id),
  FOREIGN KEY (injury_id) REFERENCES injury_records(id),
  FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- ============================================
-- 8. 治疗计划表（队医提交的今晚/明日治疗计划）
-- ============================================
CREATE TABLE IF NOT EXISTS treatment_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  athlete_id INTEGER NOT NULL,
  planned_date TEXT NOT NULL,
  planned_time TEXT,
  body_part TEXT NOT NULL,
  treatment_method TEXT NOT NULL,
  estimated_recovery_hours INTEGER,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK(status IN ('planned', 'completed', 'cancelled')),
  conflict_checked INTEGER NOT NULL DEFAULT 0,
  conflict_result TEXT,
  recorded_by INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (athlete_id) REFERENCES users(id),
  FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- ============================================
-- 9. 训练备注/评价表（助教、教练、队医等）
-- ============================================
CREATE TABLE IF NOT EXISTS training_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  athlete_id INTEGER NOT NULL,
  session_id INTEGER,
  note_date TEXT NOT NULL,
  note_type TEXT NOT NULL CHECK(note_type IN ('observation', 'evaluation', 'feedback', 'injury_alert', 'general')),
  content TEXT NOT NULL,
  created_by INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (athlete_id) REFERENCES users(id),
  FOREIGN KEY (session_id) REFERENCES training_sessions(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ============================================
-- 10. 生理生化数据表（科研人员上传）
-- ============================================
CREATE TABLE IF NOT EXISTS body_composition (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  athlete_id INTEGER NOT NULL,
  test_date TEXT NOT NULL,
  test_type TEXT NOT NULL,
  data_json TEXT NOT NULL,
  lab_name TEXT,
  notes TEXT,
  report_file TEXT,
  uploaded_by INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (athlete_id) REFERENCES users(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- ============================================
-- 11. 营养/补剂计划表（科研人员管理）
-- ============================================
CREATE TABLE IF NOT EXISTS nutrition_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  athlete_id INTEGER NOT NULL,
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK(plan_type IN ('diet', 'supplement', 'combined')),
  start_date TEXT NOT NULL,
  end_date TEXT,
  content_json TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed', 'paused')),
  created_by INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (athlete_id) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ============================================
-- 12. 补剂使用记录表
-- ============================================
CREATE TABLE IF NOT EXISTS supplement_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  athlete_id INTEGER NOT NULL,
  plan_id INTEGER,
  supplement_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  taken_at TEXT NOT NULL,
  notes TEXT,
  recorded_by INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (athlete_id) REFERENCES users(id),
  FOREIGN KEY (plan_id) REFERENCES nutrition_plans(id),
  FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- ============================================
-- 13. 通知表
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient_id INTEGER NOT NULL,
  sender_id INTEGER,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  related_entity_type TEXT,
  related_entity_id INTEGER,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK(priority IN ('normal', 'high', 'urgent')),
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (recipient_id) REFERENCES users(id),
  FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- ============================================
-- 索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_training_sessions_athlete ON training_sessions(athlete_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_date ON training_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_ai_reports_athlete ON ai_reports(athlete_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_session ON ai_reports(session_id);
CREATE INDEX IF NOT EXISTS idx_training_plans_date ON training_plans(plan_date);
CREATE INDEX IF NOT EXISTS idx_training_plans_status ON training_plans(approval_status);
CREATE INDEX IF NOT EXISTS idx_injury_records_athlete ON injury_records(athlete_id);
CREATE INDEX IF NOT EXISTS idx_treatment_records_athlete ON treatment_records(athlete_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_date ON treatment_plans(planned_date);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_athlete ON treatment_plans(athlete_id);
CREATE INDEX IF NOT EXISTS idx_training_notes_athlete ON training_notes(athlete_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_body_composition_athlete ON body_composition(athlete_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_athlete ON nutrition_plans(athlete_id);
