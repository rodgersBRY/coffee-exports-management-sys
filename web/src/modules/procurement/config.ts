import type { FieldConfig, FilterConfig } from "@/components/data/ResourcePanel";
import type { GuidedField } from "@/components/data/GuidedActionForm";

type SelectOption = {
  label: string;
  value: string;
};

export type ProcurementReferenceData = {
  suppliers: Array<{ id: number; name: string; supplier_type: string }>;
  marketing_agents: Array<{ id: number; name: string; supplier_type: string }>;
  warehouses: Array<{ id: number; name: string; location?: string | null }>;
  grades: Array<{ id: number; code: string; description?: string | null }>;
  bag_types: Array<{ id: number; name: string; weight_kg: string | number }>;
  direct_agreements: Array<{
    id: number;
    agreement_reference: string;
    crop_year: string;
    currency: string;
    supplier_name: string;
  }>;
};

function toOption(id: number, label: string): SelectOption {
  return { value: String(id), label };
}

type ProcurementFieldOptions = {
  suppliers: SelectOption[];
  marketingAgents: SelectOption[];
  warehouses: SelectOption[];
  grades: SelectOption[];
  bagTypes: SelectOption[];
  agreements: SelectOption[];
};

export function buildProcurementFieldOptions(data: ProcurementReferenceData): ProcurementFieldOptions {
  return {
    suppliers: data.suppliers.map((supplier) => toOption(supplier.id, supplier.name)),
    marketingAgents: data.marketing_agents.map((agent) => toOption(agent.id, agent.name)),
    warehouses: data.warehouses.map((warehouse) => toOption(warehouse.id, warehouse.name)),
    grades: data.grades.map((grade) => toOption(grade.id, grade.code)),
    bagTypes: data.bag_types.map((bagType) =>
      toOption(bagType.id, `${bagType.name} (${bagType.weight_kg}kg)`)
    ),
    agreements: data.direct_agreements.map((agreement) =>
      toOption(
        agreement.id,
        `${agreement.agreement_reference} - ${agreement.supplier_name} (${agreement.crop_year})`
      )
    )
  };
}

export function buildDirectAgreementFields(options: ProcurementFieldOptions): FieldConfig[] {
  return [
    {
      name: "supplier_id",
      label: "Direct supplier",
      type: "select",
      required: true,
      integer: true,
      options: options.suppliers
    },
    { name: "agreement_reference", label: "Agreement reference", type: "text", required: true },
    { name: "agreed_price_per_kg", label: "Agreed price per kg", type: "number", required: true },
    { name: "currency", label: "Currency", type: "text", required: true },
    { name: "crop_year", label: "Crop year", type: "text", required: true }
  ];
}

export function buildDirectAgreementFilters(options: ProcurementFieldOptions): FilterConfig[] {
  return [
    { name: "supplier_id", label: "Direct supplier", type: "select", options: options.suppliers },
    { name: "crop_year", label: "Crop year" },
    { name: "currency", label: "Currency" }
  ];
}

export function buildAuctionLotFields(options: ProcurementFieldOptions): GuidedField[] {
  return [
    { name: "lot_number", label: "Auction lot number", type: "text", required: true },
    {
      name: "marketing_agent_id",
      label: "Auction marketing agent / broker",
      type: "select",
      required: true,
      integer: true,
      options: options.marketingAgents
    },
    {
      name: "grade_id",
      label: "Grade",
      type: "select",
      required: true,
      integer: true,
      options: options.grades
    },
    {
      name: "warehouse_id",
      label: "Warehouse",
      type: "select",
      required: true,
      integer: true,
      options: options.warehouses
    },
    {
      name: "bag_type_id",
      label: "Bag type",
      type: "select",
      required: true,
      integer: true,
      options: options.bagTypes
    },
    { name: "crop_year", label: "Crop year", type: "text", required: true, placeholder: "2025/2026" },
    { name: "bags", label: "Bags", type: "number", required: true, integer: true },
    { name: "weight_total_kg", label: "Total weight (kg)", type: "number", required: true },
    { name: "purchase_price_per_kg", label: "Purchase price per kg", type: "number", required: true },
    { name: "auction_fees_total", label: "Auction fees total", type: "number" },
    { name: "catalog_document_path", label: "Catalog document reference", type: "text" }
  ];
}

export function buildDirectDeliveryFields(options: ProcurementFieldOptions): GuidedField[] {
  return [
    {
      name: "agreement_id",
      label: "Direct agreement",
      type: "select",
      required: true,
      integer: true,
      options: options.agreements
    },
    { name: "internal_lot_id", label: "Internal lot code", type: "text", required: true },
    { name: "delivery_reference", label: "Delivery reference", type: "text", required: true },
    { name: "grade_id", label: "Grade", type: "select", required: true, integer: true, options: options.grades },
    {
      name: "warehouse_id",
      label: "Warehouse",
      type: "select",
      required: true,
      integer: true,
      options: options.warehouses
    },
    {
      name: "bag_type_id",
      label: "Bag type",
      type: "select",
      required: true,
      integer: true,
      options: options.bagTypes
    },
    { name: "bags", label: "Bags", type: "number", required: true, integer: true },
    { name: "weight_total_kg", label: "Total weight (kg)", type: "number", required: true },
    { name: "moisture_percent", label: "Moisture %", type: "number", required: true },
    { name: "screen_size", label: "Screen size", type: "number", required: true },
    { name: "defects_percent", label: "Defects %", type: "number", required: true },
    { name: "processing_cost_total", label: "Processing cost total", type: "number" },
    { name: "transport_cost_total", label: "Transport cost total", type: "number" }
  ];
}
