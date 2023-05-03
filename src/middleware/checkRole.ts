import { NextFunction, Request, Response } from "express";
import { Role } from "../constants";
import { MiddlewareFn } from "type-graphql";
import { Context } from "../types/Context";
import { ApolloError } from "apollo-server-core";
export const checkRole = (filter: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (filter.includes(req.user?.role as Role)) {
      return next();
    }
    return res.json({
      code: 403,
      success: false,
      message: "error",
    });
  };
};
export const checkRoleAdminGraphql: MiddlewareFn<Context> = async (
  { context },
  next
) => {
  if (context.req.user?.role === Role.ADMIN) {
    return next();
  }
  throw new ApolloError("UnauthorizedError", "NOT_ADMIN");
};
