import { Request, Response, Router } from "express";
import { Friends } from "../entity/Friends";
import { checkApiAuthAccessToken } from "../middleware/checkAuth";

const router = Router();

router.get(
  "/:userId/:friendId",
  checkApiAuthAccessToken,
  async (req: Request, res: Response) => {
    try {
      const { userId, friendId } = req.params;
      const existingFriends = await Friends.findOne({
        where: [{ userId: userId, friendId: friendId }],
      });
      if (!existingFriends) {
        return res.send({
          code: 200,
          success: true,
          message: `error`,
          friends: {
            userId: userId,
            friendId: friendId,
            status: null,
          },
        });
      }

      return res.send({
        code: 200,
        success: true,
        message: `success`,
        friends: existingFriends,
      });
    } catch (error) {
      return res.send({
        code: 500,
        success: false,
        message: `error`,
      });
    }
  }
);

export default router;
