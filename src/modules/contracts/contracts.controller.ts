import { Request, Response } from "express";

import { ApiError } from "../../common/errors/ApiError.js";
import { contractsService } from "./contracts.service.js";
import { allocationSchema, contractSchema } from "./contracts.validation.js";

export class ContractsController {
  async createContract(req: Request, res: Response): Promise<void> {
    const payload = contractSchema.parse(req.body);
    const contract = await contractsService.createContract(payload);
    res.status(201).json(contract);
  }

  async allocateLot(req: Request, res: Response): Promise<void> {
    const contractId = Number(req.params.contractId);
    if (!Number.isFinite(contractId) || contractId <= 0) {
      throw new ApiError(400, "Invalid contractId");
    }
    const payload = allocationSchema.parse(req.body);
    const allocation = await contractsService.allocateLot(contractId, payload);
    res.status(201).json(allocation);
  }

  async getDashboard(_req: Request, res: Response): Promise<void> {
    const dashboard = await contractsService.getDashboard();
    res.json(dashboard);
  }
}

export const contractsController = new ContractsController();
