import { ZodError } from "zod";
import { AppError } from "../errors/AppError.js";
import { env } from "../config/env.js";
import { logger } from "../logger/logger.js";
export const errorHandler = (error, request, response, _next) => {
    if (error instanceof ZodError) {
        response.status(400).json({
            reply: "Request validation failed.",
            done: false,
            error: {
                code: "VALIDATION_ERROR",
                requestId: request.requestId,
                issues: error.issues.map((issue) => ({
                    path: issue.path.join("."),
                    message: issue.message
                }))
            }
        });
        return;
    }
    const appError = error instanceof AppError
        ? error
        : new AppError("Unexpected server error", 500, "INTERNAL_SERVER_ERROR", env.NODE_ENV === "development" ? String(error) : undefined);
    if (appError.statusCode >= 500) {
        logger.error(appError.message, { requestId: request.requestId, code: appError.code, details: appError.details });
    }
    else {
        logger.warn(appError.message, { requestId: request.requestId, code: appError.code });
    }
    response.status(appError.statusCode).json({
        reply: appError.message,
        done: false,
        error: {
            code: appError.code,
            requestId: request.requestId,
            details: appError.details
        }
    });
};
