import { Router } from "express";
import { interviewController } from "../controllers/interviewController.js";

export const interviewRouter = Router();

interviewRouter.post("/interview", interviewController);
