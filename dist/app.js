"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./cron/patchJob");
const express_1 = __importDefault(require("express"));
const paymentRoutes_1 = __importDefault(require("./routers/paymentRoutes"));
const authRoutes_1 = __importDefault(require("./routers/authRoutes"));
const scanRoutes_1 = __importDefault(require("./routers/scanRoutes"));
const dotenv_1 = __importDefault(require("dotenv"));
const auditLog_1 = require("./middlewares/auditLog");
const firewall_1 = require("./middlewares/firewall");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const secure_headers_1 = require("./helpers/secure-headers");
const checkEnv_1 = require("./helpers/checkEnv");
const errorHandler_1 = require("./helpers/errorHandler");
const app = (0, express_1.default)();
dotenv_1.default.config({ path: ".env" });
(0, checkEnv_1.checkRequiredEnvVars)();
// Body parsing middleware
app.use(express_1.default.json({ limit: "10kb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10kb" }));
// Error handling for JSON parsing
const jsonErrorHandler = (err, req, res, next) => {
    if (err instanceof SyntaxError && "body" in err) {
        res.status(400).json({ error: "Invalid JSON" });
        return;
    }
    next();
};
app.use(jsonErrorHandler);
// Security and audit middlewares
app.use((0, helmet_1.default)());
app.use(helmet_1.default.hsts({
    maxAge: 31536000, // This means: 1 year in seconds
    includeSubDomains: true,
    preload: true,
}));
app.use(secure_headers_1.secureHeaders);
// Force redirect to HTTPS (Express-level fallback)
// Use it in production
// app.use((req, res, next) => {
//   if (req.headers["x-forwarded-proto"] !== "https") {
//     return res.redirect("https://" + req.headers.host + req.url);
//   }
//   next();
// });
app.use(firewall_1.firewall);
app.use(auditLog_1.auditLog);
// Development Only
app.use((req, res, next) => {
    const ua = req.headers["user-agent"] || "";
    const isZAP = ua.toLowerCase().includes("zap");
    const openPaths = ["/", "/robots.txt", "/sitemap.xml"];
    if (isZAP && openPaths.includes(req.path)) {
        res.status(200).send("ZAP allowed");
        return;
    }
    next();
});
// We are adding these routes to avoid ZAP warning about missing pages.
app.get("/", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    (0, secure_headers_1.applySecureHeaders)(res);
    res.status(200).send("Welcome to the API");
});
app.get("/robots.txt", (req, res) => {
    res.setHeader("Content-Type", "text/plain");
    (0, secure_headers_1.applySecureHeaders)(res);
    res.status(200).send("User-agent: *\nDisallow:");
});
app.get("/sitemap.xml", (req, res) => {
    res.setHeader("Content-Type", "application/xml");
    (0, secure_headers_1.applySecureHeaders)(res);
    res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    </urlset>`);
});
app.use("/api/v1/payments", paymentRoutes_1.default);
app.use("/api/v1/auth", authRoutes_1.default);
app.use("/api/v1/scan", scanRoutes_1.default);
app.use((0, cookie_parser_1.default)());
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
});
// Global error handler
app.use(errorHandler_1.globalErrorHandler);
exports.default = app;
