import { Router } from "express";
import { tokenize } from "../controllers/payments";
import { protect } from "../controllers/authController";

const router = Router();

router.use(protect);
router.post("/tokenize", tokenize);

export default router;
