import { Router } from "express";
import { tokenize } from "../controllers/payments";

const router = Router();

router.post("/tokenize", tokenize);

export default router;
