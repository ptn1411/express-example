import { MiddlewareFn } from "type-graphql";
import { Context } from "../types/Context";
import { AuthenticationError } from "apollo-server-core";
import { JwtVerifyAccessToken } from "../utils/jwt";
import { User } from "../entity/User";
import { NextFunction, Request, Response } from "express-serve-static-core";
import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export interface JwtPayload {
  user: User;
  iat: number;
  exp: number;
}

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

export const socketMiddleware = (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  next: {
    (err?: ExtendedError | undefined): void;
    (arg0: Error | undefined): void;
  }
) => {
  let req = socket.request as Request;
  const accessToken = socket.handshake.auth.token;
  if (!accessToken) {
    next(new Error("Socket authentication error"));
  }

  const decodedUser = JwtVerifyAccessToken(accessToken as string) as JwtPayload;
  if (decodedUser === undefined) {
    next(new Error("Socket authentication error"));
  }

  req.user = decodedUser.user;
  next();
};
