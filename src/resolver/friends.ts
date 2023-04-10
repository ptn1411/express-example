import { Ctx, Query, Resolver } from "type-graphql";

import { Context } from "../types/Context";

import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import { Friends } from "../entity/Friends";
import { FriendQueryResponse } from "../types/FriendQueryResponse";
import { log } from "console";

@Resolver()
export class FriendsResolver {
  @Query((_return) => FriendQueryResponse)
  async friends(@Ctx() { req }: Context): Promise<FriendQueryResponse> {
    try {
      const uuid = req.session.userId;
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
      return {
        code: 200,
        success: true,
        message: `success`,
        friends: existingFriends,
        users: existingUsers,
      };
    } catch (error) {
      log(error);
      return {
        code: 500,
        success: false,
        message: `error`,
      };
    }
  }
}
