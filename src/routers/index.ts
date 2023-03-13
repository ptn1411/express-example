import { Request, Response, Router } from "express";
import refreshTokenRouter from "./refreshTokenRouter";
const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.send("Server");
});

router.use("/refresh_token", refreshTokenRouter);

export default router;
