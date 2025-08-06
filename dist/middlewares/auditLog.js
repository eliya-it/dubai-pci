"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = void 0;
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function maskSensitiveFields(data) {
    const clone = Object.assign({}, data);
    if (clone.pan) {
        clone.pan = clone.pan.replace(/^(\d{6})\d+(\d{4})$/, "$1******$2"); // Mask PAN
    }
    if (clone.cvv) {
        clone.cvv = "***";
    }
    if (clone.cardholderName) {
        clone.cardholderName = "[REDACTED]";
    }
    return clone;
}
const auditLog = (req, res, next) => {
    var _a, _b;
    const sanitizedBody = maskSensitiveFields(req.body || {});
    const auditData = {
        timestamp: new Date().toISOString(),
        endpoint: req.originalUrl,
        method: req.method,
        userIP: req.ip,
        complianceStandard: "UAE SRR 4.2 / NESA IA-5", // Explicitly state
        entityId: "YOUR_MERCHANT_ID", // Required for fintech audits
        traceId: crypto_1.default.randomBytes(8).toString("hex"), // Request correlation
        // UAE Central Bank Required Fields:
        sessionHash: crypto_1.default
            .createHash("sha256")
            .update((_b = (_a = req.sessionID) !== null && _a !== void 0 ? _a : req.ip) !== null && _b !== void 0 ? _b : "unknown")
            .digest("hex"),
        integrityHash: crypto_1.default
            .createHash("sha256")
            .update(JSON.stringify(sanitizedBody))
            .digest("hex"),
    };
    console.log("[UAE_AUDIT]", auditData); // In production we can send it to CloudWatch
    const logLine = `[UAE_AUDIT] ${JSON.stringify(auditData)}\n`;
    // Save log to file
    const logFile = path_1.default.join(__dirname, "../../logs/audit.log");
    fs_1.default.appendFile(logFile, logLine, (err) => {
        if (err)
            console.error("Failed to write audit log:", err.message);
    });
    // Optional dev output
    console.log("Sanitized Body (Dev Only):", sanitizedBody);
    console.log("[UAE_AUDIT]", auditData);
    // Uncomment for production:
    // await AWS.CloudWatchLogs.putLogEvents({
    //   logGroupName: "uae-audit-logs",
    //   logStreamName: "payments",
    //   logEvents: [{ message: JSON.stringify(auditData) }]
    // }).promise();
    next();
};
exports.auditLog = auditLog;
