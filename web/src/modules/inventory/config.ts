import type { GuidedField } from "@/components/data/GuidedActionForm";

type SelectOption = {
  label: string;
  value: string;
};

export type InventoryReferenceData = {
  grades: Array<{ id: number; code: string }>;
  warehouses: Array<{ id: number; name: string }>;
  suppliers: Array<{ id: number; name: string }>;
  lots: Array<{
    id: number;
    lot_code: string;
    source: string;
    status: string;
    weight_available_kg: string | number;
  }>;
};

type InventoryFieldOptions = {
  grades: SelectOption[];
  warehouses: SelectOption[];
  suppliers: SelectOption[];
  lots: SelectOption[];
};

function toOption(id: number, label: string): SelectOption {
  return { value: String(id), label };
}

export function buildInventoryFieldOptions(data: InventoryReferenceData): InventoryFieldOptions {
  return {
    grades: data.grades.map((grade) => toOption(grade.id, grade.code)),
    warehouses: data.warehouses.map((warehouse) => toOption(warehouse.id, warehouse.name)),
    suppliers: data.suppliers.map((supplier) => toOption(supplier.id, supplier.name)),
    lots: data.lots.map((lot) =>
      toOption(lot.id, `${lot.lot_code} (${lot.source}, ${lot.weight_available_kg}kg available)`)
    )
  };
}

export function buildStockAdjustmentFields(options: InventoryFieldOptions): GuidedField[] {
  return [
    {
      name: "lot_id",
      label: "Lot",
      type: "search-select",
      required: true,
      integer: true,
      options: options.lots
    },
    { name: "adjustment_kg", label: "Adjustment (kg)", type: "number", required: true },
    { name: "reason", label: "Reason", type: "text", required: true },
    { name: "approved_by", label: "Approved by", type: "text", required: true }
  ];
}
