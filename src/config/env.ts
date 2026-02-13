import dotenv from "dotenv";

dotenv.config();

const port = Number(process.env.PORT ?? 4000);
const databaseUrl = process.env.DATABASE_URL;
const nodeEnv = process.env.NODE_ENV ?? "development";
const requestBodyLimit = process.env.REQUEST_BODY_LIMIT ?? "1mb";
const corsAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000);
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX ?? 120);
const authRateLimitMax = Number(process.env.AUTH_RATE_LIMIT_MAX ?? 15);
const idempotencyRequireKey = process.env.IDEMPOTENCY_REQUIRE_KEY !== "false";
const idempotencyTtlSeconds = Number(process.env.IDEMPOTENCY_TTL_SECONDS ?? 86400);
const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
const jwtAccessTtl = process.env.JWT_ACCESS_TTL ?? "15m";
const jwtRefreshTtl = process.env.JWT_REFRESH_TTL ?? "7d";
const dataEncryptionKey = process.env.DATA_ENCRYPTION_KEY;
const csrfSecret = process.env.CSRF_SECRET;
const dbSslMode = process.env.DB_SSL_MODE ?? (nodeEnv === "production" ? "require" : "disable");
const dbSslRejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false";
const dbSslCaPath = process.env.DB_SSL_CA_PATH;
const logLevel = process.env.LOG_LEVEL ?? "info";
const trustProxyRaw = process.env.TRUST_PROXY ?? "true";
const trustProxy =
  trustProxyRaw === "true"
    ? true
    : trustProxyRaw === "false"
      ? false
      : trustProxyRaw;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}
if (!jwtAccessSecret || jwtAccessSecret.length < 32) {
  throw new Error("JWT_ACCESS_SECRET is required and must be at least 32 characters");
}
if (!jwtRefreshSecret || jwtRefreshSecret.length < 32) {
  throw new Error("JWT_REFRESH_SECRET is required and must be at least 32 characters");
}
if (!dataEncryptionKey) {
  throw new Error("DATA_ENCRYPTION_KEY is required (base64 32-byte key)");
}
if (!csrfSecret || csrfSecret.length < 32) {
  throw new Error("CSRF_SECRET is required and must be at least 32 characters");
}
if (dbSslMode !== "disable" && dbSslMode !== "require") {
  throw new Error("DB_SSL_MODE must be either 'disable' or 'require'");
}
if (nodeEnv === "production" && dbSslMode !== "require") {
  throw new Error("DB_SSL_MODE must be 'require' in production");
}
if (Number.isNaN(port) || port <= 0) {
  throw new Error("PORT must be a valid number");
}
if (Number.isNaN(rateLimitWindowMs) || Number.isNaN(rateLimitMax) || Number.isNaN(authRateLimitMax)) {
  throw new Error("Rate limit env values must be valid numbers");
}
if (Number.isNaN(idempotencyTtlSeconds) || idempotencyTtlSeconds <= 0) {
  throw new Error("IDEMPOTENCY_TTL_SECONDS must be a positive number");
}

export const env = {
  port,
  nodeEnv,
  databaseUrl,
  requestBodyLimit,
  corsAllowedOrigins,
  rateLimitWindowMs,
  rateLimitMax,
  authRateLimitMax,
  idempotencyRequireKey,
  idempotencyTtlSeconds,
  jwtAccessSecret,
  jwtRefreshSecret,
  jwtAccessTtl,
  jwtRefreshTtl,
  dataEncryptionKey,
  csrfSecret,
  dbSslMode,
  dbSslRejectUnauthorized,
  dbSslCaPath,
  logLevel,
  trustProxy,
};
