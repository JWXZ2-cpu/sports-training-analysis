/**
 * API 服务层统一导出
 * 使用方式：
 *   import { authService, sessionService } from "../services";
 *   const data = await authService.login("user", "pass");
 */

export { api } from "./api.js";
export * as authService from "./authService.js";
export * as sessionService from "./sessionService.js";
export * as athleteService from "./athleteService.js";
export * as coachService from "./coachService.js";
export * as doctorService from "./doctorService.js";
export * as assistantService from "./assistantService.js";
export * as managerService from "./managerService.js";
export * as notificationService from "./notificationService.js";
export * as planService from "./planService.js";
export * as analyzeService from "./analyzeService.js";
export * as translateService from "./translateService.js";
export * as bindingService from "./bindingService.js";
export * as teamService from "./teamService.js";
