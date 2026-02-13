import jwt, { JwtPayload } from "jsonwebtoken";

import { env } from "../../config/env.js";
import { ApiError } from "../errors/ApiError.js";

type TokenKind = "access" | "refresh";

type BaseClaims = {
  sub: string;
  role: string;
  kind: TokenKind;
  sessionId: string;
};

export type AccessTokenClaims = BaseClaims & {
  kind: "access";
};

export type RefreshTokenClaims = BaseClaims & {
  kind: "refresh";
};

export function signAccessToken(payload: {
  userId: number;
  role: string;
  sessionId: string;
}): string {
  return jwt.sign(
    {
      sub: String(payload.userId),
      role: payload.role,
      kind: "access",
      sessionId: payload.sessionId,
    } satisfies AccessTokenClaims,
    env.jwtAccessSecret,
    {
      expiresIn: env.jwtAccessTtl,
      issuer: "ceoms-api",
      audience: "ceoms-clients",
    },
  );
}

export function signRefreshToken(payload: {
  userId: number;
  role: string;
  sessionId: string;
}): string {
  return jwt.sign(
    {
      sub: String(payload.userId),
      role: payload.role,
      kind: "refresh",
      sessionId: payload.sessionId,
    } satisfies RefreshTokenClaims,
    env.jwtRefreshSecret,
    {
      expiresIn: env.jwtRefreshTtl,
      issuer: "ceoms-api",
      audience: "ceoms-clients",
    },
  );
}

function assertClaims(payload: string | JwtPayload | undefined): asserts payload is JwtPayload {
  if (!payload || typeof payload === "string") {
    throw new ApiError(401, "Invalid token payload");
  }
}

export function verifyAccessToken(token: string): AccessTokenClaims {
  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret, {
      issuer: "ceoms-api",
      audience: "ceoms-clients",
    });
    assertClaims(decoded);
    if (decoded.kind !== "access") {
      throw new ApiError(401, "Invalid access token type");
    }
    if (typeof decoded.sub !== "string" || typeof decoded.role !== "string") {
      throw new ApiError(401, "Invalid access token claims");
    }
    if (typeof decoded.sessionId !== "string") {
      throw new ApiError(401, "Invalid access token session");
    }
    return decoded as AccessTokenClaims;
  } catch {
    throw new ApiError(401, "Invalid or expired access token");
  }
}

export function verifyRefreshToken(token: string): RefreshTokenClaims {
  try {
    const decoded = jwt.verify(token, env.jwtRefreshSecret, {
      issuer: "ceoms-api",
      audience: "ceoms-clients",
    });
    assertClaims(decoded);
    if (decoded.kind !== "refresh") {
      throw new ApiError(401, "Invalid refresh token type");
    }
    if (typeof decoded.sub !== "string" || typeof decoded.role !== "string") {
      throw new ApiError(401, "Invalid refresh token claims");
    }
    if (typeof decoded.sessionId !== "string") {
      throw new ApiError(401, "Invalid refresh token session");
    }
    return decoded as RefreshTokenClaims;
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
}
