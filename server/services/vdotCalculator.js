/**
 * 丹尼尔斯 VDOT 计算器
 * 基于 Jack Daniels' Running Formula 的 VDOT 系统
 *
 * 核心公式:
 *   VO2 = v * (0.182258 + 0.000104 * v) - 0.007288
 *   其中 v = 速度 (米/分钟)
 *
 *   %VO2max = 0.8 + 0.1894393 * e^(-0.012778 * t) + 0.2989558 * e^(-0.1932605 * t)
 *   其中 t = 比赛时间 (分钟)
 *
 *   VDOT = VO2 / (%VO2max / 100)
 */

// 比赛距离定义 (米)
const RACE_DISTANCES = {
  "1km": 1000,
  "5km": 5000,
  "10km": 10000,
  "half": 21097.5,
  "full": 42195,
};

// 比赛距离标签
const RACE_LABELS = {
  "1km": "1km",
  "5km": "5km",
  "10km": "10km",
  "half": "半马 (21.1km)",
  "full": "全马 (42.2km)",
};

/**
 * 将 mm:ss/km 配速转换为 米/分钟
 * @param {number} min - 分钟部分
 * @param {number} sec - 秒部分
 * @returns {number} 米/分钟
 */
function paceToVelocity(min, sec) {
  const totalSecPerKm = min * 60 + sec;
  return (1000 / totalSecPerKm) * 60; // 米/分钟
}

/**
 * 将 米/分钟 转换为 mm:ss/km 配速
 * @param {number} v - 米/分钟
 * @returns {string} mm:ss/km
 */
function velocityToPace(v) {
  if (!v || v <= 0) return "--:--";
  const secPerKm = (1000 / v) * 60;
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

/**
 * 将秒数转换为 mm:ss 时间格式
 * @param {number} totalSeconds
 * @returns {string} mm:ss 或 h:mm:ss
 */
function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * 解析时间字符串为秒数
 * 支持格式: "3:45:00", "45:00", "3:45", "58"
 * @param {string} timeStr
 * @returns {number} 总秒数
 */
function parseTimeToSeconds(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parts[0] || 0;
}

/**
 * 计算给定速度下能维持 t 分钟的 %VO2max
 * 丹尼尔斯公式: %VO2max = 0.8 + 0.1894393 * e^(-0.012778*t) + 0.2989558 * e^(-0.1932605*t)
 */
function percentVO2max(t) {
  return 0.8 + 0.1894393 * Math.exp(-0.012778 * t) + 0.2989558 * Math.exp(-0.1932605 * t);
}

/**
 * 计算给定速度的 VO2 值
 * VO2 = v * (0.182258 + 0.000104 * v) - 0.007288
 * 其中 v = 米/分钟
 */
function calcVO2(v) {
  return v * (0.182258 + 0.000104 * v) - 0.007288;
}

/**
 * 从 VDOT 和 %VO2max 反算速度 (米/分钟)
 * VO2 = VDOT * (%VO2max / 100)
 * v^2 * 0.000104 + v * 0.182258 - VO2 - 0.007288 = 0
 * 用求根公式
 */
function vdotToVelocity(vdot, pctVO2max) {
  const vo2 = vdot * (pctVO2max / 100);
  // 二次方程: 0.000104 * v^2 + 0.182258 * v - (vo2 + 0.007288) = 0
  const a = 0.000104;
  const b = 0.182258;
  const c = -(vo2 + 0.007288);
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return 0;
  return (-b + Math.sqrt(discriminant)) / (2 * a);
}

/**
 * 从比赛成绩计算 VDOT
 * @param {number} distanceMeters - 比赛距离 (米)
 * @param {number} timeSeconds - 完赛时间 (秒)
 * @returns {number} VDOT 值
 */
function calculateVDOT(distanceMeters, timeSeconds) {
  const t = timeSeconds / 60; // 时间 (分钟)
  const v = distanceMeters / t; // 速度 (米/分钟)
  const vo2 = calcVO2(v);
  const pct = percentVO2max(t);
  return vo2 / pct;
}

/**
 * 从 VDOT 推算 5 区训练配速和心率
 * @param {number} vdot - VDOT 值
 * @param {number} maxHR - 最大心率 (可选，默认 220-年龄)
 * @param {number} restingHR - 静息心率 (可选)
 * @returns {Object} 5 区训练数据
 */
function calculateZones(vdot, maxHR = 190, restingHR = 60) {
  // 丹尼尔斯 5 区定义 (占 VDOT 的百分比)
  // E 区: 59%-74% VO2max
  // M 区: ~84% VO2max (马拉松配速)
  // T 区: 86%-88% VO2max (乳酸阈)
  // I 区: 95%-100% VO2max (间歇)
  // R 区: >100% VO2max (重复，短距离全力)

  const zones = {
    E: { name: "E (轻松跑)", pctMin: 59, pctMax: 74, pctTypical: 65 },
    M: { name: "M (马拉松配速)", pctMin: 82, pctMax: 86, pctTypical: 84 },
    T: { name: "T (乳酸阈)", pctMin: 86, pctMax: 88, pctTypical: 87 },
    I: { name: "I (间歇)", pctMin: 95, pctMax: 100, pctTypical: 98 },
    R: { name: "R (重复)", pctMin: 100, pctMax: 110, pctTypical: 105 },
  };

  // Karvonen 公式: HR_zone = restingHR + (maxHR - restingHR) * %VO2max
  const hrReserve = maxHR - restingHR;

  const result = {};
  for (const [key, zone] of Object.entries(zones)) {
    const vMin = vdotToVelocity(vdot, zone.pctMin);
    const vMax = vdotToVelocity(vdot, zone.pctMax);
    const vTypical = vdotToVelocity(vdot, zone.pctTypical);

    const hrMin = Math.round(restingHR + hrReserve * (zone.pctMin / 100));
    const hrMax = Math.round(restingHR + hrReserve * (zone.pctMax / 100));

    result[key] = {
      name: zone.name,
      paceMin: velocityToPace(vMin), // 较慢配速 (区间上限)
      paceMax: velocityToPace(vMax), // 较快配速 (区间下限)
      paceTypical: velocityToPace(vTypical),
      hrMin: Math.min(hrMin, maxHR),
      hrMax: Math.min(hrMax, maxHR),
      pctVO2: `${zone.pctMin}-${zone.pctMax}%`,
    };
  }

  return result;
}

/**
 * 从 Conconi 测试结果计算训练区间
 * @param {Object} conconi - Conconi 测试数据
 * @param {number} conconi.aerobicThresholdHR - 有氧阈心率
 * @param {string} conconi.aerobicThresholdPace - 有氧阈配速 (mm:ss/km)
 * @param {number} conconi.anaerobicThresholdHR - 无氧阈心率
 * @param {string} conconi.anaerobicThresholdPace - 无氧阈配速 (mm:ss/km)
 * @param {number} conconi.maxHR - 最大心率
 * @returns {Object} 5 区训练数据
 */
function calculateZonesFromConconi(conconi) {
  const { aerobicThresholdHR, aerobicThresholdPace, anaerobicThresholdHR, anaerobicThresholdPace, maxHR } = conconi;

  // 解析配速
  const parsePace = (paceStr) => {
    const parts = paceStr.split(":").map(Number);
    return { min: parts[0], sec: parts[1] || 0 };
  };

  const atPace = parsePace(aerobicThresholdPace);
  const anPace = parsePace(anaerobicThresholdPace);
  const atV = paceToVelocity(atPace.min, atPace.sec);
  const anV = paceToVelocity(anPace.min, anPace.sec);

  // 有氧阈 ≈ E 区上限 / M 区下限 (~75% VO2max)
  // 无氧阈 ≈ T 区 (86-88% VO2max)
  // 用这两个锚点反推 VDOT
  // VO2_at = VDOT * 0.75 → VDOT = VO2_at / 0.75
  const vdotFromAT = calcVO2(atV) / 0.75;
  // VO2_an = VDOT * 0.87 → VDOT = VO2_an / 0.87
  const vdotFromAN = calcVO2(anV) / 0.87;
  const vdot = (vdotFromAT + vdotFromAN) / 2;

  const restingHR = 60; // 默认静息心率
  const zones = calculateZones(vdot, maxHR, restingHR);

  // 用实际 Conconi 数据覆盖 T 区 (更精确)
  zones.T.paceMin = anaerobicThresholdPace;
  zones.T.paceMax = velocityToPace(anV * 1.03);
  zones.T.hrMin = anaerobicThresholdHR;
  zones.T.hrMax = Math.round(anaerobicThresholdHR + 5);

  // 用实际 Conconi 数据覆盖 E 区上限
  zones.E.paceMax = aerobicThresholdPace;
  zones.E.hrMax = aerobicThresholdHR;

  return { vdot: Math.round(vdot * 10) / 10, zones, maxHR };
}

/**
 * 从 PB 成绩计算 VDOT 和训练区间
 * @param {string} raceType - 比赛类型 ("1km"/"5km"/"10km"/"half"/"full")
 * @param {string} timeStr - 完赛时间 ("45:00" 或 "3:15:00")
 * @param {number} maxHR - 最大心率 (可选)
 * @returns {Object} { vdot, zones, raceType, raceTime }
 */
function calculateFromPB(raceType, timeStr, maxHR = 190) {
  const distance = RACE_DISTANCES[raceType];
  if (!distance) throw new Error(`不支持的比赛类型: ${raceType}`);

  const timeSeconds = parseTimeToSeconds(timeStr);
  if (timeSeconds <= 0) throw new Error("无效的比赛时间");

  const vdot = calculateVDOT(distance, timeSeconds);
  const zones = calculateZones(vdot, maxHR);

  return {
    vdot: Math.round(vdot * 10) / 10,
    zones,
    maxHR,
    raceType,
    raceLabel: RACE_LABELS[raceType],
    raceTime: formatTime(timeSeconds),
    racePace: velocityToPace(distance / (timeSeconds / 60)),
  };
}

export {
  calculateVDOT,
  calculateZones,
  calculateZonesFromConconi,
  calculateFromPB,
  velocityToPace,
  paceToVelocity,
  formatTime,
  parseTimeToSeconds,
  RACE_DISTANCES,
  RACE_LABELS,
};
