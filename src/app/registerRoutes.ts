import { Express } from "express";

import { authenticate, authorize } from "../common/middleware/auth.js";
import { authRouter } from "../modules/auth/auth.routes.js";
import { contractsRouter } from "../modules/contracts/contracts.routes.js";
import { costsRouter, profitabilityRouter } from "../modules/finance/finance.routes.js";
import { inventoryRouter } from "../modules/inventory/inventory.routes.js";
import { masterRouter } from "../modules/master/master.routes.js";
import { procurementRouter } from "../modules/procurement/procurement.routes.js";
import { shipmentsRouter } from "../modules/shipments/shipments.routes.js";
import { traceabilityRouter } from "../modules/traceability/traceability.routes.js";

export function registerRoutes(app: Express): void {
  app.use("/api/v1/auth", authRouter);

  app.use(
    "/api/v1/master",
    authenticate,
    authorize("admin", "compliance"),
    masterRouter,
  );
  app.use(
    "/api/v1/procurement",
    authenticate,
    authorize("admin", "trader"),
    procurementRouter,
  );
  app.use(
    "/api/v1/inventory",
    authenticate,
    authorize("admin", "warehouse", "trader"),
    inventoryRouter,
  );
  app.use(
    "/api/v1/contracts",
    authenticate,
    authorize("admin", "trader"),
    contractsRouter,
  );
  app.use(
    "/api/v1/shipments",
    authenticate,
    authorize("admin", "trader", "warehouse", "compliance"),
    shipmentsRouter,
  );
  app.use(
    "/api/v1/costs",
    authenticate,
    authorize("admin", "finance"),
    costsRouter,
  );
  app.use(
    "/api/v1/profitability",
    authenticate,
    authorize("admin", "finance", "trader"),
    profitabilityRouter,
  );
  app.use(
    "/api/v1/traceability",
    authenticate,
    authorize("admin", "compliance", "trader"),
    traceabilityRouter,
  );
}
