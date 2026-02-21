"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { Card } from "@/components/ui/Card";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { apiClient } from "@/lib/api/http-client";

type InventoryDashboard = {
  total_physical_stock_kg: number;
  allocated_stock_kg: number;
  available_to_sell_kg: number;
  by_grade: Record<string, { total_kg: number; available_kg: number }>;
  by_source: Record<string, { total_kg: number; available_kg: number }>;
};

type RiskAlert = {
  contract_number: string;
  issue: string;
  days_to_window_close: number;
  unallocated_kg: number;
};

type ContractItem = {
  contract_number: string;
  status: string;
  fulfillment_percent: number;
  unallocated_commitment_kg: number;
};

type ContractDashboard = {
  data: ContractItem[];
  risk_alerts: RiskAlert[];
};

function sumBySource(bySource: InventoryDashboard["by_source"]): number {
  return Object.values(bySource).reduce((acc, row) => acc + row.total_kg, 0);
}

export function OperationsOverview(): React.JSX.Element {
  const inventoryQuery = useQuery({
    queryKey: ["dashboard", "inventory"],
    queryFn: () => apiClient<InventoryDashboard>("inventory/dashboard")
  });

  const contractsQuery = useQuery({
    queryKey: ["dashboard", "contracts"],
    queryFn: () =>
      apiClient<ContractDashboard>(
        "contracts/dashboard",
        { query: "?page=1&page_size=20&sort_by=shipment_window_end&sort_order=asc" }
      )
  });

  const sourceBars = useMemo(() => {
    if (!inventoryQuery.data) {
      return [] as Array<{ label: string; value: number; pct: number; tone: string }>;
    }
    const entries = Object.entries(inventoryQuery.data.by_source).map(([label, row]) => ({
      label,
      value: row.total_kg
    }));
    const max = Math.max(...entries.map((entry) => entry.value), 1);
    return entries.map((entry) => ({
      ...entry,
      pct: Math.max((entry.value / max) * 100, 4),
      tone: entry.label === "auction" ? "#4B3621" : "#6B8E23"
    }));
  }, [inventoryQuery.data]);

  const pieStyle = useMemo(() => {
    if (!inventoryQuery.data) {
      return { background: "#f3ead8" };
    }
    const total = sumBySource(inventoryQuery.data.by_source);
    if (total <= 0) {
      return { background: "#f3ead8" };
    }
    const auction = inventoryQuery.data.by_source.auction?.total_kg ?? 0;
    const auctionPct = Math.round((auction / total) * 100);
    return {
      background: `conic-gradient(#4B3621 0% ${auctionPct}%, #6B8E23 ${auctionPct}% 100%)`
    };
  }, [inventoryQuery.data]);

  const openContracts = contractsQuery.data?.data.length ?? 0;
  const riskCount = contractsQuery.data?.risk_alerts.length ?? 0;

  return (
    <>
      <Card
        title="Operational Snapshot"
        description="Instant visibility into stock health, sourcing mix, and contract delivery risk."
      >
        <ErrorAlert error={inventoryQuery.error ?? contractsQuery.error} />

        <div className="stat-grid">
          <div className="stat-card">
            <h4>Physical Stock</h4>
            <p>{inventoryQuery.data?.total_physical_stock_kg.toLocaleString() ?? "--"} kg</p>
          </div>
          <div className="stat-card">
            <h4>Allocated Stock</h4>
            <p>{inventoryQuery.data?.allocated_stock_kg.toLocaleString() ?? "--"} kg</p>
          </div>
          <div className="stat-card">
            <h4>Free to Sell</h4>
            <p>{inventoryQuery.data?.available_to_sell_kg.toLocaleString() ?? "--"} kg</p>
          </div>
        </div>

        <div className="grid two">
          <div className="card">
            <h3>Source Distribution</h3>
            <p>Auction vs direct sourcing by total weight.</p>
            <div className="pie-chart" style={pieStyle} />
            <div className="bar-chart">
              {sourceBars.map((row) => (
                <div className="bar-row" key={row.label}>
                  <span className="tag">{row.label}</span>
                  <div className="track">
                    <div className="fill" style={{ width: `${row.pct}%`, background: row.tone }} />
                  </div>
                  <span className="mono">{row.value.toLocaleString()} kg</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3>Contract Signals</h3>
            <p>Track fulfillment and unallocated commitments approaching shipment windows.</p>
            <div className="inline my-4">
              <span className="tag">Open contracts: {openContracts}</span>
              <span className={`tag ${riskCount > 0 ? "tag-status-risk" : "tag-status-good"}`}>
                Risk alerts: {riskCount}
              </span>
            </div>

            <div className="stack">
              {(contractsQuery.data?.risk_alerts ?? []).slice(0, 4).map((alert) => (
                <div className="alert error" key={`${alert.contract_number}-${alert.issue}`}>
                  <strong>{alert.contract_number}</strong>: {alert.issue} ({alert.unallocated_kg.toLocaleString()} kg pending, {alert.days_to_window_close} days left)
                </div>
              ))}
              {riskCount === 0 ? <div className="alert success">No immediate allocation risks.</div> : null}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
