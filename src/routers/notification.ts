import { Request, Response, Router } from "express";
import { checkApiAuthAccessToken } from "../middleware/checkAuth";

import { AppDataSource } from "../data-source";
import { UserNotifications } from "../entity/UserNotifications";
const router = Router();

router.get(
  "/all",
  checkApiAuthAccessToken,
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const userNotificationsRepository =
      AppDataSource.getRepository(UserNotifications);
    const [notifications, totalCount] = await userNotificationsRepository.findAndCount({
      where: {
        user: {
          id: userId,
        },
      },
      relations: {
        notification: true,
      },
      order: { id: "DESC" },
      take: limit,
      skip: (page - 1) * limit,
    });

    return res.json({
      status: true,
      code: 200,
      notifications,
      page,
      limit,
      totalCount,
      hasNextPage: (page - 1) * limit + notifications.length < totalCount,
    });
  }
);
router.post(
  "/read/:id",
  checkApiAuthAccessToken,
  async (req: Request, res: Response) => {
    const notionId = req.params.id;
    if (isNaN(Number(notionId))) {
      return res.status(400).json({ status: false, code: 400, message: "Invalid notification id" });
    }
    const userNotificationsRepository =
      AppDataSource.getRepository(UserNotifications);
    const notifications = await userNotificationsRepository.findOne({
      where: {
        id: Number(notionId),
      },
    });
    if (!notifications) {
      return res.json({
        status: false,
        code: 404,
      });
    }
    notifications.isRead = true;
    await AppDataSource.manager.save(notifications);
    return res.json({
      status: true,
      code: 200,
      notifications: notifications,
    });
  }
);

export default router;
