import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import path from "path";
import fs from 'fs';

function maskSensitiveFields(data: any) {
  const clone = { ...data };
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

export const auditLog = (req: Request, res: Response, next: NextFunction) => {
  const sanitizedBody = maskSensitiveFields(req.body || {});

  const auditData = {
    timestamp: new Date().toISOString(),
    endpoint: req.originalUrl,
    method: req.method,
    userIP: req.ip,
    complianceStandard: "UAE SRR 4.2 / NESA IA-5", // Explicitly state
    entityId: "YOUR_MERCHANT_ID", // Required for fintech audits
    traceId: crypto.randomBytes(8).toString("hex"), // Request correlation
    // UAE Central Bank Required Fields:
    sessionHash: crypto
      .createHash("sha256")
      .update(req.sessionID ?? req.ip ?? "unknown")
      .digest("hex"),
    integrityHash: crypto
      .createHash("sha256")
      .update(JSON.stringify(sanitizedBody))
      .digest("hex"),
  };
  console.log("[UAE_AUDIT]", auditData); // In production we can send it to CloudWatch
  const logLine = `[UAE_AUDIT] ${JSON.stringify(auditData)}\n`;
  // Save log to file
  const logFile = path.join(__dirname, "../../logs/audit.log");
  fs.appendFile(logFile, logLine, (err) => {
    if (err) console.error("Failed to write audit log:", err.message);
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
