import { Request, Response, NextFunction } from "express";

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler = (fn: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
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
