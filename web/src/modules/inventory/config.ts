import type { GuidedField } from "@/components/data/GuidedActionForm";

export const stockAdjustmentFields: GuidedField[] = [
  { name: "lot_id", label: "Lot ID", type: "number", required: true, integer: true },
  { name: "adjustment_kg", label: "Adjustment (kg)", type: "number", required: true },
  { name: "reason", label: "Reason", type: "text", required: true },
  { name: "approved_by", label: "Approved by", type: "text", required: true }
];
