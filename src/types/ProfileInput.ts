import { Field, InputType } from "type-graphql";

@InputType()
export class ProfileInput {
  @Field()
  city!: string;

  @Field()
  education!: string;

  @Field()
  from!: string;

  @Field()
  relationship!: string;

  @Field()
  workplace!: string;
}
