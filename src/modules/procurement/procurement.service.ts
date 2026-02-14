import { ApiError } from "../../common/errors/ApiError.js";
import { ensureReference } from "../../common/dbHelpers.js";
import {
  ListQueryParams,
  buildPaginatedResult,
  escapeLikeQuery,
  toIntFilter,
} from "../../common/pagination.js";
import { query, withTransaction } from "../../db/pool.js";
import {
  AuctionLotInput,
  DirectAgreementInput,
  DirectDeliveryInput,
} from "./procurement.validation.js";

export class ProcurementService {
  async createAuctionLot(input: AuctionLotInput): Promise<unknown> {
    return withTransaction(async (client) => {
      const supplierResult = await client.query(
        "SELECT supplier_type FROM suppliers WHERE id = $1",
        [input.marketing_agent_id],
      );
      if (supplierResult.rowCount === 0) {
        throw new ApiError(404, `Supplier ${input.marketing_agent_id} not found`);
      }
      const supplierType = String(supplierResult.rows[0].supplier_type);
      if (supplierType !== "auction_agent") {
        throw new ApiError(
          400,
          "marketing_agent_id must reference a supplier with type auction_agent",
        );
      }

      await ensureReference(client, "grades", input.grade_id, "Grade");
      await ensureReference(client, "warehouses", input.warehouse_id, "Warehouse");
      await ensureReference(client, "bag_types", input.bag_type_id, "Bag type");

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
          input.lot_number,
          input.lot_number,
          input.marketing_agent_id,
          input.grade_id,
          input.warehouse_id,
          input.bag_type_id,
          input.crop_year,
          input.bags,
          input.weight_total_kg,
          input.purchase_price_per_kg,
          input.auction_fees_total,
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
          input.lot_number,
          input.marketing_agent_id,
          input.catalog_document_path ?? null,
        ],
      );
      return insertedLot;
    });
  }

  async createDirectAgreement(input: DirectAgreementInput): Promise<unknown> {
    return withTransaction(async (client) => {
      const supplierResult = await client.query(
        "SELECT supplier_type FROM suppliers WHERE id = $1",
        [input.supplier_id],
      );
      if (supplierResult.rowCount === 0) {
        throw new ApiError(404, `Supplier ${input.supplier_id} not found`);
      }
      const supplierType = String(supplierResult.rows[0].supplier_type);
      if (supplierType === "auction_agent") {
        throw new ApiError(
          400,
          "Direct procurement supplier cannot be an auction marketing agent",
        );
      }

      const result = await client.query(
        `
        INSERT INTO direct_agreements (
          supplier_id, agreement_reference, agreed_price_per_kg, currency, crop_year
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
        `,
        [
          input.supplier_id,
          input.agreement_reference,
          input.agreed_price_per_kg,
          input.currency,
          input.crop_year,
        ],
      );
      return result.rows[0];
    });
  }

  async createDirectDelivery(input: DirectDeliveryInput): Promise<unknown> {
    return withTransaction(async (client) => {
      const agreementResult = await client.query(
        "SELECT * FROM direct_agreements WHERE id = $1",
        [input.agreement_id],
      );
      if (agreementResult.rowCount === 0) {
        throw new ApiError(404, `Direct agreement ${input.agreement_id} not found`);
      }
      const agreement = agreementResult.rows[0];

      await ensureReference(client, "grades", input.grade_id, "Grade");
      await ensureReference(client, "warehouses", input.warehouse_id, "Warehouse");
      await ensureReference(client, "bag_types", input.bag_type_id, "Bag type");

      const additionalCost = input.processing_cost_total + input.transport_cost_total;
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
          input.internal_lot_id,
          input.delivery_reference,
          agreement.supplier_id,
          input.grade_id,
          input.warehouse_id,
          input.bag_type_id,
          agreement.crop_year,
          input.bags,
          input.weight_total_kg,
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
          input.agreement_id,
          insertedLot.id,
          input.delivery_reference,
          input.moisture_percent,
          input.screen_size,
          input.defects_percent,
        ],
      );
      return insertedLot;
    });
  }

  async listDirectAgreements(listQuery: ListQueryParams): Promise<unknown> {
    const whereClauses: string[] = [];
    const values: unknown[] = [];
    const supplierId = toIntFilter(listQuery.filters, "supplier_id");

    if (listQuery.search) {
      values.push(`%${escapeLikeQuery(listQuery.search)}%`);
      whereClauses.push(`agreement_reference ILIKE $${values.length} ESCAPE '\\'`);
    }
    if (supplierId) {
      values.push(supplierId);
      whereClauses.push(`supplier_id = $${values.length}`);
    }
    if (listQuery.filters.crop_year) {
      values.push(listQuery.filters.crop_year);
      whereClauses.push(`crop_year = $${values.length}`);
    }
    if (listQuery.filters.currency) {
      values.push(listQuery.filters.currency.toUpperCase());
      whereClauses.push(`currency = $${values.length}`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const countResult = await query<{ total: number }>(
      `SELECT COUNT(*)::int AS total FROM direct_agreements ${whereSql}`,
      values,
    );
    values.push(listQuery.pageSize, listQuery.offset);
    const result = await query(
      `
      SELECT
        da.*,
        s.name AS supplier_name
      FROM direct_agreements da
      JOIN suppliers s ON s.id = da.supplier_id
      ${whereSql}
      ORDER BY da.${listQuery.sortBy} ${listQuery.sortOrder}
      LIMIT $${values.length - 1} OFFSET $${values.length}
      `,
      values,
    );
    return buildPaginatedResult(result.rows, Number(countResult.rows[0].total), listQuery);
  }

  async getReferenceData(): Promise<unknown> {
    const [suppliersResult, marketingAgentsResult, warehousesResult, gradesResult, bagTypesResult, agreementsResult] =
      await Promise.all([
        query(
          `
          SELECT id, name, supplier_type
          FROM suppliers
          WHERE supplier_type <> 'auction_agent'
          ORDER BY name ASC
          `,
        ),
        query(
          `
          SELECT id, name, supplier_type
          FROM suppliers
          WHERE supplier_type = 'auction_agent'
          ORDER BY name ASC
          `,
        ),
        query(
          `
          SELECT id, name, location
          FROM warehouses
          ORDER BY name ASC
          `,
        ),
        query(
          `
          SELECT id, code, description
          FROM grades
          ORDER BY code ASC
          `,
        ),
        query(
          `
          SELECT id, name, weight_kg
          FROM bag_types
          ORDER BY weight_kg ASC, name ASC
          `,
        ),
        query(
          `
          SELECT
            da.id,
            da.agreement_reference,
            da.crop_year,
            da.currency,
            da.supplier_id,
            s.name AS supplier_name
          FROM direct_agreements da
          JOIN suppliers s ON s.id = da.supplier_id
          ORDER BY da.created_at DESC, da.id DESC
          LIMIT 500
          `,
        ),
      ]);

    return {
      suppliers: suppliersResult.rows,
      marketing_agents: marketingAgentsResult.rows,
      warehouses: warehousesResult.rows,
      grades: gradesResult.rows,
      bag_types: bagTypesResult.rows,
      direct_agreements: agreementsResult.rows,
    };
  }
}

export const procurementService = new ProcurementService();
