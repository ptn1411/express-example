import { Field, ObjectType } from "type-graphql";
import { ILike } from "./Like";
import { IComment } from "./Comment";
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

  @Field((_type) => [ILike], { nullable: true })
  likes!: ILike[];

  @Field((_type) => [IComment], { nullable: true })
  comments!: IComment[];
}
