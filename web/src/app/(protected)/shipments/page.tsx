"use client";

import { useQuery } from "@tanstack/react-query";

import { GuidedActionForm } from "@/components/data/GuidedActionForm";
import { ModuleWorkspace } from "@/components/layout/ModuleWorkspace";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { apiClient } from "@/lib/api/http-client";
import {
  buildShipmentCreateFields,
  buildShipmentRecordFields,
  buildShipmentsFieldOptions,
  type ShipmentsReferenceData,
  shipmentDocumentFields,
  shipmentDocumentViewFields,
  shipmentStatusFields
} from "@/modules/shipments/config";

export default function ShipmentsPage(): React.JSX.Element {
  const referenceQuery = useQuery({
    queryKey: ["shipments", "reference-data"],
    queryFn: () => apiClient<ShipmentsReferenceData>("shipments/reference-data")
  });
  const options = buildShipmentsFieldOptions(
    referenceQuery.data ?? { contracts: [], allocations: [], shipments: [] }
  );

  return (
    <>
      <ErrorAlert error={referenceQuery.error} />
      <ModuleWorkspace
        title="Shipment Workspace"
        subtitle="Execute shipment operations stage by stage."
        sections={[
          {
            id: "create",
            label: "Create",
            hint: "Build shipment",
            content: (
              <GuidedActionForm
                title="Create Shipment"
                description="Assemble a shipment from allocated contract quantities."
                submitLabel="Save shipment"
                successMessage="Shipment saved"
                pathTemplate="shipments"
                bodyFields={buildShipmentCreateFields(options)}
              />
            )
          },
          {
            id: "status",
            label: "Stage Update",
            hint: "Progress tracking",
            content: (
              <GuidedActionForm
                title="Update Shipment Stage"
                description="Move a shipment through its operational stages."
                submitLabel="Update stage"
                successMessage="Shipment stage updated"
                pathTemplate="shipments/{shipment_id}/status"
                pathFields={buildShipmentRecordFields(options)}
                bodyFields={shipmentStatusFields}
                method="PATCH"
              />
            )
          },
          {
            id: "prepare-docs",
            label: "Prepare Documents",
            hint: "Generate records",
            content: (
              <GuidedActionForm
                title="Prepare Shipment Documents"
                description="Select document types to prepare for a shipment."
                submitLabel="Prepare documents"
                successMessage="Shipment documents prepared"
                pathTemplate="shipments/{shipment_id}/documents/generate"
                pathFields={buildShipmentRecordFields(options)}
                bodyFields={shipmentDocumentFields}
              />
            )
          },
          {
            id: "view-docs",
            label: "View Documents",
            hint: "History and output",
            content: (
              <GuidedActionForm
                title="View Shipment Documents"
                description="Load documents generated for a shipment."
                submitLabel="Load documents"
                successMessage="Shipment documents loaded"
                pathTemplate="shipments/{shipment_id}/documents"
                pathFields={buildShipmentRecordFields(options)}
                queryFields={shipmentDocumentViewFields}
                method="GET"
              />
            )
          }
        ]}
      />
    </>
  );
}
