import { Request, Response, Router } from "express";
import { checkApiAuthAccessToken } from "../middleware/checkAuth";
import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import { UserOnline } from "../entity/User-online";
import { Device } from "../entity/Device";

const router = Router();

router.get(
  "/search",
  checkApiAuthAccessToken,
  async (req: Request, res: Response) => {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(404).send("Bad Request");
    }
    const data = await AppDataSource.getRepository(User)
      .createQueryBuilder("user")
      .where("user.fullName LIKE :keyword", { keyword: `%${keyword}%` })
      .orWhere("user.username LIKE :keyword", { keyword: `%${keyword}%` })
      .select(["user.id", "user.username", "user.fullName", "user.avatar"])
      .limit(10)
      .getMany();
    return res.json({
      code: 200,
      success: true,
      users: data,
    });
  }
);

router.put(
  "/online",
  checkApiAuthAccessToken,
  async (req: Request, res: Response) => {
    const uuid = req.user?.id;
    if (!uuid) {
      return res.status(401).send("Unauthorized");
    }

    const existingUserOnline = await UserOnline.findOneBy({
      user: {
        id: uuid,
      },
    });

    if (existingUserOnline) {
      existingUserOnline.updateAt = new Date();
      await AppDataSource.manager.save(existingUserOnline);
      return res.json({
        code: 200,
        success: true,
        lastOnline: existingUserOnline.updateAt,
      });
    }
    const newUserOnline = await UserOnline.create({
      user: {
        id: uuid,
      },
    });
    await AppDataSource.manager.save(newUserOnline);
    return res.json({
      code: 200,
      success: true,
      lastOnline: newUserOnline.updateAt,
    });
  }
);
router.post(
  "/notification/subscription",
  checkApiAuthAccessToken,
  async (req: Request, res: Response) => {
    const uuid = req.user?.id;
    const { subscription, agent } = req.body;
    if (!uuid) {
      return res.status(401).send("Unauthorized");
    }
    const ip = req.ip;

    const existingDevice = await Device.findOneBy({
      user: {
        id: uuid,
      },
    });

    if (existingDevice) {
      existingDevice.ip = ip;
      existingDevice.agent = agent;
      existingDevice.subscription = JSON.stringify(subscription);
      await AppDataSource.manager.save(existingDevice);
      return res.send(ip);
    }
    const newDevice = await Device.create({
      user: {
        id: uuid,
      },
      ip,
      agent,
      subscription: JSON.stringify(subscription),
    });
    await AppDataSource.manager.save(newDevice);
    return res.send(ip);
  }
);
export default router;
