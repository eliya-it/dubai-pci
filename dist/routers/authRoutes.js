"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const mfaMiddleware_1 = require("../middlewares/mfaMiddleware");
const router = (0, express_1.Router)();
// Auth routes
router.post("/signup", authController_1.signup);
router.post("/login", authController_1.login);
router.post("/mfa/setup", authController_1.protect, authController_1.setupMfa);
router.post("/mfa/verifySetup", authController_1.protect, authController_1.verifyMfaSetup);
router.post("/mfa/verify", mfaMiddleware_1.mfaProtect, authController_1.verifyMfa);
exports.default = router;
