"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const child_process_1 = require("child_process");
node_cron_1.default.schedule("0 3 * * 0", () => {
    console.log("[Patch Job] Running weekly patch script...");
    (0, child_process_1.exec)("bash patch.sh", (error, stdout, stderr) => {
        if (error) {
            console.error(`[Patch Job] Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`[Patch Job] stderr: ${stderr}`);
        }
        console.log(`[Patch Job] Output:\n${stdout}`);
    });
}, {
    timezone: "Etc/UTC",
});
