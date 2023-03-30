import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "./MutationResponse";

import { FieldError } from "./FieldError";
import { IBookmark } from "./Bookmark";

@ObjectType({ implements: IMutationResponse })
export class BookmarkResponse implements IMutationResponse {
  code!: number;
  success!: boolean;
  message?: string;

  @Field((_type) => [IBookmark], { nullable: true })
  bookmarks?: IBookmark[];

  @Field((_type) => [FieldError], { nullable: true })
  errors?: FieldError[];
}
