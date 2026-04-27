import { Request, Response, Router } from "express";
import { JwtVerifyRefreshToken, JwtGenerateTokens } from "../utils/jwt";
import { User } from "../entity/User";
import { removeKeyObject } from "../utils";
import { DAY_TIME, KEY_PREFIX } from "../constants";
import { catchError } from "../middleware/checkAuth";
import redisClient from "../redis";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken || typeof refreshToken !== "string")
    return res.status(400).json({ message: "Refresh token is required" });

  try {
    const decoded = await JwtVerifyRefreshToken(refreshToken);
    if (decoded.error) return catchError(decoded.error, res);

    const { user: tokenUser, jti } = decoded.data!;
    if (!jti) return res.status(401).json({ message: "Invalid token" });

    const redisKey = `${KEY_PREFIX}rtoken:${tokenUser.id}:${jti}`;

    // Check jti exists AND get its TTL before deleting — order matters
    const [isValid, remainingTtl] = await Promise.all([
      redisClient.get(redisKey),
      redisClient.ttl(redisKey),
    ]);

    if (!isValid) return res.status(401).json({ message: "Token has been revoked" });

    const existingUser = await User.findOneBy({ id: tokenUser.id });
    if (!existingUser) return res.status(404).json({ message: "User not found" });

    // Rotate: revoke old jti
    await redisClient.del(redisKey);

    const dataUser = removeKeyObject(existingUser, ["password"]);

    // Preserve original rememberMe intent: > 1 day TTL = was remember-me
    const rememberMe = remainingTtl > DAY_TIME;
    const newToken = await JwtGenerateTokens({ user: dataUser }, { rememberMe });
    if (newToken.error || !newToken.jti) {
      return res.status(500).json({ message: "Token generation failed" });
    }

    const newTtl = rememberMe ? DAY_TIME * 30 : DAY_TIME;
    await redisClient.set(
      `${KEY_PREFIX}rtoken:${existingUser.id}:${newToken.jti}`,
      "1",
      "EX",
      newTtl
    );

    return res.json({
      success: true,
      code: 200,
      accessToken: newToken.accessToken,
      refreshToken: newToken.refreshToken,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
