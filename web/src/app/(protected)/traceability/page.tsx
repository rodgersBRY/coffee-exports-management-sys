"use client";

import { ActionPanel } from "@/components/data/ActionPanel";

export default function TraceabilityPage(): React.JSX.Element {
  return (
    <ActionPanel
      title="Lot Traceability"
      description="Use GET path like traceability/lots/14 to inspect full backward/forward trace chain."
      endpoint="traceability/lots/1"
      method="GET"
      sampleBody="{}"
    />
  );
}
