import FitParser from "fit-file-parser";
import { readFileSync } from "fs";

const files = [
  "E:/体育产品/南京市_跑步20260307073141.fit.bin_tmp",
  "E:/体育产品/武汉市_跑步20260504092741.fit.bin_tmp",
];

async function main() {
  for (const filePath of files) {
    console.log("\n" + "=".repeat(60));
    console.log("📂 文件:", filePath.split("/").pop());
    console.log("=".repeat(60));

    try {
      const fitData = readFileSync(filePath);
      console.log("✅ 文件读取成功，大小:", fitData.length, "bytes");

      const fitParser = new FitParser({
        force: true,
        speedUnit: "km/h",
        lengthUnit: "km",
        temperatureUnit: "celsius",
        elapsedRecordField: true,
        mode: "cascade",
      });

      const result = await fitParser.parseAsync(fitData);

      // 文件信息
      if (result.file_ids?.[0]) {
        const fi = result.file_ids[0];
        console.log("\n⌚ 设备信息:");
        console.log("  - 制造商:", fi.manufacturer);
        console.log("  - 产品:", fi.product_name || fi.product);
        console.log("  - 创建时间:", fi.time_created);
      }

      // 活动信息
      const activity = result.activity;
      if (!activity) { console.log("❌ 无活动数据"); continue; }

      console.log("\n🏃 活动概览:");
      console.log("  - 时间戳:", activity.timestamp);
      console.log("  - 总时间:", activity.total_timer_time, "秒 =", Math.round(activity.total_timer_time / 60), "分钟");
      console.log("  - Session数:", activity.num_sessions);

      // Session 数据
      const sessions = activity.sessions || [];
      console.log("\n📊 Session 数据 (" + sessions.length + " 个):");
      sessions.forEach((s, i) => {
        console.log(`\n  Session ${i + 1}:`);
        console.log("    - 运动类型:", s.sport);
        console.log("    - 开始时间:", s.start_time);
        console.log("    - 总时间:", Math.round(s.total_elapsed_time), "秒 =", (s.total_elapsed_time / 60).toFixed(1), "分钟");
        console.log("    - 总距离:", (s.total_distance).toFixed(2), "km");
        console.log("    - 平均速度:", (s.avg_speed).toFixed(2), "km/h");
        console.log("    - 最大速度:", (s.max_speed).toFixed(2), "km/h");
        console.log("    - 平均配速:", (60 / s.avg_speed).toFixed(2), "min/km");
        console.log("    - 平均心率:", s.avg_heart_rate, "bpm");
        console.log("    - 最大心率:", s.max_heart_rate, "bpm");
        console.log("    - 最小心率:", s.min_heart_rate, "bpm");
        console.log("    - 平均步频:", s.avg_cadence, "spm");
        console.log("    - 最大步频:", s.max_cadence, "spm");
        console.log("    - 平均步幅:", s.avg_step_length, "mm =", (s.avg_step_length / 1000).toFixed(2), "m");
        console.log("    - 总卡路里:", s.total_calories, "kcal");
        console.log("    - 总爬升:", s.total_ascent, "m");
        console.log("    - 总下降:", s.total_descent, "m");
        console.log("    - 平均功率:", s.avg_power, "w");
        console.log("    - 平均温度:", s.avg_temperature, "°C");

        // Lap 数据
        const laps = s.laps || [];
        console.log(`\n  🔄 Lap 数据 (${laps.length} 圈):`);
        laps.forEach((lap, j) => {
          const dist = lap.total_distance ? lap.total_distance.toFixed(2) : "N/A";
          const time = lap.total_elapsed_time ? Math.round(lap.total_elapsed_time) : "N/A";
          const pace = lap.avg_speed ? (60 / lap.avg_speed).toFixed(2) + " min/km" : "N/A";
          const hr = lap.avg_heart_rate || "N/A";
          console.log(`    圈${j + 1}: ${dist}km, ${time}s, 配速${pace}, 心率${hr}bpm`);
        });

        // Record 数据（从所有 laps 中收集）
        const allRecords = [];
        laps.forEach((lap) => {
          if (lap.records) allRecords.push(...lap.records);
        });

        console.log(`\n  📈 Record 数据 (逐秒记录):`);
        console.log("    - 总记录数:", allRecords.length);

        if (allRecords.length > 0) {
          const first = allRecords[0];
          const last = allRecords[allRecords.length - 1];
          console.log("    - 开始时间:", first.timestamp);
          console.log("    - 结束时间:", last.timestamp);
          console.log("    - 数据字段:", Object.keys(first).join(", "));

          // 心率统计
          const hrData = allRecords.filter((r) => r.heart_rate);
          if (hrData.length > 0) {
            const hrValues = hrData.map((r) => r.heart_rate);
            console.log("\n    ❤️ 心率:");
            console.log("      范围:", Math.min(...hrValues), "-", Math.max(...hrValues), "bpm");
            console.log("      平均:", Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length), "bpm");
            console.log("      数据点:", hrData.length);
          }

          // 速度统计
          const speedData = allRecords.filter((r) => r.speed);
          if (speedData.length > 0) {
            const speeds = speedData.map((r) => r.speed * 3.6);
            console.log("\n    🏃 速度:");
            console.log("      范围:", Math.min(...speeds).toFixed(1), "-", Math.max(...speeds).toFixed(1), "km/h");
            console.log("      平均:", (speeds.reduce((a, b) => a + b, 0) / speeds.length).toFixed(1), "km/h");
          }

          // GPS数据
          const gpsData = allRecords.filter((r) => r.position_lat && r.position_long);
          if (gpsData.length > 0) {
            console.log("\n    📍 GPS:", gpsData.length, "个点");
            console.log("      起点:", gpsData[0].position_lat.toFixed(6), gpsData[0].position_long.toFixed(6));
            console.log("      终点:", gpsData[gpsData.length - 1].position_lat.toFixed(6), gpsData[gpsData.length - 1].position_long.toFixed(6));
          }

          // 步频
          const cadData = allRecords.filter((r) => r.cadence);
          if (cadData.length > 0) {
            const cads = cadData.map((r) => r.cadence);
            console.log("\n    👟 步频:", Math.min(...cads), "-", Math.max(...cads), "spm");
          }

          // 海拔
          const altData = allRecords.filter((r) => r.altitude);
          if (altData.length > 0) {
            const alts = altData.map((r) => r.altitude);
            console.log("\n    ⛰️ 海拔:", Math.min(...alts).toFixed(0), "-", Math.max(...alts).toFixed(0), "m");
          }

          // 距离
          const distData = allRecords.filter((r) => r.distance !== undefined);
          if (distData.length > 0) {
            console.log("\n    📏 最终距离:", (distData[distData.length - 1].distance).toFixed(2), "km");
          }
        }
      });

    } catch (err) {
      console.error("❌ 解析失败:", err.message);
    }
  }

  console.log("\n✅ 测试完成");
}

main().catch(console.error);
