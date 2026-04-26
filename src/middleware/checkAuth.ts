import { NextFunction, Request, Response } from "express-serve-static-core";
import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { MiddlewareFn } from "type-graphql";
import { Context } from "../types/Context";
import { JwtVerifyAccessToken, JwtVerifyRefreshToken } from "../utils/jwt";

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
          message:
            "The issuer on the token does not match the expected issuer",
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
        throw new GraphQLError("The JWT token has expired", {
          extensions: { code: "JWT_EXPIRED" },
        });
      case "invalid token":
        throw new GraphQLError(
          "The header or payload could not be parsed",
          { extensions: { code: "INVALID_TOKEN" } }
        );
      case "jwt malformed":
        throw new GraphQLError(
          "The token does not have three components (delimited by a .)",
          { extensions: { code: "JWT_MALFORMED" } }
        );
      case "jwt signature is required":
        throw new GraphQLError(
          "The token does not have a signature",
          { extensions: { code: "JWT_SIGNATURE_IS_REQUIRED" } }
        );
      case "invalid signature":
        throw new GraphQLError(
          "The signature on the token is invalid",
          { extensions: { code: "INVALID_SIGNATURE" } }
        );
      case "jwt audience invalid. expected: [OPTIONS AUDIENCE]":
        throw new GraphQLError(
          "The audience on the token does not match the expected audience",
          { extensions: { code: "JWT_AUDIENCE_INVALID" } }
        );
      case "jwt issuer invalid. expected: [OPTIONS ISSUER]":
        throw new GraphQLError(
          "The issuer on the token does not match the expected issuer",
          { extensions: { code: "JWT_ISSUER_INVALID" } }
        );
      case "jwt id invalid. expected: [OPTIONS JWT ID]":
        throw new GraphQLError(
          "The ID on the token does not match the expected ID",
          { extensions: { code: "JWT_ID_INVALID" } }
        );
      case "jwt subject invalid. expected: [OPTIONS SUBJECT]":
        throw new GraphQLError(
          "The subject on the token does not match the expected subject",
          { extensions: { code: "JWT_SUBJECT_INVALID" } }
        );
      default:
        throw new GraphQLError("An unknown error occurred!", {
          extensions: { code: "SERVER_ERROR" },
        });
    }
  }
  console.log(err.name);

  throw new GraphQLError("An unknown error occurred!", {
    extensions: { code: "SERVER_ERROR" },
  });
};

export const checkAccessToken: MiddlewareFn<Context> = async (
  { context },
  next
) => {
  const authHeader = context.req.header("Authorization");
  if (!authHeader) {
    throw new GraphQLError("Token is required", {
      extensions: { code: "TOKEN_REQUIRED" },
    });
  }
  const accessToken = authHeader.split(" ")[1];

  if (!accessToken) {
    throw new GraphQLError("Token is required", {
      extensions: { code: "TOKEN_REQUIRED" },
    });
  }

  const decodedUser = await JwtVerifyAccessToken(accessToken);

  if (decodedUser.error) {
    if (decodedUser.error.message === "jwt expired") {
      const refreshToken =
        context.req.cookies[process.env.REFRESH_TOKEN_COOKIE_NAME as string];
      if (!refreshToken) {
        throw new GraphQLError("Token is required", {
          extensions: { code: "REFRESH_TOKEN_REQUIRED" },
        });
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
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Access token required",
      });
    }
    const accessToken = authHeader.split(" ")[1];

    if (!accessToken) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Access token required",
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
    return next(new Error("Socket authentication error"));
  }

  const decodedUser = await JwtVerifyAccessToken(accessToken as string);
  if (decodedUser.error) {
    return next(new Error("Socket authentication error"));
  }

  req.user = decodedUser.data?.user;
  next();
};
