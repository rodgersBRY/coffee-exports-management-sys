"use client";

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

  return (
    <Card title="Inventory Dashboard" description="Real-time stock visibility from lots table.">
      <ErrorAlert error={query.error} />
      {query.isLoading ? <div className="alert info">Loading dashboard...</div> : null}
      {query.data ? (
        <>
          <div className="inline">
            <span className="tag">Total: {query.data.total_physical_stock_kg} kg</span>
            <span className="tag">Allocated: {query.data.allocated_stock_kg} kg</span>
            <span className="tag">Available: {query.data.available_to_sell_kg} kg</span>
          </div>
          <label>
            By source
            <textarea className="mono" rows={5} readOnly value={JSON.stringify(query.data.by_source, null, 2)} />
          </label>
          <label>
            By grade
            <textarea className="mono" rows={8} readOnly value={JSON.stringify(query.data.by_grade, null, 2)} />
          </label>
        </>
      ) : null}
    </Card>
  );
}
