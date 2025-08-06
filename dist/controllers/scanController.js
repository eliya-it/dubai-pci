"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scan = void 0;
const errorHandler_1 = require("../helpers/errorHandler");
const clamav_js_1 = __importDefault(require("clamav.js"));
const fs_1 = __importDefault(require("fs"));
const scan = (0, errorHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    const clamavHost = process.env.CLAMAV_HOST;
    const clamavPort = Number(process.env.CLAMAV_PORT);
    const path = req.file.path;
    const stream = fs_1.default.createReadStream(path);
    clamav_js_1.default.ping(clamavPort, clamavHost, 1000, (err) => {
        if (err) {
            return res.status(500).json({ message: "ClamAV is not running." });
        }
        clamav_js_1.default
            .createScanner(clamavPort, clamavHost)
            .scan(stream, (err, object, malicious) => {
            fs_1.default.unlinkSync(path); // cleanup
            if (err) {
                return res.status(500).json({ message: "Scan failed", error: err });
            }
            if (malicious) {
                return res
                    .status(400)
                    .json({ message: "Threat detected", file: object });
            }
            res.status(200).json({ message: "No threats detected", file: object });
        });
    });
}));
exports.scan = scan;
