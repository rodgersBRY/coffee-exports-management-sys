import type { GuidedField } from "@/components/data/GuidedActionForm";

export const costEntryFields: GuidedField[] = [
  { name: "lot_id", label: "Lot ID (optional)", type: "number", integer: true },
  { name: "shipment_id", label: "Shipment ID (optional)", type: "number", integer: true },
  { name: "category", label: "Cost category", type: "text", required: true },
  { name: "amount", label: "Amount", type: "number", required: true },
  { name: "currency", label: "Currency", type: "text", required: true, placeholder: "USD" },
  { name: "notes", label: "Notes", type: "textarea", rows: 3 }
];

export const contractLookupFields: GuidedField[] = [
  { name: "contract_id", label: "Contract ID", type: "number", required: true, integer: true }
];
