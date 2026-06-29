import multer from "multer";
import { extname } from "path";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// 文件大小超限错误处理（Express 错误中间件：4 参数）
function fileSizeLimitHandler(err, req, res, next) {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "文件大小不能超过 10MB" });
  }
  if (err) {
    return res.status(400).json({ error: err.message || "文件上传失败" });
  }
  next();
}

// FIT 文件上传配置
const fitUpload = multer({
  dest: "uploads/fit/",
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    if (ext === ".fit" || ext === ".bin_tmp") {
      cb(null, true);
    } else {
      cb(new Error("仅支持 .fit 和 .bin_tmp 格式的运动数据文件"));
    }
  },
});

// 医院检查结果上传配置
const checkUpload = multer({
  dest: "uploads/doctor-checks/",
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".pdf", ".gif", ".bmp"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("只支持图片和PDF文件"));
    }
  },
});

export { fitUpload, checkUpload, fileSizeLimitHandler };
