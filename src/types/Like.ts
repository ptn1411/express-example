import { Field, ObjectType } from "type-graphql";
import { IUser } from "./User";

@ObjectType()
export class ILike {
  @Field()
  id!: number;

  @Field()
  reactions!: string;

  @Field()
  user!: IUser;
}
