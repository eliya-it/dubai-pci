"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeCall = safeCall;
function safeCall(fn) {
    try {
        const result = fn();
        if (result instanceof Promise) {
            return result
                .then((value) => ({ ok: true, value }))
                .catch((err) => ({
                ok: false,
                error: err instanceof Error ? err : new Error("Unknown error"),
            }));
        }
        else {
            return { ok: true, value: result };
        }
    }
    catch (err) {
        return {
            ok: false,
            error: err instanceof Error ? err : new Error("Unknown error"),
        };
    }
}
