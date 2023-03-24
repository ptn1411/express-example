import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "./MutationResponse";

import { FieldError } from "./FieldError";

import { IComment } from "./Comment";

@ObjectType({ implements: IMutationResponse })
export class CommentResponse implements IMutationResponse {
  code!: number;
  success!: boolean;
  message?: string;

  @Field({ nullable: true })
  comment?: IComment;

  @Field((_type) => [IComment], { nullable: true })
  comments?: IComment[];

  @Field((_type) => [FieldError], { nullable: true })
  errors?: FieldError[];
}
