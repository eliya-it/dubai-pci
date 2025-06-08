import express, { Router } from "express";
import paymentsRouter from "./routers/paymentRoutes";
import dotenv from "dotenv";
import { auditLog } from "./middlewares/auditLog";
import { firewall } from "./middlewares/firewall";
const app = express();
dotenv.config({ path: ".env" });
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Middlewares
app.use(firewall);
app.use(auditLog);

// Routes
app.use("/api/v1/payments", paymentsRouter);
export default app;
