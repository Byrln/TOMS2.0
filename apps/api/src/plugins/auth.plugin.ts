import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { ApiError } from "../shared/errors/api-error";

export interface VerifiedAccessToken {
  userId: string;
  claims: JWTPayload & { email?: string; role?: string; aal?: string };
  token: string;
}

export type VerifyAccessToken = (authorization: string | null) => Promise<VerifiedAccessToken>;

export interface JwtVerifierConfig {
  jwksUrl: string;
  issuer: string;
  audience: string;
}

export function createJwtVerifier(config: JwtVerifierConfig): VerifyAccessToken {
  const jwks = createRemoteJWKSet(new URL(config.jwksUrl));

  return async (authorization) => {
    const token = bearerToken(authorization);
    try {
      const { payload } = await jwtVerify(token, jwks, {
        issuer: config.issuer,
        audience: config.audience,
      });
      if (!payload.sub) throw new ApiError(401, "AUTH_REQUIRED", "The access token has no subject");
      return { userId: payload.sub, claims: payload, token };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(401, "AUTH_REQUIRED", "The access token is invalid or expired");
    }
  };
}

export function bearerToken(authorization: string | null): string {
  if (!authorization?.startsWith("Bearer ")) {
    throw new ApiError(401, "AUTH_REQUIRED", "Authentication is required");
  }
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) throw new ApiError(401, "AUTH_REQUIRED", "Authentication is required");
  return token;
}
