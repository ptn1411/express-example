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
import { checkAccessToken } from "../middleware/checkAuth";
import { Context } from "../types/Context";
import { AppDataSource } from "../data-source";
import { v4 as uuidv4 } from "uuid";
import { User } from "../entity/User";

import { PostQueryResponse } from "../types/PostQueryResponse";
import { getPostsFromFriend } from "../services/post";
import { PostsQueryResponse } from "../types/PostsQueryResponse";

@Resolver()
export class PostResolver {
  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAccessToken)
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
        shares: 0,
      });

      if (!req.user?.id) {
        return {
          code: 401,
          success: false,
          message: `error`,
        };
      }
      const user = await User.findOneBy({
        id: req.user.id,
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
  @UseMiddleware(checkAccessToken)
  @Query((_return) => PostsQueryResponse)
  async posts(
    @Ctx() { req }: Context,
    @Arg("page") page: number,
    @Arg("limit") limit: number
  ): Promise<PostsQueryResponse> {
    try {
      //const postRepository = await AppDataSource.getRepository(Post)
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

      if (!req.user?.id) {
        return {
          code: 401,
          success: false,
          message: `error`,
        };
      }
      const posts = await getPostsFromFriend(req.user?.id, page, limit);

      return {
        code: 200,
        success: true,
        posts: posts,
        page: page,
        limit: limit,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `error`,
      };
    }
  }
  @Query((_return) => PostsQueryResponse, { nullable: true })
  @UseMiddleware(checkAccessToken)
  async getPostsUserByUserName(
    @Arg("username") username: string,
    @Arg("page") page: number,
    @Arg("limit") limit: number
  ): Promise<PostsQueryResponse> {
    try {
      const user = await User.findOneBy({
        username: username,
      });
      page = page || 1;
      limit = limit || 10;
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
        where: {
          user: {
            id: user.id,
          },
        },
        take: limit,
        skip: (page - 1) * limit,
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
        page: page,
        limit: limit,
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
  async post(@Arg("uuid") uuid: string): Promise<PostQueryResponse> {
    try {
      const postRepository = await AppDataSource.getRepository(Post);
      const post = await postRepository.findOne({
        relations: {
          user: true,
          likes: {
            user: true,
          },
          comments: {
            user: true,
            likes: {
              user: true,
            },
          },
        },
        where: {
          uuid: uuid,
        },
      });
      // .createQueryBuilder("post")
      // .leftJoinAndSelect("post.user", "user")
      // .leftJoinAndSelect("post.likes", "like")
      // .leftJoinAndSelect("post.comments", "comment")
      // .where("post.uuid = :uuid", { uuid: uuid })
      //.getOne();
      if (!post) {
        return {
          code: 404,
          success: false,
          message: `error`,
        };
      }

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
  @UseMiddleware(checkAccessToken)
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
  @UseMiddleware(checkAccessToken)
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
  @Query((_return) => [String])
  async getAllPostIds(): Promise<string[]> {
    const posts = await Post.find({
      select: {
        uuid: true,
      },
      take: 20,
    });
    return posts.map((post) => post.uuid);
  }
}
