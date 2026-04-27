import jwt, { VerifyErrors } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { DAY_TIME } from "../constants";
import { User } from "../entity/User";

interface FunSign {
  data: string | null;
  error: Error | null;
}
interface FunGenerateTokens {
  refreshToken: string | null;
  accessToken: string | null;
  jti: string | null;
  error: Error | null;
}
interface JwtPayloadUser {
  user: User;
  jti: string;
  iat: number;
  exp: number;
}
interface FunExperienceResult {
  data: JwtPayloadUser | null;
  error: VerifyErrors | null;
}

function JwtSignAccessToken(
  payload: string | Buffer | object,
  exp: number
): Promise<FunSign> {
  try {
    const secretAccess = process.env.ACCESS_TOKEN_PRIVATE_KEY as string;
    const token = jwt.sign(payload, secretAccess, { expiresIn: exp });
    return Promise.resolve({ data: token, error: null });
  } catch (error: any) {
    return Promise.resolve({ data: null, error });
  }
}

function JwtVerifyAccessToken(token: string): Promise<FunExperienceResult> {
  const secretAccess = process.env.ACCESS_TOKEN_PRIVATE_KEY as string;
  try {
    const decode = jwt.verify(token, secretAccess);
    return Promise.resolve({ data: decode as JwtPayloadUser, error: null });
  } catch (error: any) {
    return Promise.resolve({ data: null, error });
  }
}

function JwtSignRefreshToken(
  payload: string | Buffer | object,
  exp: number
): Promise<FunSign> {
  const secretRefresh = process.env.REFRESH_TOKEN_PRIVATE_KEY as string;
  try {
    const token = jwt.sign(payload, secretRefresh, { expiresIn: exp });
    return Promise.resolve({ data: token, error: null });
  } catch (error: any) {
    return Promise.resolve({ data: null, error });
  }
}

function JwtVerifyRefreshToken(token: string): Promise<FunExperienceResult> {
  try {
    const secretRefresh = process.env.REFRESH_TOKEN_PRIVATE_KEY as string;
    const decode = jwt.verify(token, secretRefresh);
    return Promise.resolve({ data: decode as JwtPayloadUser, error: null });
  } catch (error: any) {
    return Promise.resolve({ data: null, error });
  }
}

async function JwtGenerateTokens(
  payload: object,
  options?: { rememberMe?: boolean }
): Promise<FunGenerateTokens> {
  try {
    const jti = uuidv4();
    // rememberMe = true  → refresh token 30 days
    // rememberMe = false → refresh token 1 day (session-like)
    const refreshTtl = options?.rememberMe ? DAY_TIME * 30 : DAY_TIME;

    const accessToken = await JwtSignAccessToken({ ...payload, jti }, DAY_TIME);
    const refreshToken = await JwtSignRefreshToken({ ...payload, jti }, refreshTtl);

    if (accessToken.error || refreshToken.error) {
      return { refreshToken: null, accessToken: null, jti: null, error: accessToken.error || refreshToken.error };
    }
    return { refreshToken: refreshToken.data, accessToken: accessToken.data, jti, error: null };
  } catch (error: any) {
    return { refreshToken: null, accessToken: null, jti: null, error };
  }
}

export {
  JwtSignAccessToken,
  JwtVerifyAccessToken,
  JwtSignRefreshToken,
  JwtVerifyRefreshToken,
  JwtGenerateTokens,
};
