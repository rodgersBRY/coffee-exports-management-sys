import type { GuidedField } from "@/components/data/GuidedActionForm";

export const contractFields: GuidedField[] = [
  { name: "contract_number", label: "Contract number", type: "text", required: true },
  { name: "buyer_id", label: "Buyer ID", type: "number", required: true, integer: true },
  { name: "grade_id", label: "Grade ID (optional)", type: "number", integer: true },
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

export const allocationPathFields: GuidedField[] = [
  { name: "contract_id", label: "Contract ID", type: "number", required: true, integer: true }
];

export const allocationFields: GuidedField[] = [
  { name: "lot_id", label: "Lot ID", type: "number", required: true, integer: true },
  { name: "allocated_kg", label: "Allocated quantity (kg)", type: "number", required: true }
];
