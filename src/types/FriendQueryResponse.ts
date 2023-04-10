import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "./MutationResponse";

import { FieldError } from "./FieldError";
import { Friends } from "../entity/Friends";
import { User } from "../entity/User";

@ObjectType({ implements: IMutationResponse })
export class FriendQueryResponse implements IMutationResponse {
  code!: number;
  success!: boolean;
  message?: string;

  @Field((_type) => [Friends], { nullable: true })
  friends?: Friends[];

  @Field((_type) => [User], { nullable: true })
  users?: User[];

  @Field((_type) => [FieldError], { nullable: true })
  errors?: FieldError[];
}
