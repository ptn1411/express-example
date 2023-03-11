import {
  Arg,
  Mutation,
  Resolver,
  Query,
  ID,
  UseMiddleware,
} from "type-graphql";
import { PostMutationResponse } from "../types/PostMutationResponse";
import { CreatePostInput } from "../types/CreatePostInput";
import { Post } from "../entity/Post";
import { UpdatePostInput } from "../types/UpdatePostInput";
import { checkAuth } from "../middleware/checkAuth";

@Resolver()
export class PostResolver {
  @Mutation((_return) => PostMutationResponse)
  async createPost(
    @Arg("createPostInput") { title, text }: CreatePostInput
  ): Promise<PostMutationResponse> {
    try {
      const newPost = await Post.create({
        title,
        text,
      });
      await Post.save(newPost);
      return {
        code: 200,
        success: true,
        message: `ok`,
        post: newPost,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `server ${error}`,
      };
    }
  }
  @Query((_return) => [Post], { nullable: true })
  async posts(): Promise<Post[] | null> {
    try {
      return await Post.find();
    } catch (error) {
      return null;
    }
  }
  @Query((_return) => Post, { nullable: true })
  async post(@Arg("id", (_type) => ID) id: number): Promise<Post | null> {
    try {
      return await Post.findOneBy({ id });
    } catch (error) {
      return null;
    }
  }
  @Mutation((_return) => PostMutationResponse)
  async updatePost(
    @Arg("updatePostInput") { id, title, text }: UpdatePostInput
  ): Promise<PostMutationResponse> {
    try {
      const existingPost = await Post.findOne({
        where: {
          id,
        },
      });
      if (!existingPost) {
        return {
          code: 400,
          success: false,
          message: ` not ok`,
        };
      }
      existingPost.title = title;
      existingPost.text = text;
      await existingPost.save();
      return {
        code: 200,
        success: true,
        message: `ok`,
        post: existingPost,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `server ${error}`,
      };
    }
  }
  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async deletePost(
    @Arg("id", (_type) => ID) id: number
  ): Promise<PostMutationResponse> {
    try {
      const existingPost = await Post.findOne({
        where: {
          id,
        },
      });
      if (!existingPost) {
        return {
          code: 400,
          success: false,
          message: `khong co data`,
        };
      }
      await Post.delete({ id });
      return {
        code: 200,
        success: true,
        message: `ok`,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `server ${error}`,
      };
    }
  }
}
