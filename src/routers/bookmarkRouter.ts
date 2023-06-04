import { Request, Response, Router } from "express";
import { checkApiAuthAccessToken } from "../middleware/checkAuth";
import { Bookmark } from "../entity/Bookmark";
import { AppDataSource } from "../data-source";
import { Report } from "../entity/Report";
import { newReportPostNotion } from "../services/new-notification";
import { Post } from "../entity/Post";
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
          id: req.user?.id,
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
        id: req.user?.id,
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
router.post(
  "/report/:uuid",
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
    if (!req.user) {
      return res.json({
        status: false,
        code: 404,
        message: "not user",
      });
    }
    const existingReport = await Report.findOneBy({
      post: {
        uuid: uuid,
      },
      user: {
        id: req.user?.id,
      },
    });
    if (!existingReport) {
      const newReport = await Report.create({
        post: {
          uuid: uuid,
        },
        user: {
          id: req.user?.id,
        },
        status: "pending",
      });
      const existingPost = await Post.findOne({
        where: {
          uuid: uuid,
        },
      });
      if (!existingPost) {
        return res.json({
          status: false,
          code: 404,
          message: "not uuid",
        });
      }
      await newReportPostNotion(req.user, existingPost);
      await newReport.save();
      return res.json({
        status: true,
        code: 200,
        report: newReport,
      });
    }

    return res.json({
      status: true,
      code: 200,
      report: existingReport,
    });
  }
);
export default router;
