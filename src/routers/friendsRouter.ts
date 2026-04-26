import { Request, Response, Router } from "express";
import { Friends } from "../entity/Friends";
import { checkApiAuthAccessToken } from "../middleware/checkAuth";
import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import { FriendRequest_Status } from "../types/Friends";
import jsonP from "@ptndev/json";
import { newFriend, newFriendAccepted } from "../services/new-notification";
const router = Router();
const arrayKeyRemove = [
  "password",
  "email",
  "phone",
  "firstName",
  "lastName",
  "birthday",
  "sex",
  "coverImage",
  "createAt",
  "updateAt",
];
router.get(
  "/status/:receiverId",
  checkApiAuthAccessToken,
  async (req: Request, res: Response) => {
    try {
      const { receiverId } = req.params;
      const uuid = req.user?.id;
      const existingFriends = await Friends.findOne({
        where: [
          {
            creator: {
              id: uuid,
            },
            receiver: {
              id: receiverId,
            },
          },
          {
            creator: {
              id: receiverId,
            },
            receiver: {
              id: uuid,
            },
          },
        ],
        relations: ["creator", "receiver"],
      });
      if (!existingFriends) {
        return res.json({
          code: 200,
          success: true,
          status: "not-sent",
        });
      }
      if (
        existingFriends.receiver.id === uuid &&
        ["not-sent", "pending", "waiting-for-current-user-response"].includes(
          existingFriends.status
        )
      ) {
        return res.json({
          code: 200,
          success: true,
          id: existingFriends.id,
          status: "waiting-for-current-user-response",
        });
      }
      existingFriends.status = existingFriends?.status || "not-sent";
      return res.json({
        code: 200,
        success: true,
        id: existingFriends.id,
        creator: jsonP.removeKeyObject(existingFriends.creator, arrayKeyRemove),
        receiver: jsonP.removeKeyObject(
          existingFriends.receiver,
          arrayKeyRemove
        ),
        status: existingFriends.status,
      });
    } catch (error) {
      return res.json({
        code: 500,
        success: false,
        message: `error`,
      });
    }
  }
);

export interface TypedRequest<U> extends Request {
  body: U;
}

router.post(
  "/send/:receiverId",
  checkApiAuthAccessToken,
  async (req: Request, res: Response) => {
    const { receiverId } = req.params;
    const uuid = req.user?.id;

    if (receiverId === uuid) {
      return res.json({
        code: 400,
        success: false,
        message: "It is not possible to add yourself!",
      });
    }
    try {
      const existingUser = await User.findOneBy({
        id: uuid,
      });
      if (!existingUser) {
        return res.json({
          code: 404,
          success: false,
          message: `error`,
        });
      }
      const checkFriend = await User.findOneBy({
        id: receiverId,
      });
      if (!checkFriend) {
        return res.json({
          code: 404,
          success: false,
          message: `error`,
        });
      }
      const existingFriends = await Friends.findOne({
        where: [
          {
            creator: {
              id: uuid,
            },
            receiver: {
              id: receiverId,
            },
          },
          {
            creator: {
              id: receiverId,
            },
            receiver: {
              id: uuid,
            },
          },
        ],
      });
      if (existingFriends) {
        return res.json({
          code: 200,
          success: true,
          ...existingFriends,
        });
      }
      const friendRequest = await Friends.create({
        creator: existingUser,
        receiver: checkFriend,
        status: "pending",
      });
      await AppDataSource.getRepository(Friends).save(friendRequest);
      await newFriend(existingUser, checkFriend);
      return res.json({
        code: 200,
        success: true,
        message: `success`,
        id: friendRequest.id,
        creator: jsonP.removeKeyObject(friendRequest.creator, arrayKeyRemove),
        receiver: jsonP.removeKeyObject(friendRequest.receiver, arrayKeyRemove),
        status: friendRequest.status,
      });
    } catch (error) {
      return res.json({
        code: 500,
        success: false,
        message: `error`,
      });
    }
  }
);

router.put(
  "/response/:friendRequestId",
  checkApiAuthAccessToken,
  async (
    req: TypedRequest<{ status: FriendRequest_Status }>,
    res: Response
  ) => {
    const { friendRequestId } = req.params;

    const status = req.body.status;
    try {
      const existingFriends = await Friends.findOneBy({
        id: parseInt(friendRequestId),
      });
      if (!existingFriends) {
        return res.json({
          code: 404,
          success: false,
          message: `error`,
        });
      }
      existingFriends.status = status;
      await AppDataSource.manager.save(existingFriends);
      await newFriendAccepted(
        existingFriends.receiver,
        existingFriends.creator
      );
      return res.json({
        code: 200,
        success: true,
        message: `success`,
        ...existingFriends,
        // id: existingFriends.id,
        // creator: jsonP.removeKeyObject(existingFriends.creator, arrayKeyRemove),
        // receiver: jsonP.removeKeyObject(
        //   existingFriends.receiver,
        //   arrayKeyRemove
        // ),
        // status: existingFriends.status,
      });
    } catch (error) {
      console.log(error);

      return res.send({
        code: 500,
        success: false,
        message: `error`,
      });
    }
  }
);

router.get(
  "/me/received-requests",
  checkApiAuthAccessToken,
  async (req: Request, res: Response) => {
    const uuid = req.user?.id;

    try {
      const existingFriends = await AppDataSource.getRepository(Friends).find({
        where: [
          {
            receiver: {
              id: uuid,
            },
          },
        ],
        select: {
          creator: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
          receiver: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
          status: true,
          createAt: true,
        },
        relations: ["creator", "receiver"],
      });

      return res.json({
        code: 200,
        success: true,
        message: `success`,
        data: existingFriends,
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

router.get(
  "/my",
  checkApiAuthAccessToken,
  async (req: Request, res: Response) => {
    const uuid = req.user?.id;

    try {
      const existingFriends = await AppDataSource.getRepository(Friends).find({
        where: [
          {
            creator: {
              id: uuid,
            },
            status: "accepted",
          },
          {
            receiver: {
              id: uuid,
            },
            status: "accepted",
          },
        ],
        relations: ["creator", "receiver"],
      });
      let userUuid: string[] = [];
      existingFriends.forEach((friend) => {
        if (friend.creator.id === uuid) {
          userUuid.push(friend.receiver.id);
        } else if (friend.receiver.id === uuid) {
          userUuid.push(friend.creator.id);
        }
      });
      const existingUsers = await AppDataSource.getRepository(User).findByIds(
        userUuid
      );
      const userData: any[] = [];
      existingUsers.forEach((user) => {
        userData.push({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar,
        });
      });
      return res.json({
        code: 200,
        success: true,
        message: `success`,
        friends: userData,
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
