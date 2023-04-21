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
import { Post } from "../entity/Post";
import { Comment } from "../entity/Comment";
import { CommentResponse } from "../types/CommentResponse";
import { checkAccessToken } from "../middleware/checkAuth";

@Resolver()
export class CommentResolver {
  @UseMiddleware(checkAccessToken)
  @Mutation((_return) => CommentResponse)
  async commentPost(
    @Arg("content") content: string,
    @Arg("postUuid") postUuid: string,

    @Ctx() { req }: Context
  ): Promise<CommentResponse> {
    try {
      const id = req.user?.id;
      if (content.length <= 1) {
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

      const existingComment = await Comment.create({
        content: content,
      });

      existingComment.user = user;
      existingComment.post = post;
      await AppDataSource.manager.save(existingComment);
      const postComments = await AppDataSource.getRepository(Comment).find({
        where: {
          post: {
            uuid: post.uuid,
          },
        },
        relations: {
          user: true,
          likes: {
            user: true,
          },
          comments: {
            user: true,
          },
        },
      });
      return {
        code: 200,
        success: true,
        comment: existingComment,
        comments: postComments,
      };
    } catch (error) {
      console.log(error);

      return {
        code: 500,
        success: false,
      };
    }
  }
  @UseMiddleware(checkAccessToken)
  @Mutation((_return) => CommentResponse)
  async commentComment(
    @Arg("content") content: string,
    @Arg("commentId") commentId: number,

    @Ctx() { req }: Context
  ): Promise<CommentResponse> {
    try {
      const id = req.user?.id;
      if (content.length > 0) {
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

      const existingComment = await Comment.create({
        content: content,
      });

      existingComment.user = user;
      existingComment.comment = comment;
      await AppDataSource.manager.save(existingComment);
      return {
        code: 200,
        success: true,
        comment: existingComment,
      };
    } catch (error) {
      console.log(error);

      return {
        code: 500,
        success: false,
      };
    }
  }
  @Query((_return) => CommentResponse)
  async getCommentPost(
    @Arg("postUuid") postUuid: string
  ): Promise<CommentResponse> {
    try {
      const commentRepository = await AppDataSource.getRepository(Comment);
      const comment = await commentRepository
        .createQueryBuilder("comment")
        .leftJoinAndSelect("comment.user", "user")
        .leftJoinAndSelect("comment.like", "like")
        .leftJoinAndSelect("comment.comment", "comment")
        .where("comment.postUuid = :postUuid", { postUuid: postUuid })
        .getMany();

      if (!comment) {
        return {
          code: 404,
          success: false,
          message: `error`,
        };
      }
      return {
        code: 200,
        success: true,
        comments: comment,
      };
    } catch (error) {
      console.log(error);

      return {
        code: 500,
        success: false,
      };
    }
  }
  @Query((_return) => CommentResponse)
  async getCommentComment(
    @Arg("commentId") commentId: number
  ): Promise<CommentResponse> {
    try {
      const commentRepository = await AppDataSource.getRepository(Comment);
      const comment = await commentRepository
        .createQueryBuilder("comment")
        .leftJoinAndSelect("comment.user", "user")
        .leftJoinAndSelect("comment.like", "like")
        .leftJoinAndSelect("comment.comment", "comment")
        .where("comment.commentId = :commentId", { commentId: commentId })
        .getMany();

      if (!comment) {
        return {
          code: 404,
          success: false,
          message: `error`,
        };
      }
      return {
        code: 200,
        success: true,
        comments: comment,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
      };
    }
  }
}
