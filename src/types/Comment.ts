import { Field, ObjectType } from "type-graphql";
import { IUser } from "./User";
import { ILike } from "./Like";
@ObjectType()
export class IComment {
  @Field()
  id!: number;

  @Field()
  content!: string;

  @Field()
  user!: IUser;

  @Field((_type) => [ILike], { nullable: true })
  likes?: ILike[];

  @Field((_type) => [IComment], { nullable: true })
  comments?: IComment[];
}
