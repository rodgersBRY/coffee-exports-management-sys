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

export function InventoryDashboardPanel(): React.JSX.Element {
  const query = useQuery({
    queryKey: ["inventory-dashboard"],
    queryFn: () => apiClient<InventoryDashboard>("inventory/dashboard")
  });

  const sourceBars = useMemo(() => {
    if (!query.data) {
      return [] as Array<{ label: string; value: number; pct: number; tone: string }>;
    }
    const entries = Object.entries(query.data.by_source).map(([label, row]) => ({
      label,
      value: row.total_kg
    }));
    const max = Math.max(...entries.map((entry) => entry.value), 1);
    return entries.map((entry) => ({
      ...entry,
      pct: Math.max((entry.value / max) * 100, 4),
      tone: entry.label === "auction" ? "#4B3621" : "#6B8E23"
    }));
  }, [query.data]);

  return (
    <Card title="Inventory Dashboard" description="Real-time lot-level stock visibility and source composition.">
      <ErrorAlert error={query.error} />
      {query.isLoading ? <div className="alert info">Loading dashboard...</div> : null}
      {query.data ? (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <h4>Total Physical</h4>
              <p>{query.data.total_physical_stock_kg.toLocaleString()} kg</p>
            </div>
            <div className="stat-card">
              <h4>Allocated</h4>
              <p>{query.data.allocated_stock_kg.toLocaleString()} kg</p>
            </div>
            <div className="stat-card">
              <h4>Available to Sell</h4>
              <p>{query.data.available_to_sell_kg.toLocaleString()} kg</p>
            </div>
          </div>

          <div className="grid two">
            <div className="card">
              <h3>Source Mix</h3>
              <div className="bar-chart">
                {sourceBars.map((row) => (
                  <div className="bar-row" key={row.label}>
                    <span className={`tag ${row.label === "auction" ? "tag-source-auction" : "tag-source-direct"}`}>
                      {row.label}
                    </span>
                    <div className="track">
                      <div className="fill" style={{ width: `${row.pct}%`, background: row.tone }} />
                    </div>
                    <span className="mono">{row.value.toLocaleString()} kg</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3>Grade Breakdown</h3>
              <div className="bar-chart">
                {Object.entries(query.data.by_grade).map(([grade, row]) => (
                  <div className="bar-row" key={grade}>
                    <span className="tag">{grade}</span>
                    <div className="track">
                      <div
                        className="fill"
                        style={{
                          width: `${Math.min((row.available_kg / Math.max(row.total_kg, 1)) * 100, 100)}%`,
                          background: "#6B8E23"
                        }}
                      />
                    </div>
                    <span className="mono">{row.available_kg.toLocaleString()} / {row.total_kg.toLocaleString()} kg</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </Card>
  );
}
