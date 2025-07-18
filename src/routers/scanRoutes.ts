import express from "express";
import { scan } from "../controllers/scanController";
import { upload } from "../config/multer";

const router = express.Router();

router.use(express.json());
router.post("/", upload.single("file"), scan);

export default router;
