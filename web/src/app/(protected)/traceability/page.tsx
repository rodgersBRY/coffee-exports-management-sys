"use client";

import { GuidedActionForm } from "@/components/data/GuidedActionForm";
import { lotLookupFields } from "@/modules/traceability/config";

export default function TraceabilityPage(): React.JSX.Element {
  return (
    <GuidedActionForm
      title="Lot Traceability"
      description="Load complete source-to-shipment trace history for a lot."
      submitLabel="View trace history"
      successMessage="Trace history loaded"
      pathTemplate="traceability/lots/{lot_id}"
      pathFields={lotLookupFields}
      method="GET"
    />
  );
}
