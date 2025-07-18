# Security Overview

This backend system is designed with modern security best practices to meet regulatory requirements such as PCI-DSS and UAE SRR 4.2. Below is a summary of key security implementations.

---

## HTTPS & TLS

* **TLS v1.2 and v1.3 enforced** via NGINX reverse proxy

  * Configured in [`nginx.conf`](/src/config/nginx.conf)
* **HSTS (HTTP Strict Transport Security)** enabled

  * Includes `preload` directive and `includeSubDomains`

---

## Secure HTTP Headers

Implemented using the `helmet` middleware in Express, along with additional custom headers for enhanced protection:

| Header                      | Purpose                                        |
| --------------------------- | ---------------------------------------------- |
| `Content-Security-Policy`   | Prevents content injection & data exfiltration |
| `X-Frame-Options`           | Prevents clickjacking                          |
| `Referrer-Policy`           | Controls referrer data sent with requests      |
| `Strict-Transport-Security` | Enforces HTTPS connections                     |
| `X-XSS-Protection`          | Blocks reflected XSS attacks (legacy support)  |
| `X-Content-Type-Options`    | Prevents MIME-type sniffing                    |

> See [`secure-headers.ts`](/src/helpers/secure-headers.ts) for full implementation.

---

## Compliance Alignment

This setup contributes to multiple PCI-DSS controls:

* **PCI-DSS 4.0 – Requirement 4**

  * Secure transmission over public networks
* **PCI-DSS 4.0 – Requirement 6**

  * Secure coding practices: input validation, header protection
* **PCI-DSS 4.0 – Requirement 8**

  * Session management and secure authentication (covered in `pci_controls.md`)

