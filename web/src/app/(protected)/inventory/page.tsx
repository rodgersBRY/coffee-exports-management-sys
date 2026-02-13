"use client";

import { ActionPanel } from "@/components/data/ActionPanel";
import { ResourcePanel } from "@/components/data/ResourcePanel";
import { InventoryDashboardPanel } from "@/modules/inventory/InventoryDashboardPanel";

const adjustmentSample = {
  lot_id: 1,
  adjustment_kg: -50,
  reason: "Bag damage reconciliation",
  approved_by: "warehouse-supervisor"
};

export default function InventoryPage(): React.JSX.Element {
  return (
    <>
      <InventoryDashboardPanel />

      <div className="grid two">
        <ResourcePanel
          title="Lots"
          description="Paginated lot inventory with standard filter/pagination contract."
          listEndpoint="inventory/lots"
          sortBy="created_at"
          filters={[
            { name: "source", label: "Filter source" },
            { name: "status", label: "Filter status" },
            { name: "grade_id", label: "Filter grade_id" },
            { name: "warehouse_id", label: "Filter warehouse_id" },
            { name: "supplier_id", label: "Filter supplier_id" },
            { name: "crop_year", label: "Filter crop_year" }
          ]}
        />

        <ActionPanel
          title="Adjust Stock"
          description="Apply approved stock adjustments against specific lots."
          endpoint="inventory/adjustments"
          method="POST"
          sampleBody={JSON.stringify(adjustmentSample, null, 2)}
        />
      </div>
    </>
  );
}
