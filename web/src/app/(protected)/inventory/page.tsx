"use client";

import { useQuery } from "@tanstack/react-query";

import { GuidedActionForm } from "@/components/data/GuidedActionForm";
import { ResourcePanel } from "@/components/data/ResourcePanel";
import { ModuleWorkspace } from "@/components/layout/ModuleWorkspace";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { apiClient } from "@/lib/api/http-client";
import {
  buildInventoryFieldOptions,
  buildStockAdjustmentFields,
  type InventoryReferenceData
} from "@/modules/inventory/config";
import { InventoryDashboardPanel } from "@/modules/inventory/InventoryDashboardPanel";

export default function InventoryPage(): React.JSX.Element {
  const referenceQuery = useQuery({
    queryKey: ["inventory", "reference-data"],
    queryFn: () => apiClient<InventoryReferenceData>("inventory/reference-data")
  });
  const options = buildInventoryFieldOptions(
    referenceQuery.data ?? { grades: [], warehouses: [], suppliers: [], lots: [] }
  );

  return (
    <>
      <ErrorAlert error={referenceQuery.error} />

      <InventoryDashboardPanel />

      <ModuleWorkspace
        title="Inventory Workspace"
        subtitle="Review stock and post adjustments in separate focused views."
        sections={[
          {
            id: "lots",
            label: "Lot Inventory",
            hint: "Search and filters",
            content: (
              <ResourcePanel
                title="Lots"
                description="Paginated lot inventory with standard filter/pagination contract."
                listEndpoint="inventory/lots"
                sortBy="created_at"
                filters={[
                  { name: "source", label: "Source" },
                  { name: "status", label: "Status" },
                  { name: "grade_id", label: "Grade", type: "search-select", options: options.grades },
                  { name: "warehouse_id", label: "Warehouse", type: "search-select", options: options.warehouses },
                  { name: "supplier_id", label: "Supplier", type: "search-select", options: options.suppliers },
                  { name: "crop_year", label: "Crop year" }
                ]}
              />
            )
          },
          {
            id: "adjustments",
            label: "Stock Adjustments",
            hint: "Controlled corrections",
            content: (
              <GuidedActionForm
                title="Stock Adjustment"
                description="Apply approved stock corrections to a lot."
                submitLabel="Apply adjustment"
                successMessage="Stock adjustment saved"
                pathTemplate="inventory/adjustments"
                bodyFields={buildStockAdjustmentFields(options)}
              />
            )
          }
        ]}
      />
    </>
  );
}
