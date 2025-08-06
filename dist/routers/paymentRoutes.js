"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payments_1 = require("../controllers/payments");
const authController_1 = require("../controllers/authController");
const auditLog_1 = require("../middlewares/auditLog");
const router = (0, express_1.Router)();
router.use(authController_1.protect);
// router.post("/tokenize", rbac(["admin"]), tokenize);
router.post("/tokenize", payments_1.tokenize);
router.post("/test-pan", auditLog_1.auditLog, (req, res) => {
    res.send("Audit log test");
});
exports.default = router;
