import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { interviewRouter } from "./interview.routes.js";
export const apiRouter = Router();
apiRouter.use(healthRouter);
apiRouter.use(interviewRouter);
