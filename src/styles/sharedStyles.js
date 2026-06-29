/**
 * 共享样式对象
 * 颜色值全部使用 CSS 变量，修改主题只需改 variables.css
 */

// 返回按钮
export const BACK_BTN = {
  background: "none",
  border: "none",
  color: "var(--accent)",
  fontSize: 12,
  cursor: "pointer",
  marginBottom: 16,
  padding: 0,
};

// 输入框（小）
export const INPUT = {
  width: "100%",
  height: 36,
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "0 10px",
  fontSize: 12,
  color: "var(--text)",
  boxSizing: "border-box",
  outline: "none",
};

// 输入框（标准）
export const INPUT_STYLE = {
  width: "100%",
  height: 34,
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "0 10px",
  fontSize: 12,
  color: "var(--text)",
  boxSizing: "border-box",
  outline: "none",
};

// 下拉选择框
export const SELECT = {
  ...INPUT,
  cursor: "pointer",
};

// 标签
export const LABEL = {
  fontSize: 11,
  color: "var(--text-secondary)",
  display: "block",
  marginBottom: 4,
};

// 小按钮
export const SMALL_BTN = {
  padding: "4px 10px",
  borderRadius: 6,
  border: "none",
  background: "var(--accent)",
  color: "#fff",
  fontSize: 11,
  cursor: "pointer",
};

// 主按钮
export const PRIMARY_BTN = {
  width: "100%",
  padding: "12px 0",
  borderRadius: 10,
  border: "none",
  background: "var(--accent)",
  color: "#fff",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  marginTop: 12,
};

// 文本域
export const TEXTAREA_STYLE = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  fontSize: 13,
  lineHeight: 1.6,
  resize: "vertical",
  outline: "none",
  fontFamily: "inherit",
  background: "var(--surface)",
  boxSizing: "border-box",
};

// 状态颜色
export const STATUS_COLORS = {
  "优秀": { bg: "var(--green-dim)", text: "var(--green)", border: "var(--green)" },
  "正常": { bg: "var(--blue-dim)", text: "var(--blue)", border: "var(--blue)" },
  "关注": { bg: "var(--amber-dim)", text: "var(--amber)", border: "var(--amber)" },
  "预警": { bg: "var(--red-dim)", text: "var(--red)", border: "var(--red)" },
};

// 训练区间颜色
export const ZONE_COLORS = {
  E: { from: "rgba(92,159,212,0.5)", to: "var(--blue)" },
  M: { from: "rgba(107,191,110,0.5)", to: "var(--green)" },
  T: { from: "rgba(212,164,76,0.5)", to: "var(--accent)" },
  I: { from: "rgba(232,168,73,0.5)", to: "var(--amber)" },
  R: { from: "rgba(212,92,92,0.5)", to: "var(--red)" },
};

// 角色标签映射
export const ROLE_LABELS = {
  athlete: "运动员",
  head_coach: "主教练",
  assistant: "助教",
  doctor: "队医",
  manager: "管理人员",
};

// 角色首页路由映射
export const ROLE_HOME = {
  athlete: "/athlete",
  head_coach: "/coach",
  assistant: "/assistant",
  doctor: "/doctor",
  manager: "/manager",
};
