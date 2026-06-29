import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { writeFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../../data");

// ============================================
// 文件级写锁：防止同一文件并发写入
// ============================================
const fileLocks = new Map();

function acquireLock(filePath) {
  const prev = fileLocks.get(filePath) || Promise.resolve();
  let release;
  const next = new Promise((resolve) => { release = resolve; });
  fileLocks.set(filePath, prev.then(() => next));
  return prev.then(() => release);
}

export async function safeWriteFile(filePath, data) {
  const release = await acquireLock(filePath);
  try {
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  } finally {
    release();
  }
}

// 确保 data 目录存在
mkdirSync(DATA_DIR, { recursive: true });

// ============================================
// JSON 文件数据库
// ============================================
class JsonDB {
  constructor(name) {
    this.filePath = join(DATA_DIR, `${name}.json`);
    this.data = [];
    this.nextId = 1;
    this.load();
  }

  load() {
    if (existsSync(this.filePath)) {
      try {
        const raw = readFileSync(this.filePath, "utf-8");
        const parsed = JSON.parse(raw);
        this.data = parsed.data || [];
        this.nextId = parsed.nextId || this.data.length + 1;
      } catch {
        this.data = [];
        this.nextId = 1;
      }
    }
  }

  save() {
    safeWriteFile(this.filePath, { data: this.data, nextId: this.nextId });
  }

  // 查找所有
  findAll(filter = {}) {
    return this.data.filter((item) => {
      for (const [key, value] of Object.entries(filter)) {
        if (value !== undefined && value !== null && item[key] !== value) return false;
      }
      return true;
    });
  }

  // 查找单个
  findOne(filter) {
    return this.data.find((item) => {
      for (const [key, value] of Object.entries(filter)) {
        if (item[key] !== value) return false;
      }
      return true;
    }) || null;
  }

  // 按ID查找
  findById(id) {
    return this.data.find((item) => item.id === id) || null;
  }

  // 创建
  create(record) {
    const now = new Date().toISOString();
    const newRecord = {
      id: this.nextId++,
      ...record,
      created_at: record.created_at || now,
      updated_at: record.updated_at || now,
    };
    this.data.push(newRecord);
    this.save();
    return newRecord;
  }

  // 更新
  update(id, updates) {
    const index = this.data.findIndex((item) => item.id === id);
    if (index === -1) return null;
    const now = new Date().toISOString();
    this.data[index] = { ...this.data[index], ...updates, updated_at: now };
    this.save();
    return this.data[index];
  }

  // 删除
  delete(id) {
    const index = this.data.findIndex((item) => item.id === id);
    if (index === -1) return false;
    this.data.splice(index, 1);
    this.save();
    return true;
  }

  // 计数
  count(filter = {}) {
    return this.findAll(filter).length;
  }

  // 查询（简化版SQL-like）
  query(options = {}) {
    let result = [...this.data];

    // 过滤
    if (options.where) {
      result = result.filter((item) => {
        for (const [key, condition] of Object.entries(options.where)) {
          if (typeof condition === "object" && condition !== null) {
            // 支持操作符: { $gte: 5, $lte: 10 }
            if (condition.$eq !== undefined && item[key] !== condition.$eq) return false;
            if (condition.$ne !== undefined && item[key] === condition.$ne) return false;
            if (condition.$gte !== undefined && item[key] < condition.$gte) return false;
            if (condition.$lte !== undefined && item[key] > condition.$lte) return false;
            if (condition.$gt !== undefined && item[key] <= condition.$gt) return false;
            if (condition.$lt !== undefined && item[key] >= condition.$lt) return false;
            if (condition.$like !== undefined && !String(item[key]).includes(condition.$like)) return false;
            if (condition.$in !== undefined && !condition.$in.includes(item[key])) return false;
          } else {
            if (item[key] !== condition) return false;
          }
        }
        return true;
      });
    }

    // 排序
    if (options.orderBy) {
      const [field, direction] = options.orderBy;
      result.sort((a, b) => {
        if (a[field] < b[field]) return direction === "ASC" ? -1 : 1;
        if (a[field] > b[field]) return direction === "ASC" ? 1 : -1;
        return 0;
      });
    }

    // 限制
    if (options.limit) {
      result = result.slice(0, options.limit);
    }

    return result;
  }
}

// ============================================
// 创建所有数据库表
// ============================================
const db = {
  teams: new JsonDB("teams"),
  users: new JsonDB("users"),
  athlete_profiles: new JsonDB("athlete_profiles"),
  training_plans: new JsonDB("training_plans"),
  training_sessions: new JsonDB("training_sessions"),
  ai_reports: new JsonDB("ai_reports"),
  injury_records: new JsonDB("injury_records"),
  treatment_records: new JsonDB("treatment_records"),
  treatment_plans: new JsonDB("treatment_plans"),
  training_notes: new JsonDB("training_notes"),
  body_composition: new JsonDB("body_composition"),
  nutrition_plans: new JsonDB("nutrition_plans"),
  supplement_records: new JsonDB("supplement_records"),
  notifications: new JsonDB("notifications"),
  coach_session_records: new JsonDB("coach_session_records"),
};

export default db;
