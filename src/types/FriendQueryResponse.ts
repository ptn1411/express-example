import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "./MutationResponse";

import { FieldError } from "./FieldError";
import { Friends } from "../entity/Friends";

@ObjectType({ implements: IMutationResponse })
export class FriendQueryResponse implements IMutationResponse {
  code!: number;
  success!: boolean;
  message?: string;

  @Field((_type) => [Friends], { nullable: true })
  friends?: Friends[];

  @Field((_type) => [FieldError], { nullable: true })
  errors?: FieldError[];
}
