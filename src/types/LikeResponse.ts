import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "./MutationResponse";

import { FieldError } from "./FieldError";
import { ILike } from "./Like";

@ObjectType({ implements: IMutationResponse })
export class LikeResponse implements IMutationResponse {
  code!: number;
  success!: boolean;
  message?: string;

  @Field({ nullable: true })
  like?: ILike;

  @Field((_type) => [ILike], { nullable: true })
  likes?: ILike[];

  @Field((_type) => [FieldError], { nullable: true })
  errors?: FieldError[];
}
