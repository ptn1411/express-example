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

    const userNotificationsRepository =
      AppDataSource.getRepository(UserNotifications);
    const notifications = await userNotificationsRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: {
        notification: true,
      },
    });

    return res.json({
      status: true,
      code: 200,
      notifications: notifications,
    });
  }
);
router.post(
  "/read/:id",
  checkApiAuthAccessToken,
  async (req: Request, res: Response) => {
    const notionId = req.params.id;
    const userNotificationsRepository =
      AppDataSource.getRepository(UserNotifications);
    const notifications = await userNotificationsRepository.findOne({
      where: {
        id: Number(notionId),
      },
    });
    console.log(notifications);

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
