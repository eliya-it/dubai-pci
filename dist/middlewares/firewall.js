"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firewall = void 0;
const firewall = (req, res, next) => {
    var _a, _b;
    let clientIp = ((_a = req.headers["x-forwarded-for"]) === null || _a === void 0 ? void 0 : _a.split(",")[0]) ||
        req.socket.remoteAddress ||
        "";
    // Normalize IPv6 localhost to 127.0.0.1
    if (clientIp === "::1" || clientIp === "::ffff:127.0.0.1") {
        clientIp = "127.0.0.1";
    }
    const allowedRanges = ((_b = process.env.NETWORK_IP) === null || _b === void 0 ? void 0 : _b.split(",")) || [];
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
exports.firewall = firewall;
