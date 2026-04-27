import { Request, Response, Router } from "express";
import { MoreThanOrEqual } from "typeorm";
import { Friends } from "../../entity/Friends";
import { FriendStatus as FriendStatusConst } from "../../constants";
import { dateNow } from "../../utils";

const router = Router();

router.get("/all", async (_req: Request, res: Response) => {
  const existingUser = await Friends.findAndCount({
    select: { id: true },
    where: { status: FriendStatusConst.ACCEPTED },
    take: 20,
  });
  res.json(existingUser);
});

router.get("/new", async (_req: Request, res: Response) => {
  const time = new Date(dateNow().date);
  const existingUser = await Friends.findAndCount({
    where: {
      createAt: MoreThanOrEqual(time),
      status: FriendStatusConst.ACCEPTED,
    },
    select: { id: true },
    take: 20,
  });
  res.json(existingUser);
});

export default router;
