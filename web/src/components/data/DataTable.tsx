import { formatJson } from "@/lib/utils/format";

type Props = {
  rows: Array<Record<string, unknown>>;
};

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
                const isObject = typeof value === "object" && value !== null;
                return (
                  <td key={`${index}-${column}`} className={isObject ? "mono" : undefined}>
                    {isObject ? formatJson(value) : String(value ?? "")}
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
