import type { FieldConfig, FilterConfig } from "@/components/data/ResourcePanel";

export const directAgreementFields: FieldConfig[] = [
  { name: "supplier_id", label: "Supplier ID", type: "number", required: true, integer: true },
  { name: "agreement_reference", label: "Agreement reference", type: "text", required: true },
  { name: "agreed_price_per_kg", label: "Agreed price per kg", type: "number", required: true },
  { name: "currency", label: "Currency", type: "text", required: true },
  { name: "crop_year", label: "Crop year", type: "text", required: true }
];

export const directAgreementFilters: FilterConfig[] = [
  { name: "supplier_id", label: "Filter supplier_id" },
  { name: "crop_year", label: "Filter crop_year" },
  { name: "currency", label: "Filter currency" }
];

export const auctionLotSample = {
  lot_number: "AUC-LOT-001",
  marketing_agent_id: 1,
  grade_id: 1,
  warehouse_id: 1,
  bag_type_id: 1,
  crop_year: "2025/2026",
  bags: 200,
  weight_total_kg: 12000,
  purchase_price_per_kg: 5.45,
  auction_fees_total: 250,
  catalog_document_path: "/docs/auction-2026/catalog-1.pdf"
};

export const directDeliverySample = {
  agreement_id: 1,
  internal_lot_id: "DIR-LOT-001",
  delivery_reference: "DEL-REF-001",
  grade_id: 1,
  warehouse_id: 1,
  bag_type_id: 1,
  bags: 100,
  weight_total_kg: 6000,
  moisture_percent: 11.2,
  screen_size: 16.5,
  defects_percent: 1.1,
  processing_cost_total: 80,
  transport_cost_total: 120
};
