import type { RequestHandler } from "express";
import { randomUUID } from "node:crypto";

declare module "express-serve-static-core" {
  interface Request {
    requestId: string;
  }
}

export const requestId: RequestHandler = (request, response, next) => {
  request.requestId = request.header("x-request-id") ?? randomUUID();
  response.setHeader("x-request-id", request.requestId);
  next();
};
