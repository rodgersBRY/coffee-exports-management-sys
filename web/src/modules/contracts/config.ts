import type { GuidedField } from "@/components/data/GuidedActionForm";

type SelectOption = {
  label: string;
  value: string;
};

export type ContractsReferenceData = {
  buyers: Array<{ id: number; name: string; country?: string | null }>;
  grades: Array<{ id: number; code: string; description?: string | null }>;
  contracts: Array<{ id: number; contract_number: string; status: string }>;
  lots: Array<{
    id: number;
    lot_code: string;
    source: string;
    supplier_name: string;
    grade_code: string;
    weight_available_kg: string | number;
    status: string;
  }>;
};

type ContractsFieldOptions = {
  buyers: SelectOption[];
  grades: SelectOption[];
  contracts: SelectOption[];
  lots: SelectOption[];
};

function toOption(id: number, label: string): SelectOption {
  return { value: String(id), label };
}

export function buildContractsFieldOptions(data: ContractsReferenceData): ContractsFieldOptions {
  return {
    buyers: data.buyers.map((buyer) => toOption(buyer.id, buyer.name)),
    grades: data.grades.map((grade) => toOption(grade.id, grade.code)),
    contracts: data.contracts.map((contract) =>
      toOption(contract.id, `${contract.contract_number} (${contract.status})`)
    ),
    lots: data.lots.map((lot) =>
      toOption(
        lot.id,
        `${lot.lot_code} - ${lot.grade_code} - ${lot.supplier_name} (${lot.weight_available_kg}kg)`
      )
    )
  };
}

export function buildContractFields(options: ContractsFieldOptions): GuidedField[] {
  return [
    { name: "contract_number", label: "Contract number", type: "text", required: true },
    {
      name: "buyer_id",
      label: "Buyer",
      type: "select",
      required: true,
      integer: true,
      options: options.buyers
    },
    {
      name: "grade_id",
      label: "Grade (optional)",
      type: "select",
      integer: true,
      options: options.grades
    },
    { name: "quantity_kg", label: "Quantity (kg)", type: "number", required: true },
    { name: "price_per_kg", label: "Price per kg", type: "number", required: true },
    {
      name: "price_terms",
      label: "Price terms",
      type: "select",
      required: true,
      options: [
        { label: "FOB", value: "fob" },
        { label: "CIF", value: "cif" }
      ]
    },
    { name: "currency", label: "Currency", type: "text", required: true, placeholder: "USD" },
    { name: "shipment_window_start", label: "Shipment window start", type: "date", required: true },
    { name: "shipment_window_end", label: "Shipment window end", type: "date", required: true }
  ];
}

export function buildAllocationPathFields(options: ContractsFieldOptions): GuidedField[] {
  return [
    {
      name: "contract_id",
      label: "Contract",
      type: "select",
      required: true,
      integer: true,
      options: options.contracts
    }
  ];
}

export function buildAllocationFields(options: ContractsFieldOptions): GuidedField[] {
  return [
    { name: "lot_id", label: "Lot", type: "select", required: true, integer: true, options: options.lots },
    { name: "allocated_kg", label: "Allocated quantity (kg)", type: "number", required: true }
  ];
}
