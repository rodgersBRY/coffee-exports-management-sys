import express, { Express } from "express";

import { errorHandler } from "../common/middleware/errorHandler.js";
import { registerRoutes } from "./registerRoutes.js";

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "ceoms-api" });
  });

  registerRoutes(app);
  app.use(errorHandler);

  return app;
}
