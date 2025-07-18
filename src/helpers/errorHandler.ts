import { Request, Response, NextFunction } from "express";

type AsyncRequestHandler<T extends Request = Request> = (
  req: T,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler = <T extends Request>(fn: AsyncRequestHandler<T>) => {
  return (req: T, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const requireField = (
  res: Response,
  field: string,
  value: any
): boolean => {
  if (!value) {
    res.status(400).json({ error: `Missing required field: ${field}` });
    return false;
  }
  return true;
};

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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
