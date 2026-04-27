import { Request, Response, Router } from "express";
import { MoreThanOrEqual } from "typeorm";
import { Friends } from "../../entity/Friends";
import { FriendStatus } from "../../constants";
import { dateNow } from "../../utils";

const router = Router();

router.get("/all", async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const [friends, totalCount] = await Friends.findAndCount({
    where: { status: FriendStatus.ACCEPTED },
    select: {
      id: true,
      status: true,
      createAt: true,
    },
    order: { createAt: "DESC" },
    take: limit,
    skip: (page - 1) * limit,
  });

  res.json({
    code: 200,
    success: true,
    friends,
    page,
    limit,
    totalCount,
    hasNextPage: (page - 1) * limit + friends.length < totalCount,
  });
});

router.get("/new", async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const time = new Date(dateNow().date);

  const [friends, totalCount] = await Friends.findAndCount({
    where: {
      createAt: MoreThanOrEqual(time),
      status: FriendStatus.ACCEPTED,
    },
    select: {
      id: true,
      status: true,
      createAt: true,
    },
    order: { createAt: "DESC" },
    take: limit,
    skip: (page - 1) * limit,
  });

  res.json({
    code: 200,
    success: true,
    friends,
    page,
    limit,
    totalCount,
    hasNextPage: (page - 1) * limit + friends.length < totalCount,
  });
});

export default router;
