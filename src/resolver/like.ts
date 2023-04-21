import {
  Arg,
  Ctx,
  Query,
  Mutation,
  Resolver,
  UseMiddleware,
} from "type-graphql";

import { Context } from "../types/Context";

import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import { Like } from "../entity/Like";

import { REACTIONS_TYPE } from "../constants";
import { Post } from "../entity/Post";
import { LikeResponse } from "../types/LikeResponse";
import { Comment } from "../entity/Comment";
import { checkAccessToken } from "../middleware/checkAuth";

@Resolver()
export class LikeResolver {
  @UseMiddleware(checkAccessToken)
  @Mutation((_return) => LikeResponse)
  async likePost(
    @Arg("typeReact") typeReact: string,
    @Arg("postUuid") postUuid: string,

    @Ctx() { req }: Context
  ): Promise<LikeResponse> {
    const id = req.user?.id;
    if (!REACTIONS_TYPE.includes(typeReact)) {
      return {
        code: 404,
        success: false,
        message: `sai react`,
      };
    }

    const user = await User.findOneBy({
      id: id,
    });
    if (!user) {
      return {
        code: 401,
        success: false,
        message: `error`,
      };
    }

    const post = await Post.findOneBy({
      uuid: postUuid,
    });
    if (!post) {
      return {
        code: 404,
        success: false,
        message: `error`,
      };
    }

    const like = await AppDataSource.getRepository(Like)
      .createQueryBuilder("like")
      .leftJoinAndSelect("like.user", "user")
      .where("like.userId = :userId", { userId: user.id })
      .andWhere("like.postUuid = :postUuid", { postUuid: post.uuid })
      .getOne();

    if (like) {
      if (like.reactions === typeReact) {
        return {
          code: 200,
          success: true,
          like: like,
        };
      }
      like.reactions = typeReact;
      await AppDataSource.manager.save(like);
      return {
        code: 200,
        success: true,
        like: like,
      };
    }

    const existingLike = await Like.create({
      reactions: typeReact,
    });
    existingLike.user = user;
    existingLike.post = post;
    await AppDataSource.manager.save(existingLike);
    return {
      code: 200,
      success: true,
      like: existingLike,
    };
  }
  @UseMiddleware(checkAccessToken)
  @Mutation((_return) => LikeResponse)
  async likeComment(
    @Arg("typeReact") typeReact: string,
    @Arg("commentId") commentId: number,

    @Ctx() { req }: Context
  ): Promise<LikeResponse> {
    const id = req.user?.id;
    if (!REACTIONS_TYPE.includes(typeReact)) {
      return {
        code: 404,
        success: false,
        message: `sai react`,
      };
    }
    const user = await User.findOneBy({
      id: id,
    });
    if (!user) {
      return {
        code: 401,
        success: false,
        message: `error`,
      };
    }
    const comment = await Comment.findOneBy({
      id: commentId,
    });
    if (!comment) {
      return {
        code: 404,
        success: false,
        message: `error`,
      };
    }
    const like = await AppDataSource.getRepository(Like)
      .createQueryBuilder("like")
      .leftJoinAndSelect("like.user", "user")
      .where("like.userId = :userId ", { userId: user.id })
      .andWhere("like.commentId = :commentId", { commentId: commentId })
      .getOne();
    if (like) {
      if (like.reactions === typeReact) {
        return {
          code: 200,
          success: true,
          like: like,
        };
      }
      like.reactions = typeReact;
      await AppDataSource.manager.save(like);
      return {
        code: 200,
        success: true,
        like: like,
      };
    }
    const existingLike = await Like.create({
      reactions: typeReact,
    });
    existingLike.user = user;
    existingLike.comment = comment;
    await AppDataSource.manager.save(existingLike);
    return {
      code: 200,
      success: true,
      like: existingLike,
    };
  }

  @Query((_return) => LikeResponse)
  async getLikeComment(
    @Arg("commentId") commentId: number
  ): Promise<LikeResponse> {
    try {
      const likeRepository = await AppDataSource.getRepository(Like);
      const likes = await likeRepository
        .createQueryBuilder("like")
        .leftJoinAndSelect("like.user", "user")
        .where("like.commentId = :commentId", { commentId: commentId })
        .getMany();

      if (!likes) {
        return {
          code: 404,
          success: false,
          message: `error`,
        };
      }
      console.log(likes);

      return {
        code: 200,
        success: true,
        likes: likes,
      };
    } catch (error) {
      console.log(error);

      return {
        code: 500,
        success: false,
      };
    }
  }
  @Query((_return) => LikeResponse)
  async getLikePost(@Arg("postUuid") postUuid: string): Promise<LikeResponse> {
    try {
      const likeRepository = await AppDataSource.getRepository(Like);
      const likes = await likeRepository
        .createQueryBuilder("like")
        .leftJoinAndSelect("like.user", "user")
        .where("like.postUuid = :postUuid", { postUuid: postUuid })
        .getMany();

      if (!likes) {
        return {
          code: 404,
          success: false,
          message: `error`,
        };
      }
      return {
        code: 200,
        success: true,
        likes: likes,
      };
    } catch (error) {
      console.log(error);

      return {
        code: 500,
        success: false,
      };
    }
  }
}
