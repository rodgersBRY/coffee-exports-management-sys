import { Router } from "express";

import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { financeController } from "./finance.controller.js";

export const financeRouter = Router();

financeRouter.post(
  "/entries",
  asyncHandler(financeController.createCostEntry.bind(financeController)),
);
financeRouter.get(
  "/contracts/:contractId",
  asyncHandler(financeController.getContractProfitability.bind(financeController)),
);
