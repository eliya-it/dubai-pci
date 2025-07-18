// src/utils/checkEnv.ts

const REQUIRED_ENV_VARS = [
    "UAE_ENCRYPTION_KEY",
    "NETWORK_IP",
    "MASTER_KEY",
    "JWT_SECRET",
    "MFA_ENCRYPTION_KEY",
    "CLAMAV_PORT",
    "CLAMAV_HOST",
    "DB_HOST",
  ];
  
  export function checkRequiredEnvVars(): void {
    const missing: string[] = [];
  
    for (const key of REQUIRED_ENV_VARS) {
      if (!process.env[key] || process.env[key]?.trim() === "") {
        missing.push(key);
      }
    }
  
    if (missing.length > 0) {
      console.error(
        `[ENV Validation] Missing required environment variables:\n- ${missing.join("\n- ")}`
      );
      process.exit(1); // Exit the app
    }
  
    console.log("[ENV Validation] All required environment variables are set.");
  }
  