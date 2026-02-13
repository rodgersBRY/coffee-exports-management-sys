import { Request, Response } from "express";

import { procurementService } from "./procurement.service.js";
import {
  auctionLotSchema,
  directAgreementSchema,
  directDeliverySchema,
} from "./procurement.validation.js";

export class ProcurementController {
  async createAuctionLot(req: Request, res: Response): Promise<void> {
    const payload = auctionLotSchema.parse(req.body);
    const lot = await procurementService.createAuctionLot(payload);
    res.status(201).json(lot);
  }

  async createDirectAgreement(req: Request, res: Response): Promise<void> {
    const payload = directAgreementSchema.parse(req.body);
    const agreement = await procurementService.createDirectAgreement(payload);
    res.status(201).json(agreement);
  }

  async listDirectAgreements(_req: Request, res: Response): Promise<void> {
    const agreements = await procurementService.listDirectAgreements();
    res.json(agreements);
  }

  async createDirectDelivery(req: Request, res: Response): Promise<void> {
    const payload = directDeliverySchema.parse(req.body);
    const lot = await procurementService.createDirectDelivery(payload);
    res.status(201).json(lot);
  }
}

export const procurementController = new ProcurementController();
