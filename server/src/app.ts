import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { apiRouter } from "./routes/api.routes.js";
import compression from "compression";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { requestId } from "./middleware/requestId.js";
import { requestLogger } from "./middleware/requestLogger.js";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(compression());
app.use(cors({ origin: env.CLIENT_ORIGIN }));
app.use(limiter);
app.use(express.json({ limit: env.REQUEST_BODY_LIMIT }));
app.use(requestId);
app.use(requestLogger);

app.use("/api", apiRouter);
app.use("/api/v1", apiRouter);

app.use(notFound);
app.use(errorHandler);
