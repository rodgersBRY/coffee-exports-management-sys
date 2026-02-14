import type { FieldConfig, FilterConfig } from "@/components/data/ResourcePanel";

type SelectOption = {
  label: string;
  value: string;
};

type SecurityFieldOptions = {
  users: SelectOption[];
};

export function buildSecurityFieldOptions(
  users: Array<{ id: number; full_name: string; email: string }>
): SecurityFieldOptions {
  return {
    users: users.map((user) => ({
      value: String(user.id),
      label: `${user.full_name} (${user.email})`
    }))
  };
}

export function buildApiKeyFields(options: SecurityFieldOptions): FieldConfig[] {
  return [
    { name: "name", label: "Name", type: "text", required: true },
    {
      name: "user_id",
      label: "User (optional)",
      type: "select",
      integer: true,
      options: options.users
    },
    { name: "expires_in_days", label: "Expires in days", type: "number", integer: true }
  ];
}

export function buildApiKeyFilters(options: SecurityFieldOptions): FilterConfig[] {
  return [
    { name: "user_id", label: "User", type: "select", options: options.users },
    {
      name: "is_active",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" }
      ]
    }
  ];
}
