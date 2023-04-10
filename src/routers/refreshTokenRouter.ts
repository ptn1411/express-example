import { Request, Response, Router } from "express";
import {
  JwtVerifyRefreshToken,
  JwtSendRefreshToken,
  JwtSignAccessToken,
} from "../utils/jwt";
import { User } from "../entity/User";
import { DAY_TIME } from "../constants";
import { JwtPayload } from "../middleware/checkAuth";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const refreshToken =
    req.cookies[process.env.REFRESH_TOKEN_COOKIE_NAME as string];
  if (!refreshToken) return res.sendStatus(401);

  try {
    const decodeUser = JwtVerifyRefreshToken(refreshToken) as JwtPayload;
    if (!decodeUser) return res.sendStatus(401);
    const existingUser = await User.findOne({
      where: {
        id: decodeUser.user.id,
      },
    });
    if (!existingUser) return res.sendStatus(401);

    const accessToken = JwtSignAccessToken(existingUser, DAY_TIME);
    if (!accessToken) return res.sendStatus(401);

    JwtSendRefreshToken(res, existingUser);

    return res.json({
      success: true,
      code: 200,
      accessToken: accessToken,
    });
  } catch (error) {
    return res.sendStatus(403);
  }
});

export default router;
