import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "./MutationResponse";
import { User } from "../entity/User";
import { FieldError } from "./FieldError";

@ObjectType({ implements: IMutationResponse })
export class UserMutationResponse implements IMutationResponse {
  code!: number;
  success!: boolean;
  message?: string;

  @Field({ nullable: true })
  user?: User;

  @Field({ nullable: true })
  accessToken?: string;

  @Field({ nullable: true })
  refreshToken?: string;

  @Field((_type) => [FieldError], { nullable: true })
  errors?: FieldError[];
}
