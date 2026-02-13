import { ApiError } from "../../common/errors/ApiError.js";
import {
  EPSILON,
  ensureReference,
  refreshLotStatus,
  toNumber,
} from "../../common/dbHelpers.js";
import { query, withTransaction } from "../../db/pool.js";
import { AllocationInput, ContractInput } from "./contracts.validation.js";

export class ContractsService {
  async createContract(input: ContractInput): Promise<unknown> {
    return withTransaction(async (client) => {
      await ensureReference(client, "buyers", input.buyer_id, "Buyer");
      if (input.grade_id) {
        await ensureReference(client, "grades", input.grade_id, "Grade");
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
          input.contract_number,
          input.buyer_id,
          input.grade_id ?? null,
          input.quantity_kg,
          input.price_per_kg,
          input.price_terms,
          input.currency,
          input.shipment_window_start,
          input.shipment_window_end,
        ],
      );
      return result.rows[0];
    });
  }

  async allocateLot(contractId: number, input: AllocationInput): Promise<unknown> {
    return withTransaction(async (client) => {
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

      const lotResult = await client.query("SELECT * FROM lots WHERE id = $1 FOR UPDATE", [input.lot_id]);
      if (lotResult.rowCount === 0) {
        throw new ApiError(404, `Lot ${input.lot_id} not found`);
      }
      const lot = lotResult.rows[0];

      const remainingContract = toNumber(contract.quantity_kg) - toNumber(contract.allocated_kg);
      if (input.allocated_kg - remainingContract > EPSILON) {
        throw new ApiError(409, "Allocation exceeds remaining contract quantity");
      }
      if (input.allocated_kg - toNumber(lot.weight_available_kg) > EPSILON) {
        throw new ApiError(409, "Allocation exceeds available lot quantity");
      }

      const insertResult = await client.query(
        `
        INSERT INTO allocations (contract_id, lot_id, allocated_kg, status)
        VALUES ($1, $2, $3, 'allocated')
        RETURNING *;
        `,
        [contractId, input.lot_id, input.allocated_kg],
      );

      await client.query(
        "UPDATE contracts SET allocated_kg = allocated_kg + $1 WHERE id = $2",
        [input.allocated_kg, contractId],
      );
      await client.query(
        "UPDATE lots SET weight_available_kg = weight_available_kg - $1 WHERE id = $2",
        [input.allocated_kg, input.lot_id],
      );
      await refreshLotStatus(client, input.lot_id);
      return insertResult.rows[0];
    });
  }

  async getDashboard(): Promise<unknown> {
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

    return {
      open_contracts: openContracts,
      risk_alerts: riskAlerts,
    };
  }
}

export const contractsService = new ContractsService();
