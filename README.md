# Secure Payment Gateway Backend

This repository houses the backend system for a secure payment gateway, engineered to meet stringent regulatory standards including **PCI-DSS v3.4** and **UAE Central Bank SRR 4.2**. The application leverages Node.js and TypeScript, is containerized with Docker, and deployed on AWS.

---

## Overview

- **Robust Encryption:** AES-256-CBC is used with dynamic IVs to secure sensitive data.
- **Tokenization:** No raw Primary Account Numbers (PANs) are stored. Instead, tokens are generated with strong encryption.
- **Multi-Factor Authentication:** TOTP-based MFA and short-lived JWT tokens help secure access.
- **Secure Transmission:** TLS v1.2+ is enforced via NGINX and HTTPS-only policies.
- **Comprehensive Logging & Monitoring:** Audit logs, along with centralized logging via CloudWatch, ensure that all critical actions are traceable.

---

## Compliance and Security Documentation

For detailed compliance measures, please review the following documents (available in the `/src/compliance` directory):

- **[PCI Controls (PCI_CONTROLS.md)](compliance/PCI_CONTROLS.md)**  
  Outlines encryption, tokenization, secure authentication, and logging practices for PCI-DSS compliance.

- **[Security Overview (security.md)](compliance/security.md)**  
  Describes the secure configuration, including HTTPS, secure headers, and vulnerability scanning methods.

- **[UAE Production Deployment (UAE_deployment.md)](compliance/UAE_deployment.md)**  
  Details the AWS deployment architecture, key management, patch procedures, backup strategies, and monitoring/logging setups in line with UAE Central Bank SRR 4.2 requirements.

---

## Deployment

The project is deployed in AWS (region: `me-central-1`) with the following key components:

- **NGINX:** Acts as a reverse proxy, enforcing TLS and HTTP Strict Transport Security (HSTS).
- **Dockerized Node.js Application:** Hosted on Amazon ECS.
- **Database:** PostgreSQL on Amazon RDS, with encryption enabled.
- **Storage:** S3 with default encryption and access logging.

The CI/CD pipeline integrates Snyk and OWASP ZAP scanning, blue/green deployment strategy, and automated rollback to ensure uptime and regulatory compliance.

---

## Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **Docker**
- **AWS CLI** configured with proper credentials
- **Git** for version control

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/eliya-it/dubai-pci.git
   cd dubai-pci
2. **Install dependencies:**

   ```bash
   npm install
3. **Configuration:**

   Copy the `.env.example` file to `.env` and update environment-specific variables:

   ```bash
   cp .env.example .env
   ```

---

## Environment Configuration

Before running the application, copy the example environment file and update it with secure values:

```bash
cp .env.example .env
```

Then, open `.env` and update the following keys:

| Key                  | Description                                                                            |
| -------------------- | -------------------------------------------------------------------------------------- |
| `UAE_ENCRYPTION_KEY` | Strong key used for data encryption at rest (32 bytes recommended, base64 or hex)      |
| `MASTER_KEY`         | Master key used for tokenization or key wrapping (store securely in KMS or vault)      |
| `JWT_SECRET`         | Secret used to sign and verify JWT tokens                                              |
| `MFA_ENCRYPTION_KEY` | Key used to encrypt MFA secrets (must be 256-bit hex or base64)                        |
| `CLAMAV_HOST`        | Host address of the ClamAV daemon (e.g., `localhost` or container name)                |
| `CLAMAV_PORT`        | Port for ClamAV (default is `3310`)                                                    |
| `NETWORK_IP`         | Comma-separated CIDR list for internal network allowlist (used in RBAC/logging/alerts) |
| `DB_HOST`            | Hostname for PostgreSQL instance (e.g., `localhost` or `postgres` container)           |


For production deployments:

* Store secrets in **AWS Secrets Manager**, **Azure Key Vault**, or equivalent.
* Ensure strong rotation policies and zero hardcoded secrets.



4. **Run Locally:**

   ```bash
   npm run dev
   ```



---

## Testing & Validation

All routes below require authentication and must be tested **after a successful login**. You will receive a `JWT token` from the login endpoint, which must be included in the `Authorization` header of subsequent requests.

> ⚠️ `Authorization: Bearer <your_jwt_token>`

### 1. Tokenization API Test

Validates that Primary Account Numbers (PAN) are accepted and securely tokenized.

```bash
curl -X POST http://localhost:3000/tokenize \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"pan": "4111111111111111"}'
```

### 2. Audit Log Verification

Checks for the presence of audit records after a protected action.

```bash
grep "UAE_AUDIT" logs/audit.log
```

> Ensure this is run on the server instance or logging volume where logs are stored.

### 3. ClamAV Scan Endpoint (Malware Simulation)

Validates file scanning and anti-malware logging logic using a test file.

```bash
curl -X POST http://localhost:3000/api/v1/scan \
  -H "Authorization: Bearer <your_jwt_token>" \
  -F 'file=@virus_test.pdf'
```

> ⚠️ Replace `virus_test.pdf` with the [EICAR test file](https://www.eicar.org/download/) to simulate a benign malware check.

---

## Backup & Rollback

The system supports:

* **Daily Automated Backups:** RDS snapshots for databases and versioned S3 storage for files.
* **Rollback Procedures:** Docker image versioning provides an instant fallback if needed.


