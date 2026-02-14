import type { GuidedField } from "@/components/data/GuidedActionForm";

type SelectOption = {
  label: string;
  value: string;
};

export type ShipmentsReferenceData = {
  contracts: Array<{ id: number; contract_number: string; status: string }>;
  allocations: Array<{
    id: number;
    contract_id: number;
    contract_number: string;
    lot_code: string;
    allocated_kg: string | number;
  }>;
  shipments: Array<{
    id: number;
    shipment_number: string;
    status: string;
    contract_number: string;
  }>;
};

type ShipmentsFieldOptions = {
  contracts: SelectOption[];
  allocations: SelectOption[];
  shipments: SelectOption[];
};

function toOption(id: number, label: string): SelectOption {
  return { value: String(id), label };
}

export function buildShipmentsFieldOptions(data: ShipmentsReferenceData): ShipmentsFieldOptions {
  return {
    contracts: data.contracts.map((contract) =>
      toOption(contract.id, `${contract.contract_number} (${contract.status})`)
    ),
    allocations: data.allocations.map((allocation) =>
      toOption(
        allocation.id,
        `${allocation.contract_number} - Lot ${allocation.lot_code} (${allocation.allocated_kg}kg)`
      )
    ),
    shipments: data.shipments.map((shipment) =>
      toOption(
        shipment.id,
        `${shipment.shipment_number} - ${shipment.contract_number} (${shipment.status})`
      )
    )
  };
}

export function buildShipmentCreateFields(options: ShipmentsFieldOptions): GuidedField[] {
  return [
    { name: "shipment_number", label: "Shipment number", type: "text", required: true },
    {
      name: "contract_id",
      label: "Contract",
      type: "select",
      required: true,
      integer: true,
      options: options.contracts
    },
    { name: "container_number", label: "Container number", type: "text" },
    { name: "seal_number", label: "Seal number", type: "text" },
    { name: "planned_departure", label: "Planned departure", type: "date" },
    {
      name: "allocation_ids",
      label: "Allocations to ship",
      type: "checkbox-group",
      required: true,
      integer: true,
      options: options.allocations
    }
  ];
}

export function buildShipmentRecordFields(options: ShipmentsFieldOptions): GuidedField[] {
  return [
    {
      name: "shipment_id",
      label: "Shipment",
      type: "select",
      required: true,
      integer: true,
      options: options.shipments
    }
  ];
}

export const shipmentStatusFields: GuidedField[] = [
  {
    name: "status",
    label: "Current stage",
    type: "select",
    required: true,
    options: [
      { label: "Planned", value: "planned" },
      { label: "Stuffed", value: "stuffed" },
      { label: "Cleared", value: "cleared" },
      { label: "On vessel", value: "on_vessel" },
      { label: "Completed", value: "completed" }
    ]
  },
  { name: "actual_departure", label: "Actual departure", type: "date" }
];

export const shipmentDocumentFields: GuidedField[] = [
  {
    name: "doc_types",
    label: "Documents to prepare",
    type: "checkbox-group",
    required: true,
    options: [
      { label: "Commercial Invoice", value: "commercial_invoice" },
      { label: "Packing List", value: "packing_list" },
      { label: "Traceability Report", value: "traceability_report" },
      { label: "Cost Breakdown", value: "cost_breakdown_summary" }
    ]
  }
];

export const shipmentDocumentViewFields: GuidedField[] = [
  { name: "page", label: "Page", type: "number", integer: true },
  { name: "page_size", label: "Rows per page", type: "number", integer: true },
  {
    name: "filter_document_type",
    label: "Document type",
    type: "select",
    options: [
      { label: "All", value: "" },
      { label: "Commercial Invoice", value: "commercial_invoice" },
      { label: "Packing List", value: "packing_list" },
      { label: "Traceability Report", value: "traceability_report" },
      { label: "Cost Breakdown", value: "cost_breakdown_summary" }
    ]
  }
];
