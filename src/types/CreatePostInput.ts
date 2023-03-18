import { Field, InputType } from "type-graphql";

@InputType()
export class CreatePostInput {
  @Field()
  content!: string;

  @Field((_type) => [String], { nullable: true })
  images!: string[];
}
