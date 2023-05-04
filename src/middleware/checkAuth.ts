import { MiddlewareFn } from "type-graphql";
import { Context } from "../types/Context";
import { ApolloError } from "apollo-server-core";
import { JwtVerifyAccessToken, JwtVerifyRefreshToken } from "../utils/jwt";
import { NextFunction, Request, Response } from "express-serve-static-core";
import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import jwt from "jsonwebtoken";

const { JsonWebTokenError } = jwt;

export const catchError = (err: any, res: Response) => {
  if (err instanceof JsonWebTokenError) {
    switch (err.message) {
      case "jwt expired":
        return res.status(401).send({ message: "The JWT token has expired" });
      case "invalid token":
        return res
          .status(400)
          .send({ message: "The header or payload could not be parsed" });
      case "jwt malformed":
        return res.status(400).send({
          message:
            "The token does not have three components (delimited by a .)",
        });
      case "jwt signature is required":
        return res.status(400).send({
          message: "The token does not have a signature",
        });
      case "invalid signature":
        return res.status(400).send({
          message: "The signature on the token is invalid",
        });
      case "jwt audience invalid. expected: [OPTIONS AUDIENCE]":
        return res.status(400).send({
          message:
            "The audience on the token does not match the expected audience",
        });
      case "jwt issuer invalid. expected: [OPTIONS ISSUER]":
        return res.status(400).send({
          message: "The issuer on the token does not match the expected issuer",
        });
      case "jwt id invalid. expected: [OPTIONS JWT ID]":
        return res.status(400).send({
          message: "The ID on the token does not match the expected ID",
        });
      case "jwt subject invalid. expected: [OPTIONS SUBJECT]":
        return res.status(400).send({
          message:
            "The subject on the token does not match the expected subject",
        });
      default:
        return res.status(400).send({ message: "An unknown error occurred!" });
    }
  }
  console.log(err.name);

  return res.status(500).send({ message: "server!" });
};

const catchApolloError = async (err: any) => {
  if (err instanceof JsonWebTokenError) {
    switch (err.message) {
      case "jwt expired":
        throw new ApolloError("The JWT token has expired", "JWT_EXPIRED");
      case "invalid token":
        throw new ApolloError(
          "The header or payload could not be parsed",
          "INVALID_TOKEN"
        );
      case "jwt malformed":
        throw new ApolloError(
          "The token does not have three components (delimited by a .)",
          "JWT_MALFORMED"
        );
      case "jwt signature is required":
        throw new ApolloError(
          "The token does not have a signature",
          "JWT_SIGNATURE_IS_REQUIRED"
        );
      case "invalid signature":
        throw new ApolloError(
          "The signature on the token is invalid",
          "INVALID_SIGNATURE"
        );
      case "jwt audience invalid. expected: [OPTIONS AUDIENCE]":
        throw new ApolloError(
          "The audience on the token does not match the expected audience",
          "JWT_AUDIENCE_INVALID"
        );
      case "jwt issuer invalid. expected: [OPTIONS ISSUER]":
        throw new ApolloError(
          "The issuer on the token does not match the expected issue",
          "JWT_ISSUER INVALID"
        );
      case "jwt id invalid. expected: [OPTIONS JWT ID]":
        throw new ApolloError(
          "The ID on the token does not match the expected ID",
          "JWT_ID_INVALID"
        );
      case "jwt subject invalid. expected: [OPTIONS SUBJECT]":
        throw new ApolloError(
          "The subject on the token does not match the expected subject",
          "JWT_SUBJECT_INVALID"
        );
      default:
        throw new ApolloError("An unknown error occurred!", "SERVER_ERROR");
    }
  }
  console.log(err.name);

  throw new ApolloError("An unknown error occurred!", "SERVER_ERROR");
};
export const checkAccessToken: MiddlewareFn<Context> = async (
  { context },
  next
) => {
  const authHeader = context.req.header("Authorization");
  if (!authHeader) {
    throw new ApolloError("Token is required", "TOKEN_REQUIRED");
  }
  const accessToken = authHeader.split(" ")[1];

  if (!accessToken) {
    throw new ApolloError("Token is required", "TOKEN_REQUIRED");
  }

  const decodedUser = await JwtVerifyAccessToken(accessToken);

  if (decodedUser.error) {
    if (decodedUser.error.message === "jwt expired") {
      const refreshToken =
        context.req.cookies[process.env.REFRESH_TOKEN_COOKIE_NAME as string];
      if (!refreshToken) {
        throw new ApolloError("Token is required", "REFRESH_TOKEN_REQUIRED");
      }
      const decodedRefreshToken = await JwtVerifyRefreshToken(refreshToken);
      if (decodedRefreshToken.error) {
        return catchApolloError(decodedRefreshToken.error);
      }
      context.req.user = decodedRefreshToken.data?.user;
      return next();
    }
    return catchApolloError(decodedUser.error);
  }
  context.req.user = decodedUser.data?.user;
  return next();
};

export const checkApiAuthAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Access token provided!",
      });
    }
    const accessToken = authHeader.split(" ")[1];

    if (!accessToken) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Access token provided!",
      });
    }
    const decodedUser = await JwtVerifyAccessToken(accessToken as string);
    if (decodedUser.error) {
      return catchError(decodedUser.error, res);
    }

    req.user = decodedUser.data?.user;
    return next();
  } catch (error) {
    return res.status(500).json({
      message: "Server",
    });
  }
};

export const socketMiddleware = async (
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

  const decodedUser = await JwtVerifyAccessToken(accessToken as string);
  if (decodedUser.error) {
    next(new Error("Socket authentication error"));
  }

  req.user = decodedUser.data?.user;
  next();
};
