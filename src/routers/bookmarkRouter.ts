import { Request, Response, Router } from "express";
import { checkApiAuthAccessToken } from "../middleware/checkAuth";
import { Bookmark } from "../entity/Bookmark";
import { AppDataSource } from "../data-source";
const router = Router();

router.get(
  "/all",
  checkApiAuthAccessToken,
  async (req: Request, res: Response) => {
    const existingBookmarks = await AppDataSource.getRepository(Bookmark).find({
      relations: {
        post: true,
      },
      select: {
        post: {
          uuid: true,
        },
      },
      where: {
        user: {
          id: req.session.userId,
        },
      },
    });

    if (!existingBookmarks) {
      return res.json({
        status: false,
        code: 404,
        message: "not bookmark",
      });
    }
    const result = existingBookmarks.map((bookmark) => {
      return bookmark.post.uuid;
    });
    return res.json({
      status: true,
      code: 200,
      bookmarkedPostsId: result,
    });
  }
);
router.get(
  "/post/:uuid",
  checkApiAuthAccessToken,
  async (req: Request, res: Response) => {
    const uuid = req.params.uuid;
    if (!uuid) {
      return res.json({
        status: false,
        code: 404,
        message: "not uuid",
      });
    }
    const existingBookmark = await Bookmark.findOneBy({
      post: {
        uuid: uuid,
      },
      user: {
        id: req.session.userId,
      },
    });
    if (!existingBookmark) {
      return res.json({
        status: false,
        code: 404,
        message: "not bookmark",
      });
    }
    return res.json({
      status: true,
      code: 200,
      bookmark: existingBookmark,
    });
  }
);

export default router;
