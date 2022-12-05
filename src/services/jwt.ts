import jwt from "jsonwebtoken";

export interface TypeUserToken {
  name: string;
  email: string;
  user_id: number;
  photo: string;
  role: string[];
}

function JwtSignAccessToken(payload: { [key: string]: any }, exp: number) {
  const secretAccess = process.env.ACCESS_TOKEN_PRIVATE_KEY;

  if (secretAccess !== undefined) {
    return jwt.sign(payload, secretAccess, {
      expiresIn: exp,
    });
  }
  return undefined;
}

function JwtVerifyAccessToken<T>(token: string) {
  try {
    const secretAccess = process.env.ACCESS_TOKEN_PRIVATE_KEY;
    if (secretAccess) {
      const decode = jwt.verify(token, secretAccess);
      return decode as T;
    }
    return undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

function JwtSignRefreshToken(payload: { [key: string]: any }, exp: number) {
  const secretRefresh = process.env.REFRESH_TOKEN_PRIVATE_KEY;

  if (secretRefresh !== undefined) {
    return jwt.sign(payload, secretRefresh, {
      expiresIn: exp,
    });
  }
  return undefined;
}

function JwtGenerateTokens(payload: { [key: string]: any }) {
  const accessToken = JwtSignAccessToken(payload, 86400);
  const refreshToken = JwtSignRefreshToken(payload, 2592000);
  if (accessToken && refreshToken) {
    return {
      refreshToken: refreshToken,
      accessToken: accessToken,
    };
  }
  return undefined;
}

export {
  JwtSignAccessToken,
  JwtVerifyAccessToken,
  JwtSignRefreshToken,
  JwtGenerateTokens,
};
