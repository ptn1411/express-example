import { Field, InputType } from "type-graphql";
import { MaxLength, MinLength } from "class-validator";

@InputType()
export class UpdatePostInput {
  @Field()
  uuid!: string;

  @Field()
  @MinLength(1, { message: "Post content cannot be empty" })
  @MaxLength(5000, { message: "Post content cannot exceed 5000 characters" })
  content!: string;

  @Field((_type) => [String], { nullable: true })
  images!: string[];
}
