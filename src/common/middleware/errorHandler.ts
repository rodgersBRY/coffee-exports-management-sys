import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { ApiError } from "../errors/ApiError.js";

type PgError = {
  code?: string;
  detail?: string;
};

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      issues: error.issues,
    });
  }
  if (error instanceof ApiError) {
    return res.status(error.status).json({
      message: error.message,
    });
  }

  const pgError = error as PgError;
  if (pgError?.code === "23505") {
    return res.status(409).json({
      message: "Duplicate record",
      detail: pgError.detail ?? null,
    });
  }
  if (pgError?.code === "23503") {
    return res.status(409).json({
      message: "Invalid reference",
      detail: pgError.detail ?? null,
    });
  }

  console.error(error);
  return res.status(500).json({
    message: "Internal server error",
  });
}
