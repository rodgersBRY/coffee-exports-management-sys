import type { FieldConfig, FilterConfig } from "@/components/data/ResourcePanel";

export const apiKeyFields: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "user_id", label: "User ID (admin optional)", type: "number", integer: true },
  { name: "expires_in_days", label: "Expires in days", type: "number", integer: true }
];

export const apiKeyFilters: FilterConfig[] = [
  { name: "user_id", label: "Filter user_id" },
  { name: "is_active", label: "Filter is_active" }
];
