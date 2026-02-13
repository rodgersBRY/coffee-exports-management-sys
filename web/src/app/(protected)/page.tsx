import { Card } from "@/components/ui/Card";
import { OperationsOverview } from "@/modules/dashboard/OperationsOverview";

export default function OverviewPage(): React.JSX.Element {
  return (
    <>
      <OperationsOverview />

      <Card
        title="Design Intent"
        description="Built for lot-heavy exporter operations with high table contrast, fast filtering, and exception visibility."
      >
        <div className="inline">
          <span className="tag">Auction vs direct visual tags</span>
          <span className="tag">Sticky table headers</span>
          <span className="tag">Collapsible operations panels</span>
          <span className="tag">Breadcrumb context</span>
        </div>
      </Card>
    </>
  );
}
