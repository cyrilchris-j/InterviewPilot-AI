import { Router } from "express";
import { postInterview } from "../controllers/interviewController.js";
import { validateBody } from "../middleware/validateRequest.js";
import { interviewRequestSchema } from "../validation/interview.schema.js";
export const interviewRouter = Router();
interviewRouter.post("/interview", validateBody(interviewRequestSchema), postInterview);
