import { Request, Response, Router } from "express";
import { MoreThanOrEqual } from "typeorm";
import { User } from "../../entity/User";
import { dateNow } from "../../utils";

const router = Router();

router.get("/all", async (_req: Request, res: Response) => {
  const existingUser = await User.findAndCount({
    select: {
      id: true,
      email: true,
      role: true,
      createAt: true,
      avatar: true,
      fullName: true,
    },
    take: 20,
  });
  res.json(existingUser);
});

router.get("/new", async (_req: Request, res: Response) => {
  const time = new Date(dateNow().date);
  const existingUser = await User.findAndCount({
    where: {
      createAt: MoreThanOrEqual(time),
    },
    select: {
      id: true,
      email: true,
      role: true,
      createAt: true,
      avatar: true,
      fullName: true,
    },
    take: 20,
  });
  res.json(existingUser);
});

export default router;
