import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { interviewRouter } from "./routes/interview.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";

export const app = express();

app.use(cors({ origin: config.clientOrigin }));
app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);
app.use("/api", interviewRouter);
app.use(errorHandler);
