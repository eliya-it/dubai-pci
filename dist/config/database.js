"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../entities/User");
const Token_1 = require("../entities/Token");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: ".env" });
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: "postgres",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "amsq9367",
    database: process.env.DB_NAME || "dubai_pci",
    synchronize: process.env.NODE_ENV !== "production", // Don't use in production
    logging: false, // logging
    entities: [User_1.User, Token_1.Token],
    migrations: [],
    subscribers: [],
});
// Log database configuration (excluding sensitive data)
const dbConfig = exports.AppDataSource.options;
