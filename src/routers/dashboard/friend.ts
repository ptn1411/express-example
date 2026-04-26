import { Request, Response, Router } from "express";
import { Friends } from "../../entity/Friends";
// import { Like } from "typeorm";
import { dateNow } from "../../utils";

const router = Router();

router.get("/all", async (_req: Request, res: Response) => {
  const existingUser = await Friends.findAndCount({
    select: {
      id: true,
    },
    where: {
      status: "accepted",
    },
    take: 20,
  });
  res.json(existingUser);
});

router.get("/new", async (_req: Request, res: Response) => {
  const time = new Date(dateNow().date);
  const existingUser = await Friends.findAndCount({
    where: {
      createAt: time,
      status: "accepted",
    },
    select: {
      id: true,
    },
    take: 20,
  });
  res.json(existingUser);
});

export default router;
