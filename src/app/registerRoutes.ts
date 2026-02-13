import { Express } from "express";

import { contractsRouter } from "../modules/contracts/contracts.routes.js";
import { financeRouter } from "../modules/finance/finance.routes.js";
import { inventoryRouter } from "../modules/inventory/inventory.routes.js";
import { masterRouter } from "../modules/master/master.routes.js";
import { procurementRouter } from "../modules/procurement/procurement.routes.js";
import { shipmentsRouter } from "../modules/shipments/shipments.routes.js";
import { traceabilityRouter } from "../modules/traceability/traceability.routes.js";

export function registerRoutes(app: Express): void {
  app.use("/master", masterRouter);
  app.use("/procurement", procurementRouter);
  app.use("/inventory", inventoryRouter);
  app.use("/contracts", contractsRouter);
  app.use("/shipments", shipmentsRouter);
  app.use("/costs", financeRouter);
  app.use("/profitability", financeRouter);
  app.use("/traceability", traceabilityRouter);
}
