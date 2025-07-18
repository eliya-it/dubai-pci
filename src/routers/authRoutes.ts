import { Router } from "express";
import {
  signup,
  login,
  setupMfa,
  protect,
  verifyMfa,
  verifyMfaSetup,
} from "../controllers/authController";
import { mfaProtect } from "../middlewares/mfaMiddleware";

const router = Router();

// Auth routes
router.post("/signup", signup);
router.post("/login", login);


router.post("/mfa/setup", protect, setupMfa);
router.post("/mfa/verifySetup", protect, verifyMfaSetup);
router.post("/mfa/verify", mfaProtect, verifyMfa);
export default router;
