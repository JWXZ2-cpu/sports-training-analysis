import FitParser from "fit-file-parser";

/**
 * 解析 FIT 文件，提取运动数据
 * @param {Buffer} fileBuffer - FIT 文件的 Buffer
 * @param {string} fileName - 原始文件名
 * @returns {Object} 解析后的结构化数据
 */
export async function parseFitFile(fileBuffer, fileName) {
  const fitParser = new FitParser({
    force: true,
    speedUnit: "km/h",
    lengthUnit: "km",
    temperatureUnit: "celsius",
    elapsedRecordField: true,
    mode: "cascade",
  });

  const result = await fitParser.parseAsync(fileBuffer);

  // 提取设备信息
  const fileInfo = result.file_ids?.[0] || {};
  const deviceName = fileInfo.product_name || fileInfo.product || "未知设备";
  const manufacturer = fileInfo.manufacturer || "";

  // 提取活动信息
  const activity = result.activity;
  if (!activity) {
    throw new Error("FIT 文件中没有活动数据");
  }

  // 提取 session 数据
  const sessions = activity.sessions || [];
  if (sessions.length === 0) {
    throw new Error("FIT 文件中没有训练 session 数据");
  }

  const session = sessions[0];

  // 提取分圈数据
  const laps = (session.laps || []).map((lap, i) => ({
    lap_number: i + 1,
    distance_meters: Math.round((lap.total_distance || 0) * 1000),
    duration_seconds: Math.round(lap.total_elapsed_time || 0),
    avg_pace_sec_per_km: lap.avg_speed ? Math.round(1000 / (lap.avg_speed / 3.6)) : null,
    avg_heart_rate: lap.avg_heart_rate || null,
    max_heart_rate: lap.max_heart_rate || null,
    avg_cadence: lap.avg_cadence || null,
    avg_power: lap.avg_power || null,
  }));

  // 从所有 laps 中收集 record 数据
  const allRecords = [];
  (session.laps || []).forEach((lap) => {
    if (lap.records) allRecords.push(...lap.records);
  });

  // 提取 GPS 点数
  const gpsPoints = allRecords.filter((r) => r.position_lat && r.position_long);

  // 提取海拔数据
  const altitudes = allRecords.filter((r) => r.altitude !== undefined).map((r) => r.altitude);
  const elevation = {
    min_meters: altitudes.length > 0 ? Math.round(Math.min(...altitudes)) : null,
    max_meters: altitudes.length > 0 ? Math.round(Math.max(...altitudes)) : null,
    gain_meters: session.total_ascent ? Math.round(session.total_ascent) : null,
  };

  // 计算配速（秒/公里）
  const avgSpeedKmh = session.avg_speed || 0;
  const maxSpeedKmh = session.max_speed || 0;
  const avgPaceSecPerKm = avgSpeedKmh > 0 ? Math.round(1000 / (avgSpeedKmh / 3.6)) : null;
  const maxPaceSecPerKm = maxSpeedKmh > 0 ? Math.round(1000 / (maxSpeedKmh / 3.6)) : null;

  // 构建返回数据
  const parsedData = {
    device: `${manufacturer} ${deviceName}`.trim(),
    file_name: fileName,
    start_time: session.start_time || activity.timestamp,
    sport_type: session.sport || "unknown",
    total_distance_meters: Math.round((session.total_distance || 0) * 1000),
    total_duration_seconds: Math.round(session.total_elapsed_time || 0),
    avg_pace_sec_per_km: avgPaceSecPerKm,
    max_pace_sec_per_km: maxPaceSecPerKm,
    avg_heart_rate: session.avg_heart_rate || null,
    max_heart_rate: session.max_heart_rate || null,
    min_heart_rate: session.min_heart_rate || null,
    avg_cadence: session.avg_cadence || null,
    avg_power: session.avg_power || null,
    calories: session.total_calories || null,
    avg_temperature: session.avg_temperature || null,
    gps_points_count: gpsPoints.length,
    elevation,
    laps,
  };

  return parsedData;
}

/**
 * 将秒数格式化为配速字符串
 * @param {number} seconds - 秒数
 * @returns {string} 如 "6:23"
 */
export function formatPace(seconds) {
  if (!seconds) return "--";
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

/**
 * 将秒数格式化为时长字符串
 * @param {number} seconds - 秒数
 * @returns {string} 如 "61.8分钟" 或 "1小时2分钟"
 */
export function formatDuration(seconds) {
  if (!seconds) return "--";
  if (seconds < 60) return `${seconds}秒`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)}分钟`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  return `${hours}小时${mins}分钟`;
}

/**
 * 格式化距离
 * @param {number} meters - 米
 * @returns {string} 如 "9.93km"
 */
export function formatDistance(meters) {
  if (!meters) return "--";
  return (meters / 1000).toFixed(2) + "km";
}
