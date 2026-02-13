"use client";

import { GuidedActionForm } from "@/components/data/GuidedActionForm";
import { ResourcePanel } from "@/components/data/ResourcePanel";
import { stockAdjustmentFields } from "@/modules/inventory/config";
import { InventoryDashboardPanel } from "@/modules/inventory/InventoryDashboardPanel";

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
            { name: "source", label: "Source" },
            { name: "status", label: "Status" },
            { name: "grade_id", label: "Grade ID" },
            { name: "warehouse_id", label: "Warehouse ID" },
            { name: "supplier_id", label: "Supplier ID" },
            { name: "crop_year", label: "Crop year" }
          ]}
        />

        <GuidedActionForm
          title="Stock Adjustment"
          description="Apply approved stock corrections to a lot."
          submitLabel="Apply adjustment"
          successMessage="Stock adjustment saved"
          pathTemplate="inventory/adjustments"
          bodyFields={stockAdjustmentFields}
        />
      </div>
    </>
  );
}
