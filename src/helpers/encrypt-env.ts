import * as fs from "fs";
import * as crypto from "crypto";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
const ENV_FILE = ".env";
const ENC_FILE = ".env.enc";
const key = process.env.MASTER_KEY;
if (!key) throw new Error("MASTER_KEY must be set to encrypt");
const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv(
  "aes-256-cbc",
  crypto.scryptSync(key, "salt", 32),
  iv
);

const input = fs.readFileSync(ENV_FILE);
const encrypted = Buffer.concat([iv, cipher.update(input), cipher.final()]);
fs.writeFileSync(ENC_FILE, encrypted);
console.log("Encrypted .env → .env.enc");
