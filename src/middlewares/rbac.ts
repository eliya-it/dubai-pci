import { asyncHandler } from "../helpers/errorHandler";

export const rbac = (roles: string[]) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "Insufficient privileges",
      });
    }
    next();
  });
