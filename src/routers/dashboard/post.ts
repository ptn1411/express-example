import { Request, Response, Router } from "express";
import { Post } from "../../entity/Post";
// import { Like } from "typeorm";
import { dateNow } from "../../utils";

const router = Router();

router.get("/all", async (_req: Request, res: Response) => {
  const existingUser = await Post.findAndCount({
    select: {
      uuid: true,
      content: true,
    },
    take: 20,
  });
  res.json(existingUser);
});

router.get("/new", async (_req: Request, res: Response) => {
  const time = new Date(dateNow().date);
  const existingUser = await Post.findAndCount({
    where: {
      createAt: time,
    },
    select: {
      uuid: true,
      content: true,
    },
    take: 20,
  });
  res.json(existingUser);
});

export default router;
