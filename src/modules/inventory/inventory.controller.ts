import { Request, Response } from "express";

import { inventoryService } from "./inventory.service.js";
import { stockAdjustmentSchema } from "./inventory.validation.js";

export class InventoryController {
  async listLots(_req: Request, res: Response): Promise<void> {
    const lots = await inventoryService.listLots();
    res.json(lots);
  }

  async adjustStock(req: Request, res: Response): Promise<void> {
    const payload = stockAdjustmentSchema.parse(req.body);
    const adjustment = await inventoryService.adjustStock(payload);
    res.status(201).json(adjustment);
  }

  async getDashboard(_req: Request, res: Response): Promise<void> {
    const dashboard = await inventoryService.getDashboard();
    res.json(dashboard);
  }
}

export const inventoryController = new InventoryController();
