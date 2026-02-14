"use client";

import { useMemo, useState } from "react";

import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

export type SearchableOption = {
  label: string;
  value: string;
};

type Props = {
  value: string;
  options: SearchableOption[];
  onChange: (nextValue: string) => void;
  disabled?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  minSearchOptions?: number;
};

export function SearchableSelectControl({
  value,
  options,
  onChange,
  disabled = false,
  placeholder = "Select...",
  searchPlaceholder = "Type to filter options...",
  minSearchOptions = 8,
}: Props): React.JSX.Element {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const filteredOptions = useMemo(() => {
    const normalized = debouncedSearch.trim().toLowerCase();
    if (!normalized) {
      return options;
    }

    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(normalized) ||
        option.value.toLowerCase().includes(normalized),
    );
  }, [debouncedSearch, options]);

  const shouldShowSearch = options.length >= minSearchOptions;

  return (
    <div className="search-select-control">
      {shouldShowSearch ? (
        <input
          type="text"
          value={search}
          disabled={disabled}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={searchPlaceholder}
        />
      ) : null}

      <select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder}</option>
        {filteredOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
