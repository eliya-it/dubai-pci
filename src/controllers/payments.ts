import crypto from "crypto";
import { asyncHandler, requireField } from "../helpers/errorHandler";
import { Encryptor } from "../services/encryption";
import { AppDataSource } from "../config/database";
import { Token } from "../entities/Token";

// PCI DSS 3.4 + UAE Central Bank SRR 4.2
export const tokenize = asyncHandler(async (req, res, next) => {
  

  const pan: string = req.body.pan;
  if (!pan) return requireField(res, "pan", pan);

  // UAE Central Bank PAN validation (SRR 4.2.3)
  if (!/^\d{13,19}$/.test(pan)) {
    return res.status(400).json({ error: "Invalid PAN" });
  }

  // Generate token (PCI DSS Req 3.4)
  const token = `tok_${crypto.randomBytes(8).toString("hex")}`;

  // Encrypt PAN (UAE SRR 4.2)
  const result = new Encryptor(process.env.UAE_ENCRYPTION_KEY!).encrypt(pan);

  if (!result.ok) {
    return res.status(500).json({ error: result.error.message });
  }
  const { iv, encryptedText,id } = result.value;
  const fullToken = `${id}|${iv}|${encryptedText}`;
  const tokenRepo = AppDataSource.getRepository(Token);
  const newToken = tokenRepo.create({
    token,
    iv,
    ciphertext: encryptedText,
  });
  await tokenRepo.save(newToken);

  

  // Response aligns with Dubai fintech standards
  res.status(200).json({
    status: "success",
    token,
    compliance: "PCI DSS 3.4 / UAE SRR 4.2",
  });
});
