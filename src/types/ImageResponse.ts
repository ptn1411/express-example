import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "./MutationResponse";

import { FieldError } from "./FieldError";
import { ImageLink } from "./ImageLink";

@ObjectType({ implements: IMutationResponse })
export class ImageResponse implements IMutationResponse {
  code!: number;
  success!: boolean;
  message?: string;

  @Field((_type) => [ImageLink], { nullable: true })
  images?: ImageLink[];

  @Field({ nullable: true })
  start?: number;

  @Field({ nullable: true })
  limit?: number;

  @Field((_type) => [FieldError], { nullable: true })
  errors?: FieldError[];
}
