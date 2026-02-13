import { createApp } from "./app/createApp.js";
import { logger } from "./common/logger.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.port, () => {
  logger.info(`CEOMS API running on http://localhost:${env.port}`);
});
