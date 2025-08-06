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
exports.tokenize = void 0;
const crypto_1 = __importDefault(require("crypto"));
const errorHandler_1 = require("../helpers/errorHandler");
const encryption_1 = require("../services/encryption");
const database_1 = require("../config/database");
const Token_1 = require("../entities/Token");
// PCI DSS 3.4 + UAE Central Bank SRR 4.2
exports.tokenize = (0, errorHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pan = req.body.pan;
    if (!pan)
        return (0, errorHandler_1.requireField)(res, "pan", pan);
    // UAE Central Bank PAN validation (SRR 4.2.3)
    if (!/^\d{13,19}$/.test(pan)) {
        return res.status(400).json({ error: "Invalid PAN" });
    }
    // Generate token (PCI DSS Req 3.4)
    const token = `tok_${crypto_1.default.randomBytes(8).toString("hex")}`;
    // Encrypt PAN (UAE SRR 4.2)
    const result = new encryption_1.Encryptor(process.env.UAE_ENCRYPTION_KEY).encrypt(pan);
    if (!result.ok) {
        return res.status(500).json({ error: result.error.message });
    }
    const { iv, encryptedText, id } = result.value;
    const fullToken = `${id}|${iv}|${encryptedText}`;
    const tokenRepo = database_1.AppDataSource.getRepository(Token_1.Token);
    const newToken = tokenRepo.create({
        token,
        iv,
        ciphertext: encryptedText,
    });
    yield tokenRepo.save(newToken);
    // Response aligns with Dubai fintech standards
    res.status(200).json({
        status: "success",
        token,
        compliance: "PCI DSS 3.4 / UAE SRR 4.2",
    });
}));
