import { Router } from "express";
import { env } from "../config/env.js";
export const healthRouter = Router();
healthRouter.get("/health", (_request, response) => {
    response.json({
        status: "ok",
        service: "interviewpilot-api",
        version: "v1",
        environment: env.NODE_ENV
    });
});
