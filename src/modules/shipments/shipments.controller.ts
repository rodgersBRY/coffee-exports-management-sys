import { Request, Response } from "express";

import { ApiError } from "../../common/errors/ApiError.js";
import { shipmentsService } from "./shipments.service.js";
import {
  docsGenerateSchema,
  shipmentCreateSchema,
  shipmentStatusSchema,
} from "./shipments.validation.js";

export class ShipmentsController {
  async createShipment(req: Request, res: Response): Promise<void> {
    const payload = shipmentCreateSchema.parse(req.body);
    const shipment = await shipmentsService.createShipment(payload);
    res.status(201).json(shipment);
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    const shipmentId = Number(req.params.shipmentId);
    if (!Number.isFinite(shipmentId) || shipmentId <= 0) {
      throw new ApiError(400, "Invalid shipmentId");
    }
    const payload = shipmentStatusSchema.parse(req.body);
    const shipment = await shipmentsService.updateStatus(shipmentId, payload);
    res.json(shipment);
  }

  async generateDocuments(req: Request, res: Response): Promise<void> {
    const shipmentId = Number(req.params.shipmentId);
    if (!Number.isFinite(shipmentId) || shipmentId <= 0) {
      throw new ApiError(400, "Invalid shipmentId");
    }
    const payload = docsGenerateSchema.parse(req.body);
    const docs = await shipmentsService.generateDocuments(shipmentId, payload);
    res.status(201).json(docs);
  }

  async listDocuments(req: Request, res: Response): Promise<void> {
    const shipmentId = Number(req.params.shipmentId);
    if (!Number.isFinite(shipmentId) || shipmentId <= 0) {
      throw new ApiError(400, "Invalid shipmentId");
    }
    const docs = await shipmentsService.listDocuments(shipmentId);
    res.json(docs);
  }
}

export const shipmentsController = new ShipmentsController();
