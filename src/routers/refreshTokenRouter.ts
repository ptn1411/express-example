import { Request, Response, Router } from "express";
import { JwtVerifyRefreshToken, JwtSignAccessToken } from "../utils/jwt";
import { User } from "../entity/User";

import { removeKeyObject } from "../utils";
import { DAY_TIME } from "../constants";
import { catchError } from "../middleware/checkAuth";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken)
    return res.status(403).json({ message: "Refresh Token is required!" });

  try {
    const decodeUser = await JwtVerifyRefreshToken(refreshToken);

    if (decodeUser.error) {
      return catchError(decodeUser.error, res);
    }
    const existingUser = await User.findOne({
      where: {
        id: decodeUser.data?.user.id,
      },
    });
    if (!existingUser) {
      return res.status(404).send({ message: "User Not found." });
    }

    const dataUser = removeKeyObject(existingUser, ["password"]);

    const token = await JwtSignAccessToken({ user: dataUser }, DAY_TIME);
    if (token.error) {
      return res.status(500).send({ message: "server" });
    }

    return res.json({
      success: true,
      code: 200,
      accessToken: token.data,
    });
  } catch (error) {
    return res.sendStatus(500).send({ message: "server" });
  }
});

export default router;
