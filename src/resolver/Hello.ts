import { Ctx, Query, Resolver } from "type-graphql";

import { Context } from "../types/Context";
@Resolver()
export class HelloResolver {
  @Query((_returns) => String)
  hello(@Ctx() { req }: Context) {
    return "Hello word " + req.user?.id;
  }
}
