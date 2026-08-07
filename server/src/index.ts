import { app } from "./app.js";
import { config } from "./config.js";

app.listen(config.port, () => {
  console.log(`InterviewPilot AI server listening on http://localhost:${config.port}`);
});
