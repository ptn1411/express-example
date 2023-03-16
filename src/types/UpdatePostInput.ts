import { Field, InputType } from "type-graphql";

@InputType()
export class UpdatePostInput {
  @Field()
  uuid!: string;

  @Field()
  content!: string;
}
