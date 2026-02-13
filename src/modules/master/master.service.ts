import { query } from "../../db/pool.js";
import {
  BagTypeInput,
  BuyerInput,
  GradeInput,
  SupplierInput,
  WarehouseInput,
} from "./master.validation.js";

export class MasterService {
  async createSupplier(input: SupplierInput): Promise<unknown> {
    const result = await query(
      `
      INSERT INTO suppliers (name, supplier_type, country)
      VALUES ($1, $2, $3)
      RETURNING *;
      `,
      [input.name, input.type, input.country ?? null],
    );
    return result.rows[0];
  }

  async listSuppliers(): Promise<unknown[]> {
    const result = await query("SELECT * FROM suppliers ORDER BY id DESC");
    return result.rows;
  }

  async createBuyer(input: BuyerInput): Promise<unknown> {
    const result = await query(
      `
      INSERT INTO buyers (name, country)
      VALUES ($1, $2)
      RETURNING *;
      `,
      [input.name, input.country ?? null],
    );
    return result.rows[0];
  }

  async listBuyers(): Promise<unknown[]> {
    const result = await query("SELECT * FROM buyers ORDER BY id DESC");
    return result.rows;
  }

  async createWarehouse(input: WarehouseInput): Promise<unknown> {
    const result = await query(
      `
      INSERT INTO warehouses (name, location)
      VALUES ($1, $2)
      RETURNING *;
      `,
      [input.name, input.location ?? null],
    );
    return result.rows[0];
  }

  async listWarehouses(): Promise<unknown[]> {
    const result = await query("SELECT * FROM warehouses ORDER BY id DESC");
    return result.rows;
  }

  async createGrade(input: GradeInput): Promise<unknown> {
    const result = await query(
      `
      INSERT INTO grades (code, description)
      VALUES ($1, $2)
      RETURNING *;
      `,
      [input.code, input.description ?? null],
    );
    return result.rows[0];
  }

  async listGrades(): Promise<unknown[]> {
    const result = await query("SELECT * FROM grades ORDER BY id DESC");
    return result.rows;
  }

  async createBagType(input: BagTypeInput): Promise<unknown> {
    const result = await query(
      `
      INSERT INTO bag_types (name, weight_kg)
      VALUES ($1, $2)
      RETURNING *;
      `,
      [input.name, input.weight_kg],
    );
    return result.rows[0];
  }

  async listBagTypes(): Promise<unknown[]> {
    const result = await query("SELECT * FROM bag_types ORDER BY id DESC");
    return result.rows;
  }
}

export const masterService = new MasterService();
