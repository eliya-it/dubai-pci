import express, {
  Router,
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import paymentsRouter from "./routers/paymentRoutes";
import authRouter from "./routers/authRoutes";
import dotenv from "dotenv";
import { auditLog } from "./middlewares/auditLog";
import { firewall } from "./middlewares/firewall";
import { validateBody } from "./middlewares/bodyParser";
import cookieParser from "cookie-parser";
const app = express();
dotenv.config({ path: ".env" });

// Body parsing middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Request body validation
app.use(validateBody);

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
app.use(firewall);
app.use(auditLog);

// Routes
app.use("/api/v1/payments", paymentsRouter);
app.use("/api/v1/auth", authRouter);
app.use(cookieParser());
// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

// Global error handler
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
};
app.use(globalErrorHandler);

export default app;
