import jwt from "jsonwebtoken";
import { asyncHandler } from "../helpers/errorHandler";

export const mfaProtect = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).json({
      status: "fail",
      message: "You are not logged in! Please login and try again.",
    });
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
    id: string;
    mfa: boolean;
  };

  if (!decoded.mfa) {
    return res
      .status(403)
      .json({ error: "Invalid MFA token. Please login again." });
  }

  req.user = { id: decoded.id };
  next();
});
