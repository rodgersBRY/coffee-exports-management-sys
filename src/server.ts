import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import { PoolClient } from "pg";
import { ZodError, z } from "zod";

import { query, withTransaction } from "./db/pool.js";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT ?? 4000);
const EPSILON = 1e-6;

const shipmentProgression = ["planned", "stuffed", "cleared", "on_vessel", "completed"];

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const asyncHandler =
  (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
  ): ((req: Request, res: Response, next: NextFunction) => void) =>
  (req, res, next) => {
    void fn(req, res, next).catch(next);
  };

const supplierSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["auction_agent", "mill", "farmer", "other"]).default("other"),
  country: z.string().optional(),
});

const buyerSchema = z.object({
  name: z.string().min(1),
  country: z.string().optional(),
});

const warehouseSchema = z.object({
  name: z.string().min(1),
  location: z.string().optional(),
});

const gradeSchema = z.object({
  code: z.string().min(1),
  description: z.string().optional(),
});

const bagTypeSchema = z.object({
  name: z.string().min(1),
  weight_kg: z.number().positive(),
});

const auctionLotSchema = z.object({
  lot_number: z.string().min(1),
  marketing_agent_id: z.number().int().positive(),
  grade_id: z.number().int().positive(),
  warehouse_id: z.number().int().positive(),
  bag_type_id: z.number().int().positive(),
  crop_year: z.string().min(1),
  bags: z.number().int().positive(),
  weight_total_kg: z.number().positive(),
  purchase_price_per_kg: z.number().positive(),
  auction_fees_total: z.number().nonnegative().default(0),
  catalog_document_path: z.string().optional(),
});

const directAgreementSchema = z.object({
  supplier_id: z.number().int().positive(),
  agreement_reference: z.string().min(1),
  agreed_price_per_kg: z.number().positive(),
  currency: z.string().default("USD"),
  crop_year: z.string().min(1),
});

const directDeliverySchema = z.object({
  agreement_id: z.number().int().positive(),
  internal_lot_id: z.string().min(1),
  delivery_reference: z.string().min(1),
  grade_id: z.number().int().positive(),
  warehouse_id: z.number().int().positive(),
  bag_type_id: z.number().int().positive(),
  bags: z.number().int().positive(),
  weight_total_kg: z.number().positive(),
  moisture_percent: z.number().nonnegative(),
  screen_size: z.number().nonnegative(),
  defects_percent: z.number().nonnegative(),
  processing_cost_total: z.number().nonnegative().default(0),
  transport_cost_total: z.number().nonnegative().default(0),
});

const stockAdjustmentSchema = z.object({
  lot_id: z.number().int().positive(),
  adjustment_kg: z.number(),
  reason: z.string().min(1),
  approved_by: z.string().min(1),
});

const contractSchema = z
  .object({
    contract_number: z.string().min(1),
    buyer_id: z.number().int().positive(),
    grade_id: z.number().int().positive().optional(),
    quantity_kg: z.number().positive(),
    price_per_kg: z.number().positive(),
    price_terms: z.enum(["fob", "cif"]),
    currency: z.string().default("USD"),
    shipment_window_start: z.string().date(),
    shipment_window_end: z.string().date(),
  })
  .refine(
    (val) =>
      new Date(`${val.shipment_window_start}T00:00:00.000Z`) <=
      new Date(`${val.shipment_window_end}T00:00:00.000Z`),
    { message: "shipment_window_start must be <= shipment_window_end" },
  );

const allocationSchema = z.object({
  lot_id: z.number().int().positive(),
  allocated_kg: z.number().positive(),
});

const shipmentCreateSchema = z.object({
  shipment_number: z.string().min(1),
  contract_id: z.number().int().positive(),
  container_number: z.string().optional(),
  seal_number: z.string().optional(),
  planned_departure: z.string().date().optional(),
  allocation_ids: z.array(z.number().int().positive()).min(1),
});

const shipmentStatusSchema = z.object({
  status: z.enum(["planned", "stuffed", "cleared", "on_vessel", "completed"]),
  actual_departure: z.string().date().optional(),
});

const docsGenerateSchema = z.object({
  doc_types: z
    .array(
      z.enum([
        "commercial_invoice",
        "packing_list",
        "traceability_report",
        "cost_breakdown_summary",
      ]),
    )
    .min(1),
});

const costEntrySchema = z.object({
  lot_id: z.number().int().positive().optional(),
  shipment_id: z.number().int().positive().optional(),
  category: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default("USD"),
  notes: z.string().optional(),
});

function toNumber(value: unknown): number {
  return Number(value);
}

function nextContractStatus(shippedKg: number, quantityKg: number, currentStatus: string): string {
  if (currentStatus === "closed") {
    return currentStatus;
  }
  if (shippedKg >= quantityKg - EPSILON) {
    return "fulfilled";
  }
  if (shippedKg > EPSILON) {
    return "partially_fulfilled";
  }
  return "open";
}

async function ensureReference(
  client: PoolClient,
  table: string,
  id: number,
  label: string,
): Promise<void> {
  const result = await client.query(`SELECT id FROM ${table} WHERE id = $1`, [id]);
  if (result.rowCount === 0) {
    throw new ApiError(404, `${label} ${id} not found`);
  }
}

async function refreshLotStatus(client: PoolClient, lotId: number): Promise<void> {
  const lotResult = await client.query(
    "SELECT weight_available_kg FROM lots WHERE id = $1 FOR UPDATE",
    [lotId],
  );
  if (lotResult.rowCount === 0) {
    throw new ApiError(404, `Lot ${lotId} not found`);
  }
  const weightAvailable = toNumber(lotResult.rows[0].weight_available_kg);
  const allocResult = await client.query(
    "SELECT COUNT(*)::int AS count FROM allocations WHERE lot_id = $1 AND status = 'allocated'",
    [lotId],
  );
  const openAllocationCount = Number(allocResult.rows[0].count);

  let status = "in_stock";
  if (weightAvailable <= EPSILON) {
    status = openAllocationCount > 0 ? "allocated" : "shipped";
  } else if (openAllocationCount > 0) {
    status = "allocated";
  }

  await client.query("UPDATE lots SET status = $1 WHERE id = $2", [status, lotId]);
}

app.get(
  "/health",
  asyncHandler(async (_req, res) => {
    res.json({ ok: true, service: "ceoms-api" });
  }),
);

app.post(
  "/master/suppliers",
  asyncHandler(async (req, res) => {
    const body = supplierSchema.parse(req.body);
    const result = await query(
      `
      INSERT INTO suppliers (name, supplier_type, country)
      VALUES ($1, $2, $3)
      RETURNING *;
      `,
      [body.name, body.type, body.country ?? null],
    );
    res.status(201).json(result.rows[0]);
  }),
);

app.get(
  "/master/suppliers",
  asyncHandler(async (_req, res) => {
    const result = await query("SELECT * FROM suppliers ORDER BY id DESC");
    res.json(result.rows);
  }),
);

app.post(
  "/master/buyers",
  asyncHandler(async (req, res) => {
    const body = buyerSchema.parse(req.body);
    const result = await query(
      `
      INSERT INTO buyers (name, country)
      VALUES ($1, $2)
      RETURNING *;
      `,
      [body.name, body.country ?? null],
    );
    res.status(201).json(result.rows[0]);
  }),
);

app.get(
  "/master/buyers",
  asyncHandler(async (_req, res) => {
    const result = await query("SELECT * FROM buyers ORDER BY id DESC");
    res.json(result.rows);
  }),
);

app.post(
  "/master/warehouses",
  asyncHandler(async (req, res) => {
    const body = warehouseSchema.parse(req.body);
    const result = await query(
      `
      INSERT INTO warehouses (name, location)
      VALUES ($1, $2)
      RETURNING *;
      `,
      [body.name, body.location ?? null],
    );
    res.status(201).json(result.rows[0]);
  }),
);

app.get(
  "/master/warehouses",
  asyncHandler(async (_req, res) => {
    const result = await query("SELECT * FROM warehouses ORDER BY id DESC");
    res.json(result.rows);
  }),
);

app.post(
  "/master/grades",
  asyncHandler(async (req, res) => {
    const body = gradeSchema.parse(req.body);
    const result = await query(
      `
      INSERT INTO grades (code, description)
      VALUES ($1, $2)
      RETURNING *;
      `,
      [body.code, body.description ?? null],
    );
    res.status(201).json(result.rows[0]);
  }),
);

app.get(
  "/master/grades",
  asyncHandler(async (_req, res) => {
    const result = await query("SELECT * FROM grades ORDER BY id DESC");
    res.json(result.rows);
  }),
);

app.post(
  "/master/bag-types",
  asyncHandler(async (req, res) => {
    const body = bagTypeSchema.parse(req.body);
    const result = await query(
      `
      INSERT INTO bag_types (name, weight_kg)
      VALUES ($1, $2)
      RETURNING *;
      `,
      [body.name, body.weight_kg],
    );
    res.status(201).json(result.rows[0]);
  }),
);

app.get(
  "/master/bag-types",
  asyncHandler(async (_req, res) => {
    const result = await query("SELECT * FROM bag_types ORDER BY id DESC");
    res.json(result.rows);
  }),
);

app.post(
  "/procurement/auction-lots",
  asyncHandler(async (req, res) => {
    const body = auctionLotSchema.parse(req.body);
    const lot = await withTransaction(async (client) => {
      const supplierResult = await client.query(
        "SELECT supplier_type FROM suppliers WHERE id = $1",
        [body.marketing_agent_id],
      );
      if (supplierResult.rowCount === 0) {
        throw new ApiError(404, `Supplier ${body.marketing_agent_id} not found`);
      }
      const supplierType = String(supplierResult.rows[0].supplier_type);
      if (supplierType !== "auction_agent" && supplierType !== "other") {
        throw new ApiError(
          400,
          "marketing_agent_id must reference a supplier with type auction_agent or other",
        );
      }

      await ensureReference(client, "grades", body.grade_id, "Grade");
      await ensureReference(client, "warehouses", body.warehouse_id, "Warehouse");
      await ensureReference(client, "bag_types", body.bag_type_id, "Bag type");

      const lotResult = await client.query(
        `
        INSERT INTO lots (
          lot_code, source, source_reference, supplier_id, grade_id, warehouse_id, bag_type_id, crop_year,
          bags_total, weight_total_kg, weight_available_kg, purchase_price_per_kg,
          auction_fees_total, additional_cost_total, status
        )
        VALUES ($1, 'auction', $2, $3, $4, $5, $6, $7, $8, $9, $9, $10, $11, 0, 'in_stock')
        RETURNING *;
        `,
        [
          body.lot_number,
          body.lot_number,
          body.marketing_agent_id,
          body.grade_id,
          body.warehouse_id,
          body.bag_type_id,
          body.crop_year,
          body.bags,
          body.weight_total_kg,
          body.purchase_price_per_kg,
          body.auction_fees_total,
        ],
      );
      const insertedLot = lotResult.rows[0];

      await client.query(
        `
        INSERT INTO auction_procurements (
          lot_id, auction_lot_number, marketing_agent_id, catalog_document_path, immutable
        )
        VALUES ($1, $2, $3, $4, TRUE);
        `,
        [
          insertedLot.id,
          body.lot_number,
          body.marketing_agent_id,
          body.catalog_document_path ?? null,
        ],
      );
      return insertedLot;
    });

    res.status(201).json(lot);
  }),
);

app.post(
  "/procurement/direct-agreements",
  asyncHandler(async (req, res) => {
    const body = directAgreementSchema.parse(req.body);
    const supplierResult = await query("SELECT id FROM suppliers WHERE id = $1", [
      body.supplier_id,
    ]);
    if (supplierResult.rowCount === 0) {
      throw new ApiError(404, `Supplier ${body.supplier_id} not found`);
    }
    const result = await query(
      `
      INSERT INTO direct_agreements (
        supplier_id, agreement_reference, agreed_price_per_kg, currency, crop_year
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
      `,
      [
        body.supplier_id,
        body.agreement_reference,
        body.agreed_price_per_kg,
        body.currency,
        body.crop_year,
      ],
    );
    res.status(201).json(result.rows[0]);
  }),
);

app.post(
  "/procurement/direct-deliveries",
  asyncHandler(async (req, res) => {
    const body = directDeliverySchema.parse(req.body);
    const lot = await withTransaction(async (client) => {
      const agreementResult = await client.query(
        "SELECT * FROM direct_agreements WHERE id = $1",
        [body.agreement_id],
      );
      if (agreementResult.rowCount === 0) {
        throw new ApiError(404, `Direct agreement ${body.agreement_id} not found`);
      }
      const agreement = agreementResult.rows[0];
      await ensureReference(client, "grades", body.grade_id, "Grade");
      await ensureReference(client, "warehouses", body.warehouse_id, "Warehouse");
      await ensureReference(client, "bag_types", body.bag_type_id, "Bag type");

      const additionalCost = body.processing_cost_total + body.transport_cost_total;
      const lotResult = await client.query(
        `
        INSERT INTO lots (
          lot_code, source, source_reference, supplier_id, grade_id, warehouse_id, bag_type_id, crop_year,
          bags_total, weight_total_kg, weight_available_kg, purchase_price_per_kg,
          auction_fees_total, additional_cost_total, status
        )
        VALUES ($1, 'direct', $2, $3, $4, $5, $6, $7, $8, $9, $9, $10, 0, $11, 'in_stock')
        RETURNING *;
        `,
        [
          body.internal_lot_id,
          body.delivery_reference,
          agreement.supplier_id,
          body.grade_id,
          body.warehouse_id,
          body.bag_type_id,
          agreement.crop_year,
          body.bags,
          body.weight_total_kg,
          agreement.agreed_price_per_kg,
          additionalCost,
        ],
      );
      const insertedLot = lotResult.rows[0];

      await client.query(
        `
        INSERT INTO direct_deliveries (
          agreement_id, lot_id, delivery_reference, moisture_percent, screen_size, defects_percent
        )
        VALUES ($1, $2, $3, $4, $5, $6);
        `,
        [
          body.agreement_id,
          insertedLot.id,
          body.delivery_reference,
          body.moisture_percent,
          body.screen_size,
          body.defects_percent,
        ],
      );
      return insertedLot;
    });

    res.status(201).json(lot);
  }),
);

app.get(
  "/inventory/lots",
  asyncHandler(async (_req, res) => {
    const result = await query(
      `
      SELECT
        l.*,
        g.code AS grade_code,
        s.name AS supplier_name,
        w.name AS warehouse_name
      FROM lots l
      JOIN grades g ON g.id = l.grade_id
      JOIN suppliers s ON s.id = l.supplier_id
      JOIN warehouses w ON w.id = l.warehouse_id
      ORDER BY l.id DESC;
      `,
    );
    res.json(result.rows);
  }),
);

app.post(
  "/inventory/adjustments",
  asyncHandler(async (req, res) => {
    const body = stockAdjustmentSchema.parse(req.body);
    const adjustment = await withTransaction(async (client) => {
      const lotResult = await client.query("SELECT * FROM lots WHERE id = $1 FOR UPDATE", [
        body.lot_id,
      ]);
      if (lotResult.rowCount === 0) {
        throw new ApiError(404, `Lot ${body.lot_id} not found`);
      }
      const lot = lotResult.rows[0];
      const newTotal = toNumber(lot.weight_total_kg) + body.adjustment_kg;
      const newAvailable = toNumber(lot.weight_available_kg) + body.adjustment_kg;
      if (newTotal < -EPSILON || newAvailable < -EPSILON) {
        throw new ApiError(409, "Adjustment would make lot quantity negative");
      }

      await client.query(
        `
        UPDATE lots
        SET weight_total_kg = $1, weight_available_kg = $2
        WHERE id = $3;
        `,
        [Math.max(newTotal, 0), Math.max(newAvailable, 0), body.lot_id],
      );
      await refreshLotStatus(client, body.lot_id);

      const insertResult = await client.query(
        `
        INSERT INTO stock_adjustments (lot_id, adjustment_kg, reason, approved_by)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `,
        [body.lot_id, body.adjustment_kg, body.reason, body.approved_by],
      );
      return insertResult.rows[0];
    });
    res.status(201).json(adjustment);
  }),
);

app.get(
  "/inventory/dashboard",
  asyncHandler(async (_req, res) => {
    const lotsResult = await query("SELECT grade_id, source, weight_total_kg, weight_available_kg FROM lots");
    const gradesResult = await query("SELECT id, code FROM grades");
    const allocatedResult = await query(
      "SELECT COALESCE(SUM(allocated_kg), 0) AS total FROM allocations WHERE status = 'allocated'",
    );

    const gradeMap = new Map<number, string>();
    for (const row of gradesResult.rows) {
      gradeMap.set(Number(row.id), String(row.code));
    }

    let totalPhysical = 0;
    let available = 0;
    const byGrade: Record<string, { total_kg: number; available_kg: number }> = {};
    const bySource: Record<string, { total_kg: number; available_kg: number }> = {
      auction: { total_kg: 0, available_kg: 0 },
      direct: { total_kg: 0, available_kg: 0 },
    };

    for (const row of lotsResult.rows) {
      const total = toNumber(row.weight_total_kg);
      const free = toNumber(row.weight_available_kg);
      totalPhysical += total;
      available += free;

      const source = String(row.source);
      if (!bySource[source]) {
        bySource[source] = { total_kg: 0, available_kg: 0 };
      }
      bySource[source].total_kg += total;
      bySource[source].available_kg += free;

      const grade = gradeMap.get(Number(row.grade_id)) ?? "unknown";
      if (!byGrade[grade]) {
        byGrade[grade] = { total_kg: 0, available_kg: 0 };
      }
      byGrade[grade].total_kg += total;
      byGrade[grade].available_kg += free;
    }

    res.json({
      total_physical_stock_kg: Number(totalPhysical.toFixed(3)),
      allocated_stock_kg: Number(toNumber(allocatedResult.rows[0].total).toFixed(3)),
      available_to_sell_kg: Number(available.toFixed(3)),
      by_grade: byGrade,
      by_source: bySource,
    });
  }),
);

app.post(
  "/contracts",
  asyncHandler(async (req, res) => {
    const body = contractSchema.parse(req.body);
    const created = await withTransaction(async (client) => {
      await ensureReference(client, "buyers", body.buyer_id, "Buyer");
      if (body.grade_id) {
        await ensureReference(client, "grades", body.grade_id, "Grade");
      }
      const result = await client.query(
        `
        INSERT INTO contracts (
          contract_number, buyer_id, grade_id, quantity_kg, price_per_kg, price_terms,
          currency, shipment_window_start, shipment_window_end, allocated_kg, shipped_kg, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::date, $9::date, 0, 0, 'open')
        RETURNING *;
        `,
        [
          body.contract_number,
          body.buyer_id,
          body.grade_id ?? null,
          body.quantity_kg,
          body.price_per_kg,
          body.price_terms,
          body.currency,
          body.shipment_window_start,
          body.shipment_window_end,
        ],
      );
      return result.rows[0];
    });
    res.status(201).json(created);
  }),
);

app.post(
  "/contracts/:contractId/allocations",
  asyncHandler(async (req, res) => {
    const contractId = Number(req.params.contractId);
    if (!Number.isFinite(contractId) || contractId <= 0) {
      throw new ApiError(400, "Invalid contractId");
    }
    const body = allocationSchema.parse(req.body);
    const allocation = await withTransaction(async (client) => {
      const contractResult = await client.query("SELECT * FROM contracts WHERE id = $1 FOR UPDATE", [
        contractId,
      ]);
      if (contractResult.rowCount === 0) {
        throw new ApiError(404, `Contract ${contractId} not found`);
      }
      const contract = contractResult.rows[0];
      if (String(contract.status) === "closed") {
        throw new ApiError(400, "Contract is closed");
      }

      const lotResult = await client.query("SELECT * FROM lots WHERE id = $1 FOR UPDATE", [body.lot_id]);
      if (lotResult.rowCount === 0) {
        throw new ApiError(404, `Lot ${body.lot_id} not found`);
      }
      const lot = lotResult.rows[0];

      const remainingContract = toNumber(contract.quantity_kg) - toNumber(contract.allocated_kg);
      if (body.allocated_kg - remainingContract > EPSILON) {
        throw new ApiError(409, "Allocation exceeds remaining contract quantity");
      }
      if (body.allocated_kg - toNumber(lot.weight_available_kg) > EPSILON) {
        throw new ApiError(409, "Allocation exceeds available lot quantity");
      }

      const insertResult = await client.query(
        `
        INSERT INTO allocations (contract_id, lot_id, allocated_kg, status)
        VALUES ($1, $2, $3, 'allocated')
        RETURNING *;
        `,
        [contractId, body.lot_id, body.allocated_kg],
      );

      await client.query(
        "UPDATE contracts SET allocated_kg = allocated_kg + $1 WHERE id = $2",
        [body.allocated_kg, contractId],
      );
      await client.query(
        "UPDATE lots SET weight_available_kg = weight_available_kg - $1 WHERE id = $2",
        [body.allocated_kg, body.lot_id],
      );
      await refreshLotStatus(client, body.lot_id);
      return insertResult.rows[0];
    });

    res.status(201).json(allocation);
  }),
);

app.get(
  "/contracts/dashboard",
  asyncHandler(async (_req, res) => {
    const result = await query("SELECT * FROM contracts ORDER BY id DESC");
    const today = new Date();
    const openContracts = [];
    const riskAlerts = [];

    for (const row of result.rows) {
      const quantity = toNumber(row.quantity_kg);
      const shipped = toNumber(row.shipped_kg);
      const allocated = toNumber(row.allocated_kg);
      const unallocated = Math.max(quantity - allocated, 0);
      const fulfillment = quantity > 0 ? (shipped / quantity) * 100 : 0;
      const endDate = new Date(row.shipment_window_end);
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysToClose = Math.floor((endDate.getTime() - today.getTime()) / msPerDay);

      openContracts.push({
        contract_id: row.id,
        contract_number: row.contract_number,
        status: row.status,
        fulfillment_percent: Number(fulfillment.toFixed(2)),
        unallocated_commitment_kg: Number(unallocated.toFixed(3)),
        shipment_window_end: row.shipment_window_end,
      });

      if (unallocated > EPSILON && daysToClose <= 7) {
        riskAlerts.push({
          contract_number: row.contract_number,
          issue: "Unallocated commitment near shipment window close",
          days_to_window_close: daysToClose,
          unallocated_kg: Number(unallocated.toFixed(3)),
        });
      }
    }

    res.json({
      open_contracts: openContracts,
      risk_alerts: riskAlerts,
    });
  }),
);

app.post(
  "/shipments",
  asyncHandler(async (req, res) => {
    const body = shipmentCreateSchema.parse(req.body);
    const shipment = await withTransaction(async (client) => {
      const contractResult = await client.query("SELECT * FROM contracts WHERE id = $1 FOR UPDATE", [
        body.contract_id,
      ]);
      if (contractResult.rowCount === 0) {
        throw new ApiError(404, `Contract ${body.contract_id} not found`);
      }
      const contract = contractResult.rows[0];

      const shipmentResult = await client.query(
        `
        INSERT INTO shipments (
          shipment_number, contract_id, status, container_number, seal_number, planned_departure
        )
        VALUES ($1, $2, 'planned', $3, $4, $5::date)
        RETURNING *;
        `,
        [
          body.shipment_number,
          body.contract_id,
          body.container_number ?? null,
          body.seal_number ?? null,
          body.planned_departure ?? null,
        ],
      );
      const createdShipment = shipmentResult.rows[0];

      const uniqueAllocationIds = Array.from(new Set(body.allocation_ids));
      const allocationResult = await client.query(
        `
        SELECT * FROM allocations
        WHERE id = ANY($1::int[])
        FOR UPDATE;
        `,
        [uniqueAllocationIds],
      );
      if (allocationResult.rowCount !== uniqueAllocationIds.length) {
        throw new ApiError(404, "One or more allocations do not exist");
      }

      let shipmentKg = 0;
      for (const allocation of allocationResult.rows) {
        if (Number(allocation.contract_id) !== body.contract_id) {
          throw new ApiError(
            409,
            `Allocation ${allocation.id} belongs to contract ${allocation.contract_id}, not ${body.contract_id}`,
          );
        }
        if (String(allocation.status) !== "allocated") {
          throw new ApiError(409, `Allocation ${allocation.id} is not available for shipment`);
        }
        shipmentKg += toNumber(allocation.allocated_kg);
      }

      const newShipped = toNumber(contract.shipped_kg) + shipmentKg;
      if (newShipped - toNumber(contract.quantity_kg) > EPSILON) {
        throw new ApiError(409, "Shipment would over-fulfill contract");
      }

      await client.query(
        `
        UPDATE allocations
        SET status = 'shipped', shipment_id = $1
        WHERE id = ANY($2::int[]);
        `,
        [createdShipment.id, uniqueAllocationIds],
      );

      const contractStatus = nextContractStatus(
        newShipped,
        toNumber(contract.quantity_kg),
        String(contract.status),
      );
      await client.query(
        "UPDATE contracts SET shipped_kg = $1, status = $2 WHERE id = $3",
        [newShipped, contractStatus, body.contract_id],
      );

      const lotsForSnapshotResult = await client.query(
        `
        SELECT
          a.id AS allocation_id,
          a.allocated_kg,
          l.id AS lot_id,
          l.lot_code,
          l.source,
          l.supplier_id,
          l.grade_id
        FROM allocations a
        JOIN lots l ON l.id = a.lot_id
        WHERE a.id = ANY($1::int[])
        ORDER BY a.id;
        `,
        [uniqueAllocationIds],
      );

      const touchedLots = new Set<number>();
      for (const row of lotsForSnapshotResult.rows) {
        const lotId = Number(row.lot_id);
        if (!touchedLots.has(lotId)) {
          touchedLots.add(lotId);
          await refreshLotStatus(client, lotId);
        }
      }

      const traceabilitySnapshot = {
        contract_id: body.contract_id,
        contract_number: contract.contract_number,
        shipment_number: body.shipment_number,
        created_on: new Date().toISOString().slice(0, 10),
        lots: lotsForSnapshotResult.rows.map((row) => ({
          allocation_id: row.allocation_id,
          lot_id: row.lot_id,
          lot_code: row.lot_code,
          source: row.source,
          supplier_id: row.supplier_id,
          grade_id: row.grade_id,
          allocated_kg: toNumber(row.allocated_kg),
        })),
      };

      await client.query(
        "UPDATE shipments SET traceability_snapshot = $1::jsonb WHERE id = $2",
        [JSON.stringify(traceabilitySnapshot), createdShipment.id],
      );

      const finalShipment = await client.query("SELECT * FROM shipments WHERE id = $1", [
        createdShipment.id,
      ]);
      return finalShipment.rows[0];
    });

    res.status(201).json(shipment);
  }),
);

app.patch(
  "/shipments/:shipmentId/status",
  asyncHandler(async (req, res) => {
    const shipmentId = Number(req.params.shipmentId);
    if (!Number.isFinite(shipmentId) || shipmentId <= 0) {
      throw new ApiError(400, "Invalid shipmentId");
    }
    const body = shipmentStatusSchema.parse(req.body);
    const updated = await withTransaction(async (client) => {
      const shipmentResult = await client.query("SELECT * FROM shipments WHERE id = $1 FOR UPDATE", [
        shipmentId,
      ]);
      if (shipmentResult.rowCount === 0) {
        throw new ApiError(404, `Shipment ${shipmentId} not found`);
      }
      const shipment = shipmentResult.rows[0];
      const currentIndex = shipmentProgression.indexOf(String(shipment.status));
      const targetIndex = shipmentProgression.indexOf(body.status);
      if (targetIndex < currentIndex) {
        throw new ApiError(409, "Shipment status cannot move backwards");
      }
      const result = await client.query(
        `
        UPDATE shipments
        SET status = $1, actual_departure = COALESCE($2::date, actual_departure)
        WHERE id = $3
        RETURNING *;
        `,
        [body.status, body.actual_departure ?? null, shipmentId],
      );
      return result.rows[0];
    });
    res.json(updated);
  }),
);

app.post(
  "/shipments/:shipmentId/documents/generate",
  asyncHandler(async (req, res) => {
    const shipmentId = Number(req.params.shipmentId);
    if (!Number.isFinite(shipmentId) || shipmentId <= 0) {
      throw new ApiError(400, "Invalid shipmentId");
    }
    const body = docsGenerateSchema.parse(req.body);

    const docs = await withTransaction(async (client) => {
      const shipmentResult = await client.query("SELECT * FROM shipments WHERE id = $1", [
        shipmentId,
      ]);
      if (shipmentResult.rowCount === 0) {
        throw new ApiError(404, `Shipment ${shipmentId} not found`);
      }
      const shipment = shipmentResult.rows[0];

      const contractResult = await client.query("SELECT * FROM contracts WHERE id = $1", [
        shipment.contract_id,
      ]);
      const contract = contractResult.rows[0];
      const buyerResult = await client.query("SELECT * FROM buyers WHERE id = $1", [contract.buyer_id]);
      const buyer = buyerResult.rows[0];

      const allocationResult = await client.query(
        "SELECT * FROM allocations WHERE shipment_id = $1 ORDER BY id",
        [shipmentId],
      );
      if (allocationResult.rowCount === 0) {
        throw new ApiError(409, "No shipped allocations found for this shipment");
      }
      const allocations = allocationResult.rows;

      const created = [];
      for (const docType of body.doc_types) {
        let payload: Record<string, unknown>;
        if (docType === "commercial_invoice") {
          const totalWeight = allocations.reduce(
            (sum, alloc) => sum + toNumber(alloc.allocated_kg),
            0,
          );
          payload = {
            shipment_number: shipment.shipment_number,
            contract_number: contract.contract_number,
            buyer: buyer.name,
            currency: contract.currency,
            price_per_kg: toNumber(contract.price_per_kg),
            total_weight_kg: Number(totalWeight.toFixed(3)),
            invoice_value: Number((totalWeight * toNumber(contract.price_per_kg)).toFixed(2)),
          };
        } else if (docType === "packing_list") {
          payload = {
            shipment_number: shipment.shipment_number,
            items: allocations.map((alloc) => ({
              allocation_id: alloc.id,
              lot_id: alloc.lot_id,
              weight_kg: toNumber(alloc.allocated_kg),
            })),
          };
        } else if (docType === "traceability_report") {
          payload = shipment.traceability_snapshot;
        } else {
          const lotCostResult = await client.query(
            `
            SELECT
              a.allocated_kg,
              l.weight_total_kg,
              l.purchase_price_per_kg,
              l.auction_fees_total,
              l.additional_cost_total
            FROM allocations a
            JOIN lots l ON l.id = a.lot_id
            WHERE a.shipment_id = $1;
            `,
            [shipmentId],
          );
          let totalLotCost = 0;
          for (const row of lotCostResult.rows) {
            const allocatedKg = toNumber(row.allocated_kg);
            const totalWeight = toNumber(row.weight_total_kg);
            const baseCost = toNumber(row.purchase_price_per_kg);
            const additionalPerKg =
              totalWeight > 0
                ? (toNumber(row.auction_fees_total) + toNumber(row.additional_cost_total)) / totalWeight
                : 0;
            totalLotCost += allocatedKg * (baseCost + additionalPerKg);
          }

          const shipmentCostResult = await client.query(
            "SELECT COALESCE(SUM(amount), 0) AS total FROM cost_entries WHERE shipment_id = $1",
            [shipmentId],
          );
          const shipmentCost = toNumber(shipmentCostResult.rows[0].total);
          payload = {
            shipment_number: shipment.shipment_number,
            lot_cost: Number(totalLotCost.toFixed(2)),
            shipment_cost: Number(shipmentCost.toFixed(2)),
            total_cost: Number((totalLotCost + shipmentCost).toFixed(2)),
          };
        }

        const insertResult = await client.query(
          `
          INSERT INTO shipment_documents (shipment_id, document_type, payload)
          VALUES ($1, $2, $3::jsonb)
          RETURNING *;
          `,
          [shipmentId, docType, JSON.stringify(payload)],
        );
        created.push(insertResult.rows[0]);
      }

      return created;
    });

    res.status(201).json(docs);
  }),
);

app.get(
  "/shipments/:shipmentId/documents",
  asyncHandler(async (req, res) => {
    const shipmentId = Number(req.params.shipmentId);
    if (!Number.isFinite(shipmentId) || shipmentId <= 0) {
      throw new ApiError(400, "Invalid shipmentId");
    }
    const result = await query(
      "SELECT * FROM shipment_documents WHERE shipment_id = $1 ORDER BY id DESC",
      [shipmentId],
    );
    res.json(result.rows);
  }),
);

app.post(
  "/costs/entries",
  asyncHandler(async (req, res) => {
    const body = costEntrySchema.parse(req.body);
    const created = await withTransaction(async (client) => {
      if (body.lot_id) {
        await ensureReference(client, "lots", body.lot_id, "Lot");
      }
      if (body.shipment_id) {
        await ensureReference(client, "shipments", body.shipment_id, "Shipment");
      }
      const result = await client.query(
        `
        INSERT INTO cost_entries (lot_id, shipment_id, category, amount, currency, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
        `,
        [
          body.lot_id ?? null,
          body.shipment_id ?? null,
          body.category,
          body.amount,
          body.currency,
          body.notes ?? null,
        ],
      );
      return result.rows[0];
    });
    res.status(201).json(created);
  }),
);

app.get(
  "/profitability/contracts/:contractId",
  asyncHandler(async (req, res) => {
    const contractId = Number(req.params.contractId);
    if (!Number.isFinite(contractId) || contractId <= 0) {
      throw new ApiError(400, "Invalid contractId");
    }

    const contractResult = await query("SELECT * FROM contracts WHERE id = $1", [contractId]);
    if (contractResult.rowCount === 0) {
      throw new ApiError(404, `Contract ${contractId} not found`);
    }
    const contract = contractResult.rows[0];

    const allocationResult = await query(
      `
      SELECT
        a.allocated_kg,
        a.shipment_id,
        l.weight_total_kg,
        l.purchase_price_per_kg,
        l.auction_fees_total,
        l.additional_cost_total
      FROM allocations a
      JOIN lots l ON l.id = a.lot_id
      WHERE a.contract_id = $1 AND a.status = 'shipped';
      `,
      [contractId],
    );

    let shippedKg = 0;
    let cogs = 0;
    const shipmentIds = new Set<number>();
    for (const row of allocationResult.rows) {
      const allocatedKg = toNumber(row.allocated_kg);
      const totalWeight = toNumber(row.weight_total_kg);
      const base = toNumber(row.purchase_price_per_kg);
      const additionalPerKg =
        totalWeight > 0
          ? (toNumber(row.auction_fees_total) + toNumber(row.additional_cost_total)) / totalWeight
          : 0;
      shippedKg += allocatedKg;
      cogs += allocatedKg * (base + additionalPerKg);
      if (row.shipment_id) {
        shipmentIds.add(Number(row.shipment_id));
      }
    }

    let shipmentCost = 0;
    if (shipmentIds.size > 0) {
      const shipmentCostResult = await query(
        "SELECT COALESCE(SUM(amount), 0) AS total FROM cost_entries WHERE shipment_id = ANY($1::int[])",
        [Array.from(shipmentIds)],
      );
      shipmentCost = toNumber(shipmentCostResult.rows[0].total);
    }

    const revenue = shippedKg * toNumber(contract.price_per_kg);
    const totalCost = cogs + shipmentCost;
    const margin = revenue - totalCost;
    const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0;

    res.json({
      contract_id: contract.id,
      contract_number: contract.contract_number,
      shipped_kg: Number(shippedKg.toFixed(3)),
      revenue: Number(revenue.toFixed(2)),
      cost_of_goods: Number(cogs.toFixed(2)),
      shipment_cost: Number(shipmentCost.toFixed(2)),
      total_cost: Number(totalCost.toFixed(2)),
      margin: Number(margin.toFixed(2)),
      margin_percent: Number(marginPercent.toFixed(2)),
    });
  }),
);

app.get(
  "/traceability/lots/:lotId",
  asyncHandler(async (req, res) => {
    const lotId = Number(req.params.lotId);
    if (!Number.isFinite(lotId) || lotId <= 0) {
      throw new ApiError(400, "Invalid lotId");
    }
    const lotResult = await query("SELECT * FROM lots WHERE id = $1", [lotId]);
    if (lotResult.rowCount === 0) {
      throw new ApiError(404, `Lot ${lotId} not found`);
    }
    const lot = lotResult.rows[0];

    let procurement: Record<string, unknown> = {};
    if (String(lot.source) === "auction") {
      const auctionResult = await query("SELECT * FROM auction_procurements WHERE lot_id = $1", [lotId]);
      const auction = auctionResult.rows[0];
      procurement = {
        source: "auction",
        auction_lot_number: auction?.auction_lot_number ?? lot.source_reference,
        marketing_agent_id: auction?.marketing_agent_id ?? lot.supplier_id,
        catalog_document_path: auction?.catalog_document_path ?? null,
      };
    } else {
      const deliveryResult = await query("SELECT * FROM direct_deliveries WHERE lot_id = $1", [lotId]);
      const delivery = deliveryResult.rows[0];
      const agreementResult = delivery
        ? await query("SELECT * FROM direct_agreements WHERE id = $1", [delivery.agreement_id])
        : { rows: [] };
      const agreement = agreementResult.rows[0];
      procurement = {
        source: "direct",
        agreement_id: agreement?.id ?? null,
        agreement_reference: agreement?.agreement_reference ?? null,
        delivery_reference: delivery?.delivery_reference ?? lot.source_reference,
        quality_metrics: {
          moisture_percent: delivery?.moisture_percent ?? null,
          screen_size: delivery?.screen_size ?? null,
          defects_percent: delivery?.defects_percent ?? null,
        },
      };
    }

    const allocationsResult = await query("SELECT * FROM allocations WHERE lot_id = $1 ORDER BY id", [lotId]);
    const shipmentIds = Array.from(
      new Set(
        allocationsResult.rows
          .map((row) => (row.shipment_id ? Number(row.shipment_id) : null))
          .filter((id): id is number => id !== null),
      ),
    );
    const shipmentsResult =
      shipmentIds.length > 0
        ? await query("SELECT * FROM shipments WHERE id = ANY($1::int[]) ORDER BY id", [shipmentIds])
        : { rows: [] };
    const docsResult =
      shipmentIds.length > 0
        ? await query(
            "SELECT * FROM shipment_documents WHERE shipment_id = ANY($1::int[]) ORDER BY id",
            [shipmentIds],
          )
        : { rows: [] };

    res.json({
      lot,
      procurement,
      allocations: allocationsResult.rows,
      shipments: shipmentsResult.rows,
      documents: docsResult.rows,
    });
  }),
);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      issues: error.issues,
    });
  }
  if (error instanceof ApiError) {
    return res.status(error.status).json({
      message: error.message,
    });
  }
  if (typeof error === "object" && error !== null && "code" in error) {
    const err = error as { code?: string; detail?: string };
    if (err.code === "23505") {
      return res.status(409).json({
        message: "Duplicate record",
        detail: err.detail ?? null,
      });
    }
    if (err.code === "23503") {
      return res.status(409).json({
        message: "Invalid reference",
        detail: err.detail ?? null,
      });
    }
  }

  console.error(error);
  return res.status(500).json({
    message: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`CEOMS API running on http://localhost:${PORT}`);
});
