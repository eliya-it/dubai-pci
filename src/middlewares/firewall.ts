import { NextFunction, Request, Response } from "express";
import ipRangeCheck from "ip-range-check";

export const firewall = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let clientIp: string =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.socket.remoteAddress ||
    "";
  // Normalize IPv6 localhost to 127.0.0.1
  if (clientIp === "::1" || clientIp === "::ffff:127.0.0.1") {
    clientIp = "127.0.0.1";
  }

  const allowedRanges = process.env.NETWORK_IP?.split(",") || [];
  if (!allowedRanges) {
    throw new Error("NETWORK_IP environment variable is NOT set!");
  }

  // if (!ipRangeCheck(clientIp!, allowedRanges)) {
  //   // TODO: Log every blocked IP to audit log. (Req 10.6).
  //   res.status(403).send("Forbidden");
  //   return;
  // }

  next();
};
