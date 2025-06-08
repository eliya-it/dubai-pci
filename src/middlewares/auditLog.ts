import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export const auditLog = (req: Request, res: Response, next: NextFunction) => {
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
      .update(JSON.stringify(req.body))
      .digest("hex"),
  };
  console.log("[UAE_AUDIT]", auditData); // In production we can send it to CloudWatch

  // Uncomment for production:
  // await AWS.CloudWatchLogs.putLogEvents({
  //   logGroupName: "uae-audit-logs",
  //   logStreamName: "payments",
  //   logEvents: [{ message: JSON.stringify(auditData) }]
  // }).promise();

  next();
};
