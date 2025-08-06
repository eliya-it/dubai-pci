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
Object.defineProperty(exports, "__esModule", { value: true });
exports.secureHeaders = exports.applySecureHeaders = void 0;
const errorHandler_1 = require("./errorHandler");
/**
 * Applies a comprehensive set of secure HTTP headers to the response.
 * This helps protect the app against XSS, clickjacking, MIME sniffing,
 * Spectre-type attacks, and enables strict resource and permission policies.
 */
const applySecureHeaders = (res) => {
    // Prevent MIME-type sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");
    // Prevent clickjacking by denying framing
    res.setHeader("X-Frame-Options", "DENY");
    // Basic legacy protection against reflected XSS attacks (modern browsers ignore this)
    res.setHeader("X-XSS-Protection", "1; mode=block");
    // Restrict sources of content to prevent XSS and data injection attacks
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self';");
    // Block access to sensitive browser features (e.g. geolocation, mic)
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=()");
    // Disable all caching — helps avoid issues with storing sensitive data
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache"); // For HTTP/1.0 compatibility
    res.setHeader("Expires", "0"); // Set expiration to the past
    res.setHeader("Surrogate-Control", "no-store"); // CDNs
    // Protect against Spectre-style attacks by isolating browsing contexts
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
};
exports.applySecureHeaders = applySecureHeaders;
/**
 * Middleware version of secure headers, suitable for global use in Express.
 */
exports.secureHeaders = (0, errorHandler_1.asyncHandler)((_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    (0, exports.applySecureHeaders)(res);
    next();
}));
