import "./cron/patchJob";
import express, {
  Router,
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import paymentsRouter from "./routers/paymentRoutes";
import authRouter from "./routers/authRoutes";
import scanRouter from "./routers/scanRoutes";
import dotenv from "dotenv";
import { auditLog } from "./middlewares/auditLog";
import { firewall } from "./middlewares/firewall";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { applySecureHeaders, secureHeaders } from "./helpers/secure-headers";
import { checkRequiredEnvVars } from "./helpers/checkEnv";
import { globalErrorHandler } from "./helpers/errorHandler";

const app = express();
dotenv.config({ path: ".env" });
checkRequiredEnvVars();

// Body parsing middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));


// Error handling for JSON parsing
const jsonErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }
  next();
};
app.use(jsonErrorHandler);

// Security and audit middlewares
app.use(helmet());
app.use(
  helmet.hsts({
    maxAge: 31536000, // This means: 1 year in seconds
    includeSubDomains: true,
    preload: true,
  })
);
app.use(secureHeaders);
// Force redirect to HTTPS (Express-level fallback)
// Use it in production
// app.use((req, res, next) => {
//   if (req.headers["x-forwarded-proto"] !== "https") {
//     return res.redirect("https://" + req.headers.host + req.url);
//   }
//   next();
// });

app.use(firewall);
app.use(auditLog);

// Development Only
app.use((req: Request, res: Response, next: NextFunction) => {
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
  applySecureHeaders(res);
  res.status(200).send("Welcome to the API");
});

app.get("/robots.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  applySecureHeaders(res);
  res.status(200).send("User-agent: *\nDisallow:");
});

app.get("/sitemap.xml", (req, res) => {
  res.setHeader("Content-Type", "application/xml");
  applySecureHeaders(res);
  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    </urlset>`);
});

app.use("/api/v1/payments", paymentsRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/scan", scanRouter);
app.use(cookieParser());

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

// Global error handler
app.use(globalErrorHandler);

export default app;
