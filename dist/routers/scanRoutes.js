"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const scanController_1 = require("../controllers/scanController");
const multer_1 = require("../config/multer");
const router = express_1.default.Router();
router.use(express_1.default.json());
router.post("/", multer_1.upload.single("file"), scanController_1.scan);
exports.default = router;
