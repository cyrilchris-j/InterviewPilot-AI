import test from "node:test";
import assert from "node:assert";
import { ZodError, ZodIssue } from "zod";
import { errorHandler } from "./errorHandler.js";
import { AppError } from "../errors/AppError.js";
import { env } from "../config/env.js";

test("errorHandler - ZodError", () => {
  const issues: ZodIssue[] = [
    { code: "invalid_type", expected: "string", received: "number", path: ["name"], message: "Expected string, received number" }
  ];
  const error = new ZodError(issues);
  
  let statusCode = 0;
  let jsonBody: any = null;
  
  const req: any = { requestId: "req-123" };
  const res: any = {
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (body: any) => {
      jsonBody = body;
    }
  };
  const next = () => {};

  errorHandler(error, req, res, next);
  
  assert.strictEqual(statusCode, 400);
  assert.strictEqual(jsonBody.reply, "Request validation failed.");
  assert.strictEqual(jsonBody.error.code, "VALIDATION_ERROR");
  assert.strictEqual(jsonBody.error.issues[0].path, "name");
});

test("errorHandler - AppError", () => {
  const error = new AppError("Not found", 404, "NOT_FOUND");
  
  let statusCode = 0;
  let jsonBody: any = null;
  
  const req: any = { requestId: "req-123" };
  const res: any = {
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (body: any) => {
      jsonBody = body;
    }
  };
  const next = () => {};

  errorHandler(error, req, res, next);
  
  assert.strictEqual(statusCode, 404);
  assert.strictEqual(jsonBody.reply, "Not found");
  assert.strictEqual(jsonBody.error.code, "NOT_FOUND");
});
