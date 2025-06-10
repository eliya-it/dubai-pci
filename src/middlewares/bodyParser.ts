import { Request, Response, NextFunction, RequestHandler } from "express";

export const validateBody: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400).json({ error: "Request body is required" });
      return;
    }
  }
  next();
};
