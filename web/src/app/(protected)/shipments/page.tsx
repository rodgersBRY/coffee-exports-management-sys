"use client";

import { ActionPanel } from "@/components/data/ActionPanel";
import {
  createShipmentSample,
  generateDocsSample,
  shipmentStatusSample
} from "@/modules/shipments/config";

export default function ShipmentsPage(): React.JSX.Element {
  return (
    <div className="grid two">
      <ActionPanel
        title="Create Shipment"
        description="Assemble shipment from allocated contract quantities."
        endpoint="shipments"
        method="POST"
        sampleBody={JSON.stringify(createShipmentSample, null, 2)}
      />

      <ActionPanel
        title="Update Shipment Status"
        description="Use path like shipments/5/status and status progression rules."
        endpoint="shipments/1/status"
        method="PATCH"
        sampleBody={JSON.stringify(shipmentStatusSample, null, 2)}
      />

      <ActionPanel
        title="Generate Shipment Documents"
        description="Use path like shipments/5/documents/generate."
        endpoint="shipments/1/documents/generate"
        method="POST"
        sampleBody={JSON.stringify(generateDocsSample, null, 2)}
      />

      <ActionPanel
        title="List Shipment Documents"
        description="Use GET path like shipments/5/documents?page=1&page_size=20."
        endpoint="shipments/1/documents"
        method="GET"
        sampleBody="{}"
      />
    </div>
  );
}
