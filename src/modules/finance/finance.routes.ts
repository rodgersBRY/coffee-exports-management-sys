import { Router } from "express";

import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { financeController } from "./finance.controller.js";

export const costsRouter = Router();
export const profitabilityRouter = Router();

costsRouter.post(
  "/entries",
  asyncHandler(financeController.createCostEntry.bind(financeController)),
);

profitabilityRouter.get(
  "/contracts/:contractId",
  asyncHandler(financeController.getContractProfitability.bind(financeController)),
);
