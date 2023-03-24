import { Field, ObjectType } from "type-graphql";
import { Like } from "../entity/Like";
import { Comment } from "../entity/Comment";
import { IUser } from "./User";

@ObjectType()
export class IPost {
  @Field()
  uuid!: string;

  @Field()
  content!: string;

  @Field()
  shares!: number;

  @Field((_type) => [String], { nullable: true })
  images?: string[];

  @Field()
  createAt!: Date;

  @Field()
  updateAt!: Date;

  @Field()
  user!: IUser;

  @Field((_type) => [Like], { nullable: true })
  likes!: Like[];

  @Field((_type) => [Comment], { nullable: true })
  comments!: Comment[];
}
