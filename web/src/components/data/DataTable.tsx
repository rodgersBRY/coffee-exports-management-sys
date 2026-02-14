import { formatJson } from "@/lib/utils/format";

type Props = {
  rows: Array<Record<string, unknown>>;
};

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

function stringifyPrimitive(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "number") {
    return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(3);
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

  const columns = Object.keys(rows[0]);
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
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

                const primitiveValue = stringifyPrimitive(value);
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
