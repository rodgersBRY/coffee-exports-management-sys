"use client";

import { ResourcePanel } from "@/components/data/ResourcePanel";
import { masterPanels } from "@/modules/master/config";

export default function MasterPage(): React.JSX.Element {
  return (
    <div className="grid two">
      {masterPanels.map((panel) => (
        <ResourcePanel
          key={panel.title}
          title={panel.title}
          description={panel.description}
          listEndpoint={panel.listEndpoint}
          createEndpoint={panel.createEndpoint}
          createFields={panel.createFields}
          sortBy={panel.sortBy}
          filters={panel.filters}
        />
      ))}
    </div>
  );
}
