import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class IUser {
  @Field()
  fullName!: string;

  @Field()
  username!: string;

  @Field()
  avatar!: string;
}
