import { env } from "../config/env.js";

type LogLevel = "debug" | "info" | "warn" | "error";

const weights: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

function shouldLog(level: LogLevel): boolean {
  return weights[level] >= weights[env.LOG_LEVEL];
}

function serialize(details?: Record<string, unknown>): string {
  return details ? " " + JSON.stringify(details) : "";
}

export const logger = {
  debug(message: string, details?: Record<string, unknown>) {
    if (shouldLog("debug")) console.debug("[debug] " + message + serialize(details));
  },
  info(message: string, details?: Record<string, unknown>) {
    if (shouldLog("info")) console.info("[info] " + message + serialize(details));
  },
  warn(message: string, details?: Record<string, unknown>) {
    if (shouldLog("warn")) console.warn("[warn] " + message + serialize(details));
  },
  error(message: string, details?: Record<string, unknown>) {
    if (shouldLog("error")) console.error("[error] " + message + serialize(details));
  }
};
