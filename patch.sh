#!/bin/bash
set -e

echo "> Starting patch job at: $(date)"

echo "> Updating npm dependencies..."
npm update

# Check if Snyk is installed
if ! command -v snyk &> /dev/null; then
  echo "> Snyk not found, skipping Snyk-related steps."
else
  echo "> Snyk found, checking authentication..."

  if ! snyk auth --status &> /dev/null; then
    echo "> Snyk is NOT authenticated. Skipping Snyk scan and monitor."
  else
    echo "> Running Snyk test..."
    snyk test || echo "Snyk test reported issues"

    echo "> Monitoring Snyk project..."
    snyk monitor || echo "Snyk monitor failed"
  fi
fi

echo "> Running npm audit fix..."
npm audit fix --force || echo "npm audit fix failed"

echo "> Patch completed at: $(date)"
