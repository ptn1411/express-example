import { Field, ObjectType } from "type-graphql";
import { IUser } from "./User";
import { IPost } from "./Post";

@ObjectType()
export class IBookmark {
  @Field()
  id!: number;

  @Field()
  post!: IPost;

  @Field()
  user!: IUser;

  @Field()
  createAt!: Date;
}
