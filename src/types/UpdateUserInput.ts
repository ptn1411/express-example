import { Field, InputType } from "type-graphql";

@InputType()
export class UpdateUserInput {
  @Field()
  avatar!: string;

  @Field()
  coverImage!: string;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field()
  fullName!: string;
}
