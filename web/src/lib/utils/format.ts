export function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

const DATE_COLUMN_TOKEN = /(?:^|_)(at|date|on|departure|window|expires|received|login)(?:_|$)/;

function isValidDate(date: Date): boolean {
  return Number.isFinite(date.getTime());
}

function isDateOnlyString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isLikelyDateColumn(column: string): boolean {
  return DATE_COLUMN_TOKEN.test(column.toLowerCase());
}

export function formatDateForDisplay(value: unknown): string | undefined {
  if (typeof value !== "string" && typeof value !== "number" && !(value instanceof Date)) {
    return undefined;
  }

  if (typeof value === "string" && value.trim().length === 0) {
    return undefined;
  }

  if (typeof value === "string" && isDateOnlyString(value)) {
    const date = new Date(`${value}T00:00:00`);
    if (!isValidDate(date)) {
      return undefined;
    }
    return new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (!isValidDate(parsed)) {
    return undefined;
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function humanizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}
