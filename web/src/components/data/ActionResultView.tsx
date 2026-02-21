"use client";

import { DataTable } from "@/components/data/DataTable";

type Props = {
  value: unknown;
};

function toTitleCase(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isObjectArray(value: unknown): value is Array<Record<string, unknown>> {
  return Array.isArray(value) && value.every((item) => isRecord(item));
}

function isPrimitive(value: unknown): boolean {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}

function isPrimitiveArray(value: unknown): value is Array<string | number | boolean | null> {
  return Array.isArray(value) && value.every((item) => isPrimitive(item));
}

function isPaginated(value: unknown): value is { data: unknown[]; meta: Record<string, unknown> } {
  return isRecord(value) && Array.isArray(value.data) && isRecord(value.meta);
}

function renderPrimitive(value: unknown): string {
  if (value === null || value === undefined) {
    return "-";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value);
}

function renderKeyValueCard(value: Record<string, unknown>): React.JSX.Element {
  const scalarEntries = Object.entries(value).filter(([, entry]) => isPrimitive(entry));
  const nestedEntries = Object.entries(value).filter(([, entry]) => !isPrimitive(entry));

  return (
    <div className="stack">
      {scalarEntries.length > 0 ? (
        <dl className="result-grid">
          {scalarEntries.map(([key, entry]) => (
            <div key={key}>
              <dt>{toTitleCase(key)}</dt>
              <dd>{renderPrimitive(entry)}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {nestedEntries.length > 0 ? (
        <div className="stack">
          {nestedEntries.map(([key, entry]) => (
            <details key={key} className="collapsible">
              <summary>{toTitleCase(key)}</summary>
              <div className="content">
                {renderFriendlyValue(entry)}
              </div>
            </details>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function renderFriendlyValue(value: unknown): React.JSX.Element {
  if (isObjectArray(value)) {
    return <DataTable rows={value} />;
  }

  if (isRecord(value)) {
    return renderKeyValueCard(value);
  }

  if (isPrimitiveArray(value)) {
    return (
      <div className="inline">
        {value.map((entry, index) => (
          <span key={`${index}-${String(entry)}`} className="tag">
            {renderPrimitive(entry)}
          </span>
        ))}
      </div>
    );
  }

  if (Array.isArray(value)) {
    return <div className="alert info">Items: {value.length}</div>;
  }

  return <div className="alert info">{renderPrimitive(value)}</div>;
}

export function ActionResultView({ value }: Props): React.JSX.Element {
  return (
    <div className="stack">
      <strong>Result</strong>

      {isPaginated(value) ? (
        <div className="stack">
          <div className="inline">
            <span className="tag">Rows: {value.data.length}</span>
            {"total" in value.meta ? <span className="tag">Total: {renderPrimitive(value.meta.total)}</span> : null}
            {"page" in value.meta ? <span className="tag">Page: {renderPrimitive(value.meta.page)}</span> : null}
          </div>
          {isObjectArray(value.data) ? (
            <DataTable rows={value.data} />
          ) : (
            renderFriendlyValue(value.data)
          )}
        </div>
      ) : (
        renderFriendlyValue(value)
      )}
    </div>
  );
}
