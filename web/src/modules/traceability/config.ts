import type { GuidedField } from "@/components/data/GuidedActionForm";

type SelectOption = {
  label: string;
  value: string;
};

export type TraceabilityReferenceData = {
  lots: Array<{ id: number; lot_code: string; source: string; status: string; crop_year: string }>;
};

type TraceabilityFieldOptions = {
  lots: SelectOption[];
};

function toOption(id: number, label: string): SelectOption {
  return { value: String(id), label };
}

export function buildTraceabilityFieldOptions(data: TraceabilityReferenceData): TraceabilityFieldOptions {
  return {
    lots: data.lots.map((lot) =>
      toOption(lot.id, `${lot.lot_code} (${lot.source}, ${lot.crop_year}, ${lot.status})`)
    )
  };
}

export function buildLotLookupFields(options: TraceabilityFieldOptions): GuidedField[] {
  return [
    {
      name: "lot_id",
      label: "Lot",
      type: "search-select",
      required: true,
      integer: true,
      options: options.lots
    }
  ];
}
