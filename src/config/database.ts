import { DataSource } from "typeorm";
import { User } from "../entities/User";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "amsq9367",
  database: process.env.DB_NAME || "dubai_pci",
  synchronize: process.env.NODE_ENV !== "production", // Don't use in production
  logging: false, // logging
  entities: [User],
  migrations: [],
  subscribers: [],
});

// Log database configuration (excluding sensitive data)
const dbConfig = AppDataSource.options as any;
console.log("Database Configuration:", {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  synchronize: dbConfig.synchronize,
  logging: dbConfig.logging,
});
