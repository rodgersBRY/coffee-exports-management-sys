import type { GuidedField } from "@/components/data/GuidedActionForm";

type SelectOption = {
  label: string;
  value: string;
};

export type FinanceReferenceData = {
  contracts: Array<{ id: number; contract_number: string; status: string }>;
  lots: Array<{ id: number; lot_code: string; source: string; status: string }>;
  shipments: Array<{ id: number; shipment_number: string; status: string }>;
};

type FinanceFieldOptions = {
  contracts: SelectOption[];
  lots: SelectOption[];
  shipments: SelectOption[];
};

function toOption(id: number, label: string): SelectOption {
  return { value: String(id), label };
}

export function buildFinanceFieldOptions(data: FinanceReferenceData): FinanceFieldOptions {
  return {
    contracts: data.contracts.map((contract) =>
      toOption(contract.id, `${contract.contract_number} (${contract.status})`)
    ),
    lots: data.lots.map((lot) => toOption(lot.id, `${lot.lot_code} (${lot.source})`)),
    shipments: data.shipments.map((shipment) =>
      toOption(shipment.id, `${shipment.shipment_number} (${shipment.status})`)
    )
  };
}

export function buildCostEntryFields(options: FinanceFieldOptions): GuidedField[] {
  return [
    {
      name: "lot_id",
      label: "Lot (optional)",
      type: "search-select",
      integer: true,
      options: options.lots
    },
    {
      name: "shipment_id",
      label: "Shipment (optional)",
      type: "search-select",
      integer: true,
      options: options.shipments
    },
    { name: "category", label: "Cost category", type: "text", required: true },
    { name: "amount", label: "Amount", type: "number", required: true },
    { name: "currency", label: "Currency", type: "text", required: true, placeholder: "USD" },
    { name: "notes", label: "Notes", type: "textarea", rows: 3 }
  ];
}

export function buildContractLookupFields(options: FinanceFieldOptions): GuidedField[] {
  return [
    {
      name: "contract_id",
      label: "Contract",
      type: "search-select",
      required: true,
      integer: true,
      options: options.contracts
    }
  ];
}
