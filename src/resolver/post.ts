import { Arg,Mutation, Resolver } from "type-graphql";
import { PostMutationResponse } from "../types/PostMutationResponse";
import { CreatePostInput } from "../types/CreatePostInput";

@Resolver()
export class PostResolver {
  @Mutation((_return) => PostMutationResponse)
  async createPost(
    @Arg("createPost") { title, text }: CreatePostInput
  ): Promise<PostMutationResponse> {
    try {
      console.log(title, text);
      return {
        code: 500,
        success: false,
        message: `post`,
      };
    } catch (error) {
      console.log(title, text);
      return {
        code: 500,
        success: false,
        message: `server ${error}`,
      };
    }
  }
}
