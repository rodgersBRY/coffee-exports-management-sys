import { NextFunction, Request, Response } from "express";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

function sanitizeString(input: string): string {
  return input.replace(/\0/g, "").replace(/[\u0000-\u001F\u007F]/g, "").trim();
}

function sanitizeValue(value: unknown): JsonValue {
  if (typeof value === "string") {
    return sanitizeString(value);
  }
  if (typeof value === "number" || typeof value === "boolean" || value === null) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }
  if (typeof value === "object" && value !== null) {
    const result: { [key: string]: JsonValue } = {};
    for (const [key, raw] of Object.entries(value)) {
      if (key.startsWith("$")) {
        continue;
      }
      const sanitizedKey = sanitizeString(key);
      result[sanitizedKey] = sanitizeValue(raw);
    }
    return result;
  }
  return String(value);
}

export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query) as Request["query"];
  req.params = sanitizeValue(req.params) as Request["params"];
  next();
}
