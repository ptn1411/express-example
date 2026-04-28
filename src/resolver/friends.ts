import { Ctx, Query, Resolver, UseMiddleware } from "type-graphql";

import { Context } from "../types/Context";

import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import { Friends } from "../entity/Friends";
import { FriendQueryResponse } from "../types/FriendQueryResponse";
import { checkAccessToken } from "../middleware/checkAuth";
import { UserQueryResponse } from "../types/UserQueryResponse";
import { In } from "typeorm";

@Resolver()
export class FriendsResolver {
  @UseMiddleware(checkAccessToken)
  @Query((_return) => FriendQueryResponse)
  async friends(@Ctx() { req }: Context): Promise<FriendQueryResponse> {
    try {
      const uuid = req.user?.id;
      const existingFriends = await AppDataSource.getRepository(Friends).find({
        where: [
          { creator: { id: uuid }, status: "accepted" },
          { receiver: { id: uuid }, status: "accepted" },
        ],
        relations: ["creator", "receiver"],
        select: {
          id: true,
          status: true,
          creator: { id: true },
          receiver: { id: true },
        },
      });
      let userUuid: string[] = [];
      existingFriends.forEach((friend) => {
        if (friend.creator.id === uuid) {
          userUuid.push(friend.receiver.id);
        } else if (friend.receiver.id === uuid) {
          userUuid.push(friend.creator.id);
        }
      });
      const existingUsers = await AppDataSource.getRepository(User).find({
        where: { id: In(userUuid) },
      });
      return {
        code: 200,
        success: true,
        message: `success`,
        friends: existingFriends,
        users: existingUsers,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `error`,
      };
    }
  }
  @UseMiddleware(checkAccessToken)
  @Query((_return) => UserQueryResponse)
  async friendRequest(@Ctx() { req }: Context): Promise<UserQueryResponse> {
    try {
      const uuid = req.user?.id;
      const existingFriends = await AppDataSource.getRepository(Friends).find({
        where: {
          receiver: {
            id: uuid,
          },
          status: "pending",
        },
        relations: ["creator", "receiver"],
      });
      let userUuid: string[] = [];
      existingFriends.forEach((friend) => {
        if (friend.receiver.id === uuid) {
          userUuid.push(friend.creator.id);
        }
      });
      const existingUsers = await AppDataSource.getRepository(User).find({
        where: { id: In(userUuid) },
      });
      return {
        code: 200,
        success: true,
        message: `success`,
        users: existingUsers,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `error`,
      };
    }
  }
}
