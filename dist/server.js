"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
require("reflect-metadata");
// Initialize database connection
database_1.AppDataSource.initialize()
    .then(() => {
    console.log("[**] Database connection established");
})
    .catch((error) => {
    console.error("Error during database initialization:", error);
});
app_1.default.get("/health", function (req, res) {
    res.status(200).json({
        status: "success",
        message: "Server is healthy and running.",
    });
});
const port = process.env.PORT || 3000;
app_1.default.listen(port, () => {
    console.log(`[**] Server is listening on port ${port}`);
});
