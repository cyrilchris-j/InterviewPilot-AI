import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { apiRouter } from "./routes/api.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { requestId } from "./middleware/requestId.js";
import { requestLogger } from "./middleware/requestLogger.js";

export const app = express();

app.disable("x-powered-by");
app.use(cors({ origin: env.CLIENT_ORIGIN }));
app.use(express.json({ limit: env.REQUEST_BODY_LIMIT }));
app.use(requestId);
app.use(requestLogger);

app.use("/api", apiRouter);
app.use("/api/v1", apiRouter);

app.use(notFound);
app.use(errorHandler);
