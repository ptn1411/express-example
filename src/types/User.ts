import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class IUser {
  @Field()
  id!: string;

  @Field()
  fullName!: string;

  @Field()
  username!: string;

  @Field()
  avatar!: string;
}
export type User_Status_Email = "new" | "pending" | "confirmed" | "expired ";
