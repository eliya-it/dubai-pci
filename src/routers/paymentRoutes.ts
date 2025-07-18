import { Router } from "express";
import { tokenize } from "../controllers/payments";
import { protect } from "../controllers/authController";
import { rbac } from "../middlewares/rbac";
import { auditLog } from "../middlewares/auditLog";

const router = Router();

router.use(protect);
// router.post("/tokenize", rbac(["admin"]), tokenize);
router.post("/tokenize", tokenize);
router.post("/test-pan", auditLog, (req, res) => {
  res.send("Audit log test");
});
  
export default router;
