import { Request, Response, Router } from "express";
import refreshTokenRouter from "./refreshTokenRouter";
import imageRouter from "./imageRouter";
import bookmarkRouter from "./bookmarkRouter";
import friendsRouter from "./friendsRouter";
const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.send("Server");
});

router.use("/refresh_token", refreshTokenRouter);
router.use("/image", imageRouter);
router.use("/bookmark", bookmarkRouter);
router.use("/friends", friendsRouter);

export default router;
