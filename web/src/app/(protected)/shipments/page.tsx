"use client";

import { GuidedActionForm } from "@/components/data/GuidedActionForm";
import {
  shipmentCreateFields,
  shipmentDocumentFields,
  shipmentDocumentViewFields,
  shipmentRecordFields,
  shipmentStatusFields
} from "@/modules/shipments/config";

export default function ShipmentsPage(): React.JSX.Element {
  return (
    <div className="grid two">
      <GuidedActionForm
        title="Create Shipment"
        description="Assemble a shipment from allocated contract quantities."
        submitLabel="Save shipment"
        successMessage="Shipment saved"
        pathTemplate="shipments"
        bodyFields={shipmentCreateFields}
      />

      <GuidedActionForm
        title="Update Shipment Stage"
        description="Move a shipment through its operational stages."
        submitLabel="Update stage"
        successMessage="Shipment stage updated"
        pathTemplate="shipments/{shipment_id}/status"
        pathFields={shipmentRecordFields}
        bodyFields={shipmentStatusFields}
      />

      <GuidedActionForm
        title="Prepare Shipment Documents"
        description="Select document types to prepare for a shipment."
        submitLabel="Prepare documents"
        successMessage="Shipment documents prepared"
        pathTemplate="shipments/{shipment_id}/documents/generate"
        pathFields={shipmentRecordFields}
        bodyFields={shipmentDocumentFields}
      />

      <GuidedActionForm
        title="View Shipment Documents"
        description="Load documents generated for a shipment."
        submitLabel="Load documents"
        successMessage="Shipment documents loaded"
        pathTemplate="shipments/{shipment_id}/documents"
        pathFields={shipmentRecordFields}
        queryFields={shipmentDocumentViewFields}
        method="GET"
      />
    </div>
  );
}
