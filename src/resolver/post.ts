import {
  Arg,
  Mutation,
  Resolver,
  Query,
  UseMiddleware,
  Ctx,
} from "type-graphql";
import { PostMutationResponse } from "../types/PostMutationResponse";
import { CreatePostInput } from "../types/CreatePostInput";
import { Post } from "../entity/Post";
import { UpdatePostInput } from "../types/UpdatePostInput";
import { checkAuth } from "../middleware/checkAuth";
import { Context } from "../types/Context";
import { AppDataSource } from "../data-source";
import { v4 as uuidv4 } from "uuid";
import { User } from "../entity/User";
@Resolver()
export class PostResolver {
  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async createPost(
    @Arg("createPostInput") { content }: CreatePostInput,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    try {
      const uuid = uuidv4();
      const newPost = await Post.create({
        content,
        uuid,
      });

      if (!req.session.userId) {
        return {
          code: 401,
          success: false,
          message: `error`,
        };
      }
      const user = await User.findOneBy({
        id: req.session.userId,
      });
      if (!user) {
        return {
          code: 401,
          success: false,
          message: `error`,
        };
      }
      newPost.user = user;
      await AppDataSource.manager.save(newPost);

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
  @UseMiddleware(checkAuth)
  async posts(@Ctx() { req }: Context): Promise<Post[] | null> {
    try {
      if (!req.session.userId) {
        return null;
      }
      const id = req.session.userId;
      // const postRepository = await AppDataSource.getRepository(Post);
      // const posts = await postRepository
      //   .createQueryBuilder("post")
      //   .where("post.userId = :id", { id: id })
      //   .getMany();
      const posts = await AppDataSource.createQueryBuilder()
        .relation(User, "posts")
        .of(id)
        .loadMany();
      return posts;
    } catch (error) {
      return null;
    }
  }
  @Query((_return) => Post, { nullable: true })
  @UseMiddleware(checkAuth)
  async post(
    @Arg("uuid") uuid: string,
    @Ctx() { req }: Context
  ): Promise<Post | null> {
    try {
      if (!req.session.userId) {
        return null;
      }
      const id = req.session.userId;
      const postRepository = await AppDataSource.getRepository(Post);
      const post = await postRepository
        .createQueryBuilder("post")
        .where("post.userId = :id", { id: id })
        .where("post.uuid = :uuid", { uuid: uuid })
        .getOne();
      return post;
    } catch (error) {
      return null;
    }
  }

  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async updatePost(
    @Arg("updatePostInput") { uuid, content }: UpdatePostInput
  ): Promise<PostMutationResponse> {
    try {
      const existingPost = await Post.findOne({
        where: {
          uuid,
        },
      });
      if (!existingPost) {
        return {
          code: 400,
          success: false,
          message: ` not ok`,
        };
      }
      existingPost.content = content;

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
  async deletePost(@Arg("uuid") uuid: string): Promise<PostMutationResponse> {
    try {
      const existingPost = await Post.findOne({
        where: {
          uuid,
        },
      });
      if (!existingPost) {
        return {
          code: 400,
          success: false,
          message: `khong co data`,
        };
      }
      await Post.delete({ uuid });
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
