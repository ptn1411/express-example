import { Ctx, Query, Resolver, UseMiddleware } from "type-graphql";

import { Context } from "../types/Context";
import { checkAccessToken } from "../middleware/checkAuth";
@Resolver()
export class HelloResolver {
  @UseMiddleware(checkAccessToken)
  @Query((_returns) => String)
  hello(@Ctx() { req }: Context) {
    return "Hello word " + req.user?.id;
  }
}
