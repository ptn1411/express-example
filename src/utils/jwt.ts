import jwt from "jsonwebtoken";
import { DAY_TIME, REFRESH_TOKEN_COOKIE_NAME } from "../constants";
import { Response } from "express";
function JwtSignAccessToken(payload: string | Buffer | object, exp: number) {
  const secretAccess = process.env.ACCESS_TOKEN_PRIVATE_KEY;

  if (secretAccess !== undefined) {
    return jwt.sign(payload, secretAccess, {
      expiresIn: exp,
    });
  }
  return undefined;
}

function JwtVerifyAccessToken(token: string) {
  try {
    const secretAccess = process.env.ACCESS_TOKEN_PRIVATE_KEY;
    if (secretAccess) {
      const decode = jwt.verify(token, secretAccess);
      return decode
    }
    return undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

function JwtSignRefreshToken(payload: string | Buffer | object, exp: number) {
  const secretRefresh = process.env.REFRESH_TOKEN_PRIVATE_KEY;

  if (secretRefresh !== undefined) {
    return jwt.sign(payload, secretRefresh, {
      expiresIn: exp,
    });
  }
  return undefined;
}

function JwtVerifyRefreshToken(token: string) {
  try {
    const secretRefresh = process.env.REFRESH_TOKEN_PRIVATE_KEY;
    if (secretRefresh) {
      const decode = jwt.verify(token, secretRefresh);
      return decode 
    }
    return undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

function JwtGenerateTokens(payload: string | Buffer | object) {
  const accessToken = JwtSignAccessToken(payload, DAY_TIME); //1 ngay
  const refreshToken = JwtSignRefreshToken(payload, DAY_TIME * 30); //30 ngay
  if (accessToken && refreshToken) {
    return {
      refreshToken: refreshToken,
      accessToken: accessToken,
    };
  }
  return undefined;
}
function JwtSendRefreshToken(res: Response, payload: string | Buffer | object) {
  res.cookie(
    REFRESH_TOKEN_COOKIE_NAME,
    JwtSignRefreshToken(payload, DAY_TIME * 30),
    {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/refresh_token",
    }
  );
}

export {
  JwtSignAccessToken,
  JwtVerifyAccessToken,
  JwtSignRefreshToken,
  JwtVerifyRefreshToken,
  JwtGenerateTokens,
  JwtSendRefreshToken,
};
