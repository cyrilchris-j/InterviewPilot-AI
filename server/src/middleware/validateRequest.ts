import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";

export function validateBody<T>(schema: ZodSchema<T>): RequestHandler {
  return (request, _response, next) => {
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }
    request.body = parsed.data;
    next();
  };
}
