"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = exports.requireField = exports.asyncHandler = void 0;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const requireField = (res, field, value) => {
    if (!value) {
        res.status(400).json({ error: `Missing required field: ${field}` });
        return false;
    }
    return true;
};
exports.requireField = requireField;
const globalErrorHandler = (err, req, res, next) => {
    console.error("Global Error Handler:", err);
    if (err.name === "TokenExpiredError") {
        res.status(401).json({
            status: "fail",
            message: "Your token has expired. Please log in again.",
        });
        return;
    }
    // Handle other JWT errors
    if (err.name === "JsonWebTokenError") {
        res.status(401).json({
            status: "fail",
            message: "Invalid token. Please log in again.",
        });
        return;
    }
    // Default to 500 server error
    res.status(err.statusCode || 500).json({
        status: err.status || "error",
        message: err.message || "An unexpected error occurred.",
        // stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};
exports.globalErrorHandler = globalErrorHandler;
