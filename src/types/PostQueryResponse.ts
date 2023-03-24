import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "./MutationResponse";
import { IPost } from "./Post";
import { FieldError } from "./FieldError";

@ObjectType({ implements: IMutationResponse })
export class PostQueryResponse implements IMutationResponse {
  code!: number;
  success!: boolean;
  message?: string;

  @Field({ nullable: true })
  post?: IPost;

  @Field((_type) => [IPost], { nullable: true })
  posts?: IPost[];

  @Field((_type) => [FieldError], { nullable: true })
  errors?: FieldError[];
}
