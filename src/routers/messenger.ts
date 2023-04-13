import { Request, Response, Router } from "express";
import { checkApiAuthAccessToken } from "../middleware/checkAuth";
import {
  createConversation,
  getConversationsWithUsers,
} from "../services/chat";

const router = Router();

router.get(
  "/getConversations",
  checkApiAuthAccessToken,
  async (req: Request, res: Response) => {
    const uuid = req.user?.id;
    if (!uuid) {
      return res.status(401).send("Unauthorized");
    }
    const data = await getConversationsWithUsers(uuid);

    return res.json({
      code: 200,
      success: true,
      conversations: data,
    });
  }
);

router.get(
  "/conversation",
  checkApiAuthAccessToken,
  async (req: Request, res: Response) => {
    const uuid = req.user?.id;
    const friendId = req.query.friendId as string;
    if (!uuid) {
      return res.status(401).send("Unauthorized");
    }
    if (!friendId) {
      return res.status(400).send("Bad Request");
    }
    if (uuid === friendId) {
      return res.status(400).send("Bad Request");
    }
    const data = await createConversation(uuid, friendId);
    return res.json({
      code: 200,
      success: true,
      conversation: data,
    });
  }
);
export default router;
