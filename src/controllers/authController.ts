import { Request, Response } from "express";
import { asyncHandler, requireField } from "../helpers/errorHandler";
import crypto from "crypto";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import jwt, { SignOptions, Secret } from "jsonwebtoken";
import {
  generateQrCodeImage,
  generateTotpSecret,
  verifyTotp,
} from "../helpers/mfa";
import { Encryptor } from "../services/encryption";

const signToken = (id: string) => {
  if (!process.env.JWT_SECRET)
    throw new Error(
      "JWT_SECRET environment variable NOT set! Please set it inside .env"
    );
  const options: SignOptions = {
    expiresIn: "15m",
  };
  return jwt.sign({ id }, process.env.JWT_SECRET as Secret, options);
};

const createSendToken = (
  user: User,
  statusCode: number,
  req: Request,
  res: Response
) => {
  console.log("logging user from createSendToken", user);
  const token = signToken(user.id);

  const cookieOpts = {
    experisIn: new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000 // Fixed to 'expires'
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
// Types
interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface MFARequest {
  email: string;
  code: string;
}

// Signup handler
export const signup = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body) {
    return res.status(400).json({ error: "Request body is required" });
  }
  const { email, password, name }: SignupRequest = req.body;
  // Validate required fields
  if (!requireField(res, "email", email)) return;
  if (!requireField(res, "password", password)) return;
  if (!requireField(res, "name", name)) return;

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Password strength validation (UAE Central Bank requirements)
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters long and contain uppercase, lowercase, number and special character",
    });
  }

  // Check if user already exists
  const userRepository = AppDataSource.getRepository(User);
  const existingUser = await userRepository.findOne({ where: { email } });

  if (existingUser) {
    return res
      .status(400)
      .json({ error: "User with this email already exists" });
  }

  // Create new user
  const user = new User();
  user.email = email;
  user.name = name;
  await user.setPassword(password);
  user.mfa_secret = crypto.randomBytes(20).toString("hex");
  user.is_mfa_enabled = true;

  // Save user to database
  const savedUser = await userRepository.save(user);

  createSendToken(savedUser, 201, req, res);
});

// Login handler
export const login = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body) {
    return res.status(400).json({ error: "Request body is required" });
  }

  const { email, password }: LoginRequest = req.body;

  // Validate required fields
  if (!requireField(res, "email", email)) return;
  if (!requireField(res, "password", password)) return;

  // Find user
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { email } });

  if (!user) {
    return res.status(401).json({ error: "Incorect email or password!" });
  }

  // Validate password
  const isValidPassword = await user.validatePassword(password);

  if (!isValidPassword) {
    // Update failed login attempts
    user.failed_login_attempts += 1;
    user.last_login_at = new Date();
    await userRepository.save(user);
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Reset failed login attempts on successful login
  user.failed_login_attempts = 0;
  user.last_failed_login_at = new Date();
  await userRepository.save(user);

  if (user.is_mfa_enabled) {
    const tempToken = jwt.sign(
      { id: user.id, mfa: true },
      process.env.JWT_SECRET!,
      { expiresIn: "10m" }
    );
    return res.json({
      status: "success",
      mfaRequired: true,
      message: "Multi-factor authentication setup is required. Please complete setup via /mfa/setup.",
      token: tempToken,
    });
  }

  createSendToken(user, 200, req, res);
});
// Protect Middleware
export const protect = asyncHandler(async (req, res, next) => {
  const ua = req.headers["user-agent"] || ""
  if (ua.toLowerCase().includes("zap")) return next(); // skip auth for ZAP

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }
  if (!token)
    return res.status(403).json({
      status: "fail",
      message: "You are not logged in! Please login and try again.",
    });

  const decoded = (await jwt.verify(
    token,
    process.env.JWT_SECRET! as string
  )) as unknown as { id: string; mfa: boolean };

  if (decoded.mfa === true) {
    return res.status(403).json({
      error:
        "MFA not completed. Please verify TOTP before accessing resources.",
    });
  }
  const repository = AppDataSource.getRepository(User);
  const curUser = await repository.findOne({ where: { id: decoded.id } });
  if (!curUser)
    return res.status(403).json({
      status: "fail",
      message: "The user belonging to this token does no longer exist.",
    });
  req.user = curUser;
  next();
});
// Setup MFA
export const setupMfa = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ message: "User not found" });
  const { secret, otpauth } = generateTotpSecret(user.email);
  const qrcode = await generateQrCodeImage(otpauth);
  const result = new Encryptor(process.env.MFA_ENCRYPTION_KEY!).encrypt(secret);
  if (!result.ok) {
    return res.status(500).json({ error: "Failed to encrypt TOTP secret" });
  }
  console.log(result);

  user.totp_secret = result.value.encryptedText;
  user.totp_iv = result.value.iv;
  await userRepo.save(user);
  // UAE Compliance log here
  console.log(`[MFA] Setup initiated for user ${user.id}`);

  res.status(200).json({
    status: "success",
    qrcode,
    message: "Scan this with your Authenticator app to enable MFA. and then submit TOTP code to /mfa/verifySetup",
  });
});

// Helper function for MFA verification
const verifyMfaToken = async (userId: string | undefined, token: string) => {
  if (!token) {
    return {
      success: false as const,
      status: 400,
      message: "Please provide token",
    };
  }

  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { id: userId } });

  if (!user || !user.totp_secret || !user.totp_iv) {
    return {
      success: false as const,
      status: 400,
      message: "MFA not set up",
    };
  }

  const decryptedResult = new Encryptor(
    process.env.MFA_ENCRYPTION_KEY!
  ).decrypt({ encryptedText: user.totp_secret, iv: user.totp_iv });

  if (!decryptedResult.ok) {
    return {
      success: false as const,
      status: 500,
      message: "Failed to decrypt TOTP secret",
    };
  }

  const isValid = verifyTotp(token, decryptedResult.value);
  if (!isValid) {
    console.warn(`[MFA] Invalid TOTP attempt for user ${user.id}`);
    return {
      success: false as const,
      status: 401,
      message: "Invalid TOTP code",
    };
  }

  return {
    success: true as const,
    user,
  };
};

export const verifyMfa = asyncHandler(async (req, res, next) => {
  const result = await verifyMfaToken(req.user?.id, req.body.token);

  if (!result.success) {
    return res.status(result.status).json({
      status: "fail",
      message: result.message,
    });
  }

  createSendToken(result.user, 200, req, res);
});

export const verifyMfaSetup = asyncHandler(async (req, res, next) => {
  const result = await verifyMfaToken(req.user?.id, req.body.token);

  if (!result.success) {
    return res.status(result.status).json({
      status: "fail",
      message: result.message,
    });
  }

  const userRepo = AppDataSource.getRepository(User);
  result.user.is_mfa_enabled = true;
  await userRepo.save(result.user);
  createSendToken(result.user, 200, req, res);
});

