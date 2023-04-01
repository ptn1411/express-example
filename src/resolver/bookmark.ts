import { Arg, Ctx, Query, Resolver } from "type-graphql";
import { Context } from "../types/Context";
import { AppDataSource } from "../data-source";
import { Bookmark } from "../entity/Bookmark";
import { BookmarkResponse } from "../types/BookmarkResponse";
import { User } from "../entity/User";
import { Post } from "../entity/Post";

@Resolver()
export class BookmarkResolver {
  @Query((_return) => BookmarkResponse)
  async createBookmark(
    @Ctx() { req }: Context,
    @Arg("postUuid") postUuid: string
  ): Promise<BookmarkResponse> {
    try {
      const id = req.session.userId;

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
      const checkBookmark = await Bookmark.findOne({
        where: {
          user: {
            id: user.id,
          },
          post: {
            uuid: postUuid,
          },
        },
      });
      if (checkBookmark) {
        return {
          code: 404,
          success: false,
          message: `error`,
        };
      }
      const postRepository = await AppDataSource.getRepository(Post);
      const post = await postRepository.findOne({
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
          uuid: postUuid,
        },
      });
      if (!post) {
        return {
          code: 404,
          success: false,
          message: `error`,
        };
      }
      const bookmark = await Bookmark.create();
      bookmark.user = user;
      bookmark.post = post;
      await AppDataSource.manager.save(bookmark);
      console.log(bookmark);

      return {
        code: 200,
        success: true,
        message: `success`,
        bookmarks: [bookmark],
      };
    } catch (error) {
      console.log(error);

      return {
        code: 500,
        success: false,
      };
    }
  }
  @Query((_return) => BookmarkResponse)
  async bookmarkAll(@Ctx() { req }: Context): Promise<BookmarkResponse> {
    try {
      const id = req.session.userId;

      if (!id) {
        return {
          code: 401,
          success: false,
          message: `error`,
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
      const bookmarks = await AppDataSource.getRepository(Bookmark).find({
        relations: {
          user: true,

          post: {
            user: true,
            likes: {
              user: true,
            },
            comments: {
              user: true,
            },
          },
        },
        where: {
          user: {
            id: user.id,
          },
        },
      });
      if (!bookmarks) {
        return {
          code: 404,
          success: false,
          message: `error`,
        };
      }
      return {
        code: 200,
        success: true,
        message: `success`,
        bookmarks: bookmarks,
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
