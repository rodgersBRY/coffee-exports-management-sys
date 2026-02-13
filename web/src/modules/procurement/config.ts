import type { FieldConfig, FilterConfig } from "@/components/data/ResourcePanel";
import type { GuidedField } from "@/components/data/GuidedActionForm";

export const directAgreementFields: FieldConfig[] = [
  { name: "supplier_id", label: "Supplier ID", type: "number", required: true, integer: true },
  { name: "agreement_reference", label: "Agreement reference", type: "text", required: true },
  { name: "agreed_price_per_kg", label: "Agreed price per kg", type: "number", required: true },
  { name: "currency", label: "Currency", type: "text", required: true },
  { name: "crop_year", label: "Crop year", type: "text", required: true }
];

export const directAgreementFilters: FilterConfig[] = [
  { name: "supplier_id", label: "Supplier ID" },
  { name: "crop_year", label: "Crop year" },
  { name: "currency", label: "Currency" }
];

export const auctionLotFields: GuidedField[] = [
  { name: "lot_number", label: "Auction lot number", type: "text", required: true },
  { name: "marketing_agent_id", label: "Marketing agent ID", type: "number", required: true, integer: true },
  { name: "grade_id", label: "Grade ID", type: "number", required: true, integer: true },
  { name: "warehouse_id", label: "Warehouse ID", type: "number", required: true, integer: true },
  { name: "bag_type_id", label: "Bag type ID", type: "number", required: true, integer: true },
  { name: "crop_year", label: "Crop year", type: "text", required: true, placeholder: "2025/2026" },
  { name: "bags", label: "Bags", type: "number", required: true, integer: true },
  { name: "weight_total_kg", label: "Total weight (kg)", type: "number", required: true },
  { name: "purchase_price_per_kg", label: "Purchase price per kg", type: "number", required: true },
  { name: "auction_fees_total", label: "Auction fees total", type: "number" },
  { name: "catalog_document_path", label: "Catalog document reference", type: "text" }
];

export const directDeliveryFields: GuidedField[] = [
  { name: "agreement_id", label: "Agreement ID", type: "number", required: true, integer: true },
  { name: "internal_lot_id", label: "Internal lot code", type: "text", required: true },
  { name: "delivery_reference", label: "Delivery reference", type: "text", required: true },
  { name: "grade_id", label: "Grade ID", type: "number", required: true, integer: true },
  { name: "warehouse_id", label: "Warehouse ID", type: "number", required: true, integer: true },
  { name: "bag_type_id", label: "Bag type ID", type: "number", required: true, integer: true },
  { name: "bags", label: "Bags", type: "number", required: true, integer: true },
  { name: "weight_total_kg", label: "Total weight (kg)", type: "number", required: true },
  { name: "moisture_percent", label: "Moisture %", type: "number", required: true },
  { name: "screen_size", label: "Screen size", type: "number", required: true },
  { name: "defects_percent", label: "Defects %", type: "number", required: true },
  { name: "processing_cost_total", label: "Processing cost total", type: "number" },
  { name: "transport_cost_total", label: "Transport cost total", type: "number" }
];
