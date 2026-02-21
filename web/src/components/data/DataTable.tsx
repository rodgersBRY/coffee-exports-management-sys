import { formatDateForDisplay, formatJson, isLikelyDateColumn } from "@/lib/utils/format";

type Props = {
  rows: Array<Record<string, unknown>>;
};

function toTitleCase(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function displayColumnName(column: string): string {
  if (column.endsWith("_name")) {
    return toTitleCase(column.slice(0, -5));
  }
  if (column.endsWith("_code")) {
    return toTitleCase(column.slice(0, -5));
  }
  return toTitleCase(column);
}

function shouldDisplayColumn(column: string, allColumns: string[]): boolean {
  if (column.endsWith("_id")) {
    const base = column.slice(0, -3);
    if (
      allColumns.includes(base) ||
      allColumns.includes(`${base}_name`) ||
      allColumns.includes(`${base}_code`)
    ) {
      return false;
    }
  }

  if (column.endsWith("_name")) {
    const base = column.slice(0, -5);
    if (allColumns.includes(base)) {
      return false;
    }
  }

  if (column.endsWith("_code")) {
    const base = column.slice(0, -5);
    if (allColumns.includes(base)) {
      return false;
    }
  }

  return true;
}

function isNumericColumn(column: string): boolean {
  return (
    column.endsWith("_kg") ||
    column.endsWith("_percent") ||
    column.includes("price") ||
    column.includes("amount") ||
    column.includes("count") ||
    column.includes("weight")
  );
}

function isCurrencyColumn(column: string): boolean {
  if (column.includes("percent") || column.endsWith("_kg") || column.includes("weight")) {
    return false;
  }

  return (
    column.includes("price") ||
    column.includes("amount") ||
    column.includes("cost") ||
    column.includes("revenue") ||
    column.includes("value") ||
    column.includes("fees") ||
    column.includes("commission") ||
    column.includes("margin")
  );
}

function toRoundedDisplay(value: number): string {
  return Math.round(value).toLocaleString();
}

function renderTag(column: string, value: string): React.JSX.Element | null {
  if (column === "source") {
    const tone = value === "auction" ? "tag-source-auction" : value === "direct" ? "tag-source-direct" : "";
    return <span className={`tag ${tone}`}>{value}</span>;
  }

  if (column === "status") {
    const riskStatuses = new Set(["closed", "cancelled", "overdue"]);
    const tone = riskStatuses.has(value) ? "tag-status-risk" : "tag-status-good";
    return <span className={`tag ${tone}`}>{value}</span>;
  }

  return null;
}

function stringifyPrimitive(column: string, value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (isLikelyDateColumn(column)) {
    const formatted = formatDateForDisplay(value);
    if (formatted) {
      return formatted;
    }
  }

  if (typeof value === "string") {
    const formatted = formatDateForDisplay(value);
    if (formatted) {
      return formatted;
    }
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    if (isCurrencyColumn(column) || isNumericColumn(column)) {
      return toRoundedDisplay(value);
    }
    return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(3);
  }

  if (typeof value === "string") {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && (isCurrencyColumn(column) || isNumericColumn(column))) {
      return toRoundedDisplay(numeric);
    }
    return value;
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return String(value);
}

export function DataTable({ rows }: Props): React.JSX.Element {
  if (rows.length === 0) {
    return <div className="alert info">No rows returned.</div>;
  }

  const allColumns = Object.keys(rows[0]);
  const columns = allColumns.filter((column) => shouldDisplayColumn(column, allColumns));
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{displayColumnName(column)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => {
                const value = row[column];
                if (typeof value === "object" && value !== null) {
                  return (
                    <td key={`${index}-${column}`} className="mono cell-json">
                      {formatJson(value)}
                    </td>
                  );
                }

                const primitiveValue = stringifyPrimitive(column, value);
                const tagged = renderTag(column, primitiveValue);
                return (
                  <td
                    key={`${index}-${column}`}
                    className={isNumericColumn(column) ? "num mono" : undefined}
                  >
                    {tagged ?? primitiveValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
