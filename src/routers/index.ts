import { Request, Response, Router } from "express";
import refreshTokenRouter from "./refreshTokenRouter";
import imageRouter from "./imageRouter";
import bookmarkRouter from "./bookmarkRouter";
import friendsRouter from "./friendsRouter";
import messenger from "./messenger";
import user from "./user";
import dashboard from "./dashboard";
const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.send("Server");
});

router.use("/refresh_token", refreshTokenRouter);
router.use("/image", imageRouter);
router.use("/user", user);
router.use("/bookmark", bookmarkRouter);
router.use("/friends", friendsRouter);
router.use("/messenger", messenger);
router.use("/dashboard", dashboard);

export default router;
