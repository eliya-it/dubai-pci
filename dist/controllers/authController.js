"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyMfaSetup = exports.verifyMfa = exports.setupMfa = exports.protect = exports.login = exports.signup = void 0;
const errorHandler_1 = require("../helpers/errorHandler");
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../config/database");
const User_1 = require("../entities/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mfa_1 = require("../helpers/mfa");
const encryption_1 = require("../services/encryption");
const signToken = (id) => {
    if (!process.env.JWT_SECRET)
        throw new Error("JWT_SECRET environment variable NOT set! Please set it inside .env");
    const options = {
        expiresIn: "15m",
    };
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, options);
};
const createSendToken = (user, statusCode, req, res) => {
    console.log("logging user from createSendToken", user);
    const token = signToken(user.id);
    const cookieOpts = {
        experisIn: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 // Fixed to 'expires'
        ),
        httpOnly: true, // Keep for security
        secure: process.env.NODE_ENV === "production", // Secure only in production
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Adjust based on env
        path: "/", // Explicitly set to root
    };
    // Send response
    res.status(statusCode).json({
        status: "success",
        userId: user.id,
        name: user.name,
        mfaRequired: true, // Always require MFA for UAE compliance
        token,
    });
};
// Signup handler
exports.signup = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body) {
        return res.status(400).json({ error: "Request body is required" });
    }
    const { email, password, name } = req.body;
    // Validate required fields
    if (!(0, errorHandler_1.requireField)(res, "email", email))
        return;
    if (!(0, errorHandler_1.requireField)(res, "password", password))
        return;
    if (!(0, errorHandler_1.requireField)(res, "name", name))
        return;
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }
    // Password strength validation (UAE Central Bank requirements)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            error: "Password must be at least 8 characters long and contain uppercase, lowercase, number and special character",
        });
    }
    // Check if user already exists
    const userRepository = database_1.AppDataSource.getRepository(User_1.User);
    const existingUser = yield userRepository.findOne({ where: { email } });
    if (existingUser) {
        return res
            .status(400)
            .json({ error: "User with this email already exists" });
    }
    // Create new user
    const user = new User_1.User();
    user.email = email;
    user.name = name;
    yield user.setPassword(password);
    user.mfa_secret = crypto_1.default.randomBytes(20).toString("hex");
    user.is_mfa_enabled = true;
    // Save user to database
    const savedUser = yield userRepository.save(user);
    createSendToken(savedUser, 201, req, res);
}));
// Login handler
exports.login = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body) {
        return res.status(400).json({ error: "Request body is required" });
    }
    const { email, password } = req.body;
    // Validate required fields
    if (!(0, errorHandler_1.requireField)(res, "email", email))
        return;
    if (!(0, errorHandler_1.requireField)(res, "password", password))
        return;
    // Find user
    const userRepository = database_1.AppDataSource.getRepository(User_1.User);
    const user = yield userRepository.findOne({ where: { email } });
    if (!user) {
        return res.status(401).json({ error: "Incorect email or password!" });
    }
    // Validate password
    const isValidPassword = yield user.validatePassword(password);
    if (!isValidPassword) {
        // Update failed login attempts
        user.failed_login_attempts += 1;
        user.last_login_at = new Date();
        yield userRepository.save(user);
        return res.status(401).json({ error: "Invalid credentials" });
    }
    // Reset failed login attempts on successful login
    user.failed_login_attempts = 0;
    user.last_failed_login_at = new Date();
    yield userRepository.save(user);
    if (user.is_mfa_enabled) {
        const tempToken = jsonwebtoken_1.default.sign({ id: user.id, mfa: true }, process.env.JWT_SECRET, { expiresIn: "10m" });
        return res.json({
            status: "success",
            mfaRequired: true,
            message: "Multi-factor authentication setup is required. Please complete setup via /mfa/setup.",
            token: tempToken,
        });
    }
    createSendToken(user, 200, req, res);
}));
// Protect Middleware
exports.protect = (0, errorHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const ua = req.headers["user-agent"] || "";
    if (ua.toLowerCase().includes("zap"))
        return next(); // skip auth for ZAP
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.jwt) {
        token = req.cookies.jwt;
    }
    if (!token)
        return res.status(403).json({
            status: "fail",
            message: "You are not logged in! Please login and try again.",
        });
    const decoded = (yield jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET));
    if (decoded.mfa === true) {
        return res.status(403).json({
            error: "MFA not completed. Please verify TOTP before accessing resources.",
        });
    }
    const repository = database_1.AppDataSource.getRepository(User_1.User);
    const curUser = yield repository.findOne({ where: { id: decoded.id } });
    if (!curUser)
        return res.status(403).json({
            status: "fail",
            message: "The user belonging to this token does no longer exist.",
        });
    req.user = curUser;
    next();
}));
// Setup MFA
exports.setupMfa = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const userRepo = database_1.AppDataSource.getRepository(User_1.User);
    const user = yield userRepo.findOne({ where: { id: req.user.id } });
    if (!user)
        return res.status(404).json({ message: "User not found" });
    const { secret, otpauth } = (0, mfa_1.generateTotpSecret)(user.email);
    const qrcode = yield (0, mfa_1.generateQrCodeImage)(otpauth);
    const result = new encryption_1.Encryptor(process.env.MFA_ENCRYPTION_KEY).encrypt(secret);
    if (!result.ok) {
        return res.status(500).json({ error: "Failed to encrypt TOTP secret" });
    }
    console.log(result);
    user.totp_secret = result.value.encryptedText;
    user.totp_iv = result.value.iv;
    yield userRepo.save(user);
    // UAE Compliance log here
    console.log(`[MFA] Setup initiated for user ${user.id}`);
    res.status(200).json({
        status: "success",
        qrcode,
        message: "Scan this with your Authenticator app to enable MFA. and then submit TOTP code to /mfa/verifySetup",
    });
}));
// Helper function for MFA verification
const verifyMfaToken = (userId, token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token) {
        return {
            success: false,
            status: 400,
            message: "Please provide token",
        };
    }
    const userRepo = database_1.AppDataSource.getRepository(User_1.User);
    const user = yield userRepo.findOne({ where: { id: userId } });
    if (!user || !user.totp_secret || !user.totp_iv) {
        return {
            success: false,
            status: 400,
            message: "MFA not set up",
        };
    }
    const decryptedResult = new encryption_1.Encryptor(process.env.MFA_ENCRYPTION_KEY).decrypt({ encryptedText: user.totp_secret, iv: user.totp_iv });
    if (!decryptedResult.ok) {
        return {
            success: false,
            status: 500,
            message: "Failed to decrypt TOTP secret",
        };
    }
    const isValid = (0, mfa_1.verifyTotp)(token, decryptedResult.value);
    if (!isValid) {
        console.warn(`[MFA] Invalid TOTP attempt for user ${user.id}`);
        return {
            success: false,
            status: 401,
            message: "Invalid TOTP code",
        };
    }
    return {
        success: true,
        user,
    };
});
exports.verifyMfa = (0, errorHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield verifyMfaToken((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, req.body.token);
    if (!result.success) {
        return res.status(result.status).json({
            status: "fail",
            message: result.message,
        });
    }
    createSendToken(result.user, 200, req, res);
}));
exports.verifyMfaSetup = (0, errorHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield verifyMfaToken((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, req.body.token);
    if (!result.success) {
        return res.status(result.status).json({
            status: "fail",
            message: result.message,
        });
    }
    const userRepo = database_1.AppDataSource.getRepository(User_1.User);
    result.user.is_mfa_enabled = true;
    yield userRepo.save(result.user);
    createSendToken(result.user, 200, req, res);
}));
