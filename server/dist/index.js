import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./logger/logger.js";
const server = app.listen(env.PORT, () => {
    logger.info("InterviewPilot AI API listening on http://localhost:" + env.PORT, {
        environment: env.NODE_ENV,
        apiVersions: ["/api", "/api/v1"]
    });
});
const shutdown = (signal) => {
    logger.info("Received " + signal + "; closing HTTP server.");
    server.close(() => {
        logger.info("HTTP server closed.");
        process.exit(0);
    });
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
