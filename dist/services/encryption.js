"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Encryptor = void 0;
const crypto_1 = __importStar(require("crypto"));
// Testing, for now
const dotenv_1 = __importDefault(require("dotenv"));
const safeCall_1 = require("../helpers/safeCall");
dotenv_1.default.config({ path: ".env" });
class Encryptor {
    constructor(key) {
        this.algorithm = "aes-256-cbc";
        if (!process.env.UAE_ENCRYPTION_KEY) {
            throw new Error("UAE_ENCRYPTION_KEY environment variable is not set");
        }
        this.key = Buffer.from(key, "hex");
    }
    encrypt(text) {
        return (0, safeCall_1.safeCall)(() => {
            // UAE Central Bank SRR 4.2 Compliant Encryption
            // - AES-256-CBC (Approved algorithm)
            // - Dynamic IV per NESA IA-5(1)
            const iv = crypto_1.default.randomBytes(16); // Generate new IV for each encryption
            const cipher = crypto_1.default.createCipheriv(this.algorithm, this.key, iv);
            let encrypted = cipher.update(text, "utf-8", "hex");
            encrypted += cipher.final("hex");
            return {
                id: (0, crypto_1.randomUUID)(),
                encryptedText: encrypted,
                iv: iv.toString("hex"),
            };
        });
    }
    decrypt(encryptedData) {
        return (0, safeCall_1.safeCall)(() => {
            const decipher = crypto_1.default.createDecipheriv(this.algorithm, this.key, Buffer.from(encryptedData.iv, "hex"));
            let decrypted = decipher.update(encryptedData.encryptedText, "hex", "utf-8");
            decrypted += decipher.final("utf-8");
            return decrypted;
        });
    }
}
exports.Encryptor = Encryptor;
