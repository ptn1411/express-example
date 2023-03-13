import { MiddlewareFn } from "type-graphql";
import { Context } from "../types/Context";
import { AuthenticationError } from "apollo-server-core";
import { JwtVerifyAccessToken } from "../utils/jwt";
import { User } from "../entity/User";

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

  const decodedUser = JwtVerifyAccessToken<User>(accessToken);
  if (!decodedUser)
    throw new AuthenticationError(
      "Not authenticated to perform GraphQL operations"
    );
  context.user = decodedUser;
  return next();
};
