import { MiddlewareFn } from "type-graphql";
import { Context } from "../types/Context";
import { AuthenticationError } from "apollo-server-core";
import { JwtVerifyAccessToken } from "../utils/jwt";
import { User } from "../entity/User";
import { NextFunction, Request, Response } from "express-serve-static-core";

export interface JwtPayload {
  user: User;
  iat: number;
  exp: number;
}

export const checkAuth: MiddlewareFn<Context> = (
  { context: { req } },
  next
) => {
  if (!req.session.userId) {
    throw new AuthenticationError(
      "Not authenticated to perform GraphQL operations"
    );
  }
  return next();
};

export const checkAccessToken: MiddlewareFn<Context> = ({ context }, next) => {
  const authHeader = context.req.header("Authorization");
  const accessToken = authHeader && authHeader.split(" ")[1];
  if (!accessToken)
    throw new AuthenticationError(
      "Not authenticated to perform GraphQL operations"
    );

  const decodedUser = JwtVerifyAccessToken(accessToken) as JwtPayload;
  if (!decodedUser)
    throw new AuthenticationError(
      "Not authenticated to perform GraphQL operations"
    );
  context.req.user = decodedUser.user;
  return next();
};

export const checkApiAuthAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header("Authorization");
    const accessToken = authHeader && authHeader.split(" ")[1];
    if (!accessToken) {
      res.json({
        code: 401,
        success: false,
        message: "error",
      });
    }

    const decodedUser = JwtVerifyAccessToken(
      accessToken as string
    ) as JwtPayload;
    if (decodedUser === undefined) {
      return res.json({
        code: 401,
        success: false,
        message: "error",
      });
    }
    console.log("decodedUser", decodedUser.user);

    req.user = decodedUser.user;
    return next();
  } catch (error) {
    return res.json({
      code: 401,
      success: false,
      message: "error",
    });
  }
};
