"use client";

import { useQuery } from "@tanstack/react-query";

import { GuidedActionForm } from "@/components/data/GuidedActionForm";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { apiClient } from "@/lib/api/http-client";
import {
  buildLotLookupFields,
  buildTraceabilityFieldOptions,
  type TraceabilityReferenceData
} from "@/modules/traceability/config";

export default function TraceabilityPage(): React.JSX.Element {
  const referenceQuery = useQuery({
    queryKey: ["traceability", "reference-data"],
    queryFn: () => apiClient<TraceabilityReferenceData>("traceability/reference-data")
  });
  const options = buildTraceabilityFieldOptions(referenceQuery.data ?? { lots: [] });

  return (
    <>
      <ErrorAlert error={referenceQuery.error} />
      <GuidedActionForm
        title="Lot Traceability"
        description="Load complete source-to-shipment trace history for a lot."
        submitLabel="View trace history"
        successMessage="Trace history loaded"
        pathTemplate="traceability/lots/{lot_id}"
        pathFields={buildLotLookupFields(options)}
        method="GET"
      />
    </>
  );
}
