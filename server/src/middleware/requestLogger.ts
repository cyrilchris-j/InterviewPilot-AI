import type { RequestHandler } from "express";
import { logger } from "../logger/logger.js";

export const requestLogger: RequestHandler = (request, response, next) => {
  const startedAt = process.hrtime.bigint();

  response.on("finish", () => {
    const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    logger.info("request completed", {
      requestId: request.requestId,
      method: request.method,
      path: request.originalUrl,
      statusCode: response.statusCode,
      elapsedMs: Number(elapsedMs.toFixed(1))
    });
  });

  next();
};
