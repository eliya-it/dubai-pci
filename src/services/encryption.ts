import crypto from "crypto";
// Testing, for now
import dotenv from "dotenv";

import { safeCall, Result } from "../helpers/safeCall";
dotenv.config({ path: ".env" });

interface EncryptedData {
  encryptedText: string;
  iv: string;
}

interface EncryptorInterface {
  encrypt: (text: string) => Result<{ encryptedText: string; iv: string }>;
  decrypt: (encryptedData: EncryptedData) => Result<string>;
}

class Encryptor implements EncryptorInterface {
  private readonly algorithm: string;
  private readonly key: Buffer;

  constructor() {
    this.algorithm = "aes-256-cbc";
    if (!process.env.UAE_ENCRYPTION_KEY) {
      throw new Error("UAE_ENCRYPTION_KEY environment variable is not set");
    }
    this.key = Buffer.from(process.env.UAE_ENCRYPTION_KEY, "hex");
  }

  encrypt(text: string) {
    return safeCall(() => {
      // UAE Central Bank SRR 4.2 Compliant Encryption
      // - AES-256-CBC (Approved algorithm)
      // - Dynamic IV per NESA IA-5(1)
      const iv = crypto.randomBytes(16); // Generate new IV for each encryption
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      let encrypted = cipher.update(text, "utf-8", "hex");
      encrypted += cipher.final("hex");

      return {
        encryptedText: encrypted,
        iv: iv.toString("hex"),
      };
    });
  }

  decrypt(encryptedData: EncryptedData) {
    return safeCall(() => {
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.key,
        Buffer.from(encryptedData.iv, "hex")
      );
      let decrypted = decipher.update(
        encryptedData.encryptedText,
        "hex",
        "utf-8"
      );
      decrypted += decipher.final("utf-8");
      return decrypted;
    });
  }
}

export { Encryptor };
