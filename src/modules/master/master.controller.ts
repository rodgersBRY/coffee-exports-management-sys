import { Request, Response } from "express";

import { masterService } from "./master.service.js";
import {
  bagTypeSchema,
  buyerSchema,
  gradeSchema,
  supplierSchema,
  warehouseSchema,
} from "./master.validation.js";

export class MasterController {
  async createSupplier(req: Request, res: Response): Promise<void> {
    const payload = supplierSchema.parse(req.body);
    const created = await masterService.createSupplier(payload);
    res.status(201).json(created);
  }

  async listSuppliers(_req: Request, res: Response): Promise<void> {
    const rows = await masterService.listSuppliers();
    res.json(rows);
  }

  async createBuyer(req: Request, res: Response): Promise<void> {
    const payload = buyerSchema.parse(req.body);
    const created = await masterService.createBuyer(payload);
    res.status(201).json(created);
  }

  async listBuyers(_req: Request, res: Response): Promise<void> {
    const rows = await masterService.listBuyers();
    res.json(rows);
  }

  async createWarehouse(req: Request, res: Response): Promise<void> {
    const payload = warehouseSchema.parse(req.body);
    const created = await masterService.createWarehouse(payload);
    res.status(201).json(created);
  }

  async listWarehouses(_req: Request, res: Response): Promise<void> {
    const rows = await masterService.listWarehouses();
    res.json(rows);
  }

  async createGrade(req: Request, res: Response): Promise<void> {
    const payload = gradeSchema.parse(req.body);
    const created = await masterService.createGrade(payload);
    res.status(201).json(created);
  }

  async listGrades(_req: Request, res: Response): Promise<void> {
    const rows = await masterService.listGrades();
    res.json(rows);
  }

  async createBagType(req: Request, res: Response): Promise<void> {
    const payload = bagTypeSchema.parse(req.body);
    const created = await masterService.createBagType(payload);
    res.status(201).json(created);
  }

  async listBagTypes(_req: Request, res: Response): Promise<void> {
    const rows = await masterService.listBagTypes();
    res.json(rows);
  }
}

export const masterController = new MasterController();
