import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "./MutationResponse";
import { IPost } from "./Post";
import { FieldError } from "./FieldError";

@ObjectType({ implements: IMutationResponse })
export class PostsQueryResponse implements IMutationResponse {
  code!: number;
  success!: boolean;
  message?: string;

  @Field((_type) => [IPost], { nullable: true })
  posts?: IPost[];

  @Field({ nullable: true })
  page?: number;

  @Field({ nullable: true })
  limit?: number;

  @Field((_type) => [FieldError], { nullable: true })
  errors?: FieldError[];
}
