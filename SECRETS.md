# Secret Management

This document explains how sensitive environment variables are encrypted and managed, simulating a secure vault process.

---

## 🔐 Encryption Process

All sensitive configuration values (e.g., database URLs, API keys, secrets) are stored in a `.env` file, which is **encrypted** into `.env.enc` using AES-256-CBC with a password (`MASTER_KEY`).

The encrypted file `.env.enc` is checked into version control (optional). The plaintext `.env` is ignored and never committed.

You can use OpenSSL to encrypt:

```bash
openssl enc -aes-256-cbc -pbkdf2 -salt -in .env -out .env.enc -pass pass:$MASTER_KEY
```
