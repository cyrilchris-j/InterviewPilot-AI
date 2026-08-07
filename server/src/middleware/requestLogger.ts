import type { RequestHandler } from "express";

export const requestLogger: RequestHandler = (request, _response, next) => {
  const started = Date.now();
  request.on("close", () => {
    const elapsed = Date.now() - started;
    console.log(`${request.method} ${request.path} ${elapsed}ms`);
  });
  next();
};
