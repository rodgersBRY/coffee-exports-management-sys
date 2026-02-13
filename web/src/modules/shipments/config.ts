import type { GuidedField } from "@/components/data/GuidedActionForm";

export const shipmentCreateFields: GuidedField[] = [
  { name: "shipment_number", label: "Shipment number", type: "text", required: true },
  { name: "contract_id", label: "Contract ID", type: "number", required: true, integer: true },
  { name: "container_number", label: "Container number", type: "text" },
  { name: "seal_number", label: "Seal number", type: "text" },
  { name: "planned_departure", label: "Planned departure", type: "date" },
  {
    name: "allocation_ids",
    label: "Allocation IDs",
    type: "number-list",
    required: true,
    placeholder: "Example: 10,11,12"
  }
];

export const shipmentRecordFields: GuidedField[] = [
  { name: "shipment_id", label: "Shipment ID", type: "number", required: true, integer: true }
];

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
