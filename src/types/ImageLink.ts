import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class ImageLink {
  @Field()
  link!: string;

  @Field()
  alt?: string;
}
