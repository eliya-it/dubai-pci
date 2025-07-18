# UAE Production Deployment – PCI-DSS & SRR Compliance

> This document details the live infrastructure and controls implemented to comply with UAE Central Bank SRR 4.2 and PCI-DSS 3.4, focusing on encryption, auditing, secure transmission, and access control.

---

## 1. Regulatory Alignment

The deployment is designed to meet:
- PCI-DSS: Payment Card Industry Data Security Standard
- SRR 4.2: Security Requirements Regulation, UAE Central Bank
- NESA: National Electronic Security Authority
/

---

## 2. Deployment Architecture

| Component           | Detail                                       |
|--------------------|----------------------------------------------|
| Hosting            | AWS (Region: me-central-1)                   |
| Web Server         | NGINX with TLS (HSTS enforced)               |
| App Layer          | Docker (Node.js) on ECS                      |
| Database           | Amazon RDS (PostgreSQL, encrypted)           |
| Object Storage     | S3 with versioning + access logs             |
| TLS Certificates   | AWS ACM (auto-renewal)                       |
| KMS                | AWS KMS with HSM-backed CMKs                 |

---

## 3. Key Management & Encryption

- AES-256-CBC for sensitive values
- Keys stored in AWS KMS, rotated yearly
- IVs are generated dynamically
- CloudTrail logs all key usage
- The `UAE_ENCRYPTION_KEY` used for tokenization is injected via environment variable at deploy time.
- Stored in AWS Secrets Manager, rotated annually.
---

## 4. Security & Compliance Monitoring

| Area                | Tool/Method             | Frequency         |
|---------------------|-------------------------|-------------------|
| Static Scan         | Snyk                    | Weekly (CI)       |
| DAST                | OWASP ZAP               | Bi-weekly         |
| Patch Management    | Cron script             | Sunday 03:00 UTC  |
| ASV Scans (NESA)    | Approved vendor         | Quarterly         |
| Header Hardening    | Helmet + CSP            | On deploy         |

---

## 5. Deployment Flow

1. Merge to `main` triggers CI/CD
2. Code built, tested, and scanned (Snyk + ZAP)
3. Image deployed using blue/green strategy
4. Post-deploy checks:
   - Tokenization
   - MFA
   - HTTPS headers

Rollback is available anytime via ECS version history.

---

## 6. Backup & Recovery

| Resource       | Method                              |
|----------------|-------------------------------------|
| Database       | Daily RDS snapshots                 |
| App            | Docker image versioning             |
| Files          | S3 with versioning                  |
| Secrets        | AWS Secrets Manager with rotation   |

---

## 7. Monitoring & Logging

- Logs: JSON format, includes timestamps and trace IDs
- Audit logs include user/session hashes
- Logs sent to CloudWatch + S3
- Alerts for failed MFA, auth issues, errors

---

## 8. Audit Documentation

Available upon request:

- VAPT reports (ZAP, Snyk)
- Key rotation logs (CloudTrail)
- Patch logs (script output)
- NESA ASV scan certification
- Audit log samples (masked, encrypted)

