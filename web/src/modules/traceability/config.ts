import type { GuidedField } from "@/components/data/GuidedActionForm";

export const lotLookupFields: GuidedField[] = [
  { name: "lot_id", label: "Lot ID", type: "number", required: true, integer: true }
];
