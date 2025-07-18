#!/bin/bash

set -e

echo "[*] Starting OWASP ZAP scan..."


docker run -v $(pwd):/zap/wrk/:rw ghcr.io/zaproxy/zaproxy zap-api-scan.py \
  -t http://host.docker.internal:3000/api-docs \
  -f openapi \
  -r zap-report.html \
  -x zap-report.xml \
  -J zap-report.json \
  -w zap-report.md \
  -d -a

echo "[*] ZAP scan completed. Report saved to zap-report.html"
