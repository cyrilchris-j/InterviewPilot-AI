import { env } from "../config/env.js";
const weights = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40
};
function shouldLog(level) {
    return weights[level] >= weights[env.LOG_LEVEL];
}
function serialize(details) {
    return details ? " " + JSON.stringify(details) : "";
}
export const logger = {
    debug(message, details) {
        if (shouldLog("debug"))
            console.debug("[debug] " + message + serialize(details));
    },
    info(message, details) {
        if (shouldLog("info"))
            console.info("[info] " + message + serialize(details));
    },
    warn(message, details) {
        if (shouldLog("warn"))
            console.warn("[warn] " + message + serialize(details));
    },
    error(message, details) {
        if (shouldLog("error"))
            console.error("[error] " + message + serialize(details));
    }
};
