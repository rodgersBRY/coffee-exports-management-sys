import { createLogger, format, transports } from "winston";

import { env } from "../config/env.js";

export const logger = createLogger({
  level: env.logLevel,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
  ),
  defaultMeta: {
    service: "ceoms-api",
    env: env.nodeEnv,
  },
  transports: [new transports.Console()],
});
