import { Field, InputType } from "type-graphql";

@InputType()
export class RegisterInput {
  @Field()
  username!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field()
  phone!: string;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field()
  fullName!: string;

  @Field()
  birthday!: string;

  @Field()
  sex!: boolean;

  @Field()
  avatar!: string;
}
