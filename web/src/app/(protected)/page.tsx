import { Card } from "@/components/ui/Card";

export default function OverviewPage(): React.JSX.Element {
  return (
    <>
      <Card
        title="Operations Console"
        description="This workspace is wired to your CEOMS API v1 and follows the same pagination/filter contracts across modules."
      >
        <div className="inline">
          <span className="tag">Secure BFF API proxy</span>
          <span className="tag">Token refresh</span>
          <span className="tag">CSRF forwarding</span>
          <span className="tag">Typed client errors</span>
        </div>
      </Card>

      <Card
        title="How to use"
        description="Open each module in the top menu, create records with the form section, and use list controls for search/filter/pagination."
      >
        <div className="alert info">
          For endpoints that require dynamic path parameters (e.g. allocation, shipment status, docs generation), use the action forms on each module page.
        </div>
      </Card>
    </>
  );
}
