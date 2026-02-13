export function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function humanizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}
