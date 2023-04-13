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

import { PostQueryResponse } from "../types/PostQueryResponse";
import { getPostsFromFriend } from "../services/post";

@Resolver()
export class PostResolver {
  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async createPost(
    @Arg("createPostInput") { content, images }: CreatePostInput,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    try {
      if (content.length === 0) {
        return {
          code: 404,
          success: false,
          message: `khong co noi dung`,
        };
      }
      const uuid = uuidv4();
      const newPost = await Post.create({
        content,
        images,
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
  @Query((_return) => PostQueryResponse)
  async posts(@Ctx() { req }: Context): Promise<PostQueryResponse> {
    try {
      // const postRepository = await AppDataSource.getRepository(Post);
      // const posts = await postRepository.find({
      //   relations: {
      //     user: true,
      //     likes: {
      //       user: true,
      //     },
      //     comments: {
      //       user: true,
      //     },
      //   },
      //   order: {
      //     createAt: "DESC",
      //   },
      // });
      // .createQueryBuilder("post")

      // .leftJoinAndSelect("post.user", "user")

      // .leftJoinAndSelect("post.likes", "like")

      // .leftJoinAndSelect("post.comments", "comment")

      // .getMany();
      const posts = await getPostsFromFriend(req.session.userId);
      if (!posts) {
        return {
          code: 404,
          success: false,
          message: `error`,
        };
        0;
      }

      return {
        code: 200,
        success: true,
        posts: posts,
      };
    } catch (error) {
      console.log(error);

      return {
        code: 500,
        success: false,
        message: `error`,
      };
    }
  }
  @Query((_return) => PostQueryResponse, { nullable: true })
  @UseMiddleware(checkAuth)
  async getPostsUserByUserName(
    @Arg("username") username: string
  ): Promise<PostQueryResponse> {
    try {
      const user = await User.findOneBy({
        username: username,
      });
      if (!user) {
        return {
          code: 404,
          success: false,
          message: `error`,
        };
      }

      const postRepository = await AppDataSource.getRepository(Post);
      const posts = await postRepository.find({
        relations: {
          user: true,
          likes: {
            user: true,
          },
          comments: {
            user: true,
          },
        },
        order: {
          createAt: "DESC",
        },
        where: {
          user: {
            id: user.id,
          },
        },
      });
      if (!posts) {
        return {
          code: 404,
          success: false,
          message: `error`,
        };
      }
      return {
        code: 200,
        success: true,
        posts: posts,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `error`,
      };
    }
  }
  @Query((_return) => PostQueryResponse, { nullable: true })
  @UseMiddleware(checkAuth)
  async post(@Arg("uuid") uuid: string): Promise<PostQueryResponse> {
    try {
      const postRepository = await AppDataSource.getRepository(Post);
      const post = await postRepository
        .createQueryBuilder("post")
        .leftJoinAndSelect("post.user", "user")
        .leftJoinAndSelect("post.likes", "like")
        .leftJoinAndSelect("post.comments", "comment")
        .where("post.uuid = :uuid", { uuid: uuid })

        .getOne();
      if (!post) {
        return {
          code: 404,
          success: false,
          message: `error`,
        };
      }
      console.log(post);

      return {
        code: 200,
        success: true,
        post: post,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `error`,
      };
    }
  }

  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async updatePost(
    @Arg("updatePostInput") { uuid, content, images }: UpdatePostInput
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
      existingPost.images = images;

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
