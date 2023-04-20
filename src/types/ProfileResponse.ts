import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "./MutationResponse";

import { FieldError } from "./FieldError";
import { ProfileUser } from "../entity/Profile-user";

@ObjectType({ implements: IMutationResponse })
export class ProfileResponse implements IMutationResponse {
  code!: number;
  success!: boolean;
  message?: string;

  @Field({ nullable: true })
  profile?: ProfileUser;

  @Field((_type) => [FieldError], { nullable: true })
  errors?: FieldError[];
}
