"use strict";
// src/utils/checkEnv.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRequiredEnvVars = checkRequiredEnvVars;
const REQUIRED_ENV_VARS = [
    "UAE_ENCRYPTION_KEY",
    "NETWORK_IP",
    "MASTER_KEY",
    "JWT_SECRET",
    "MFA_ENCRYPTION_KEY",
    "CLAMAV_PORT",
    "CLAMAV_HOST",
    "DB_HOST",
];
function checkRequiredEnvVars() {
    var _a;
    const missing = [];
    for (const key of REQUIRED_ENV_VARS) {
        if (!process.env[key] || ((_a = process.env[key]) === null || _a === void 0 ? void 0 : _a.trim()) === "") {
            missing.push(key);
        }
    }
    if (missing.length > 0) {
        console.error(`[ENV Validation] Missing required environment variables:\n- ${missing.join("\n- ")}`);
        process.exit(1); // Exit the app
    }
    console.log("[ENV Validation] All required environment variables are set.");
}
