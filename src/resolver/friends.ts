import { Arg, Ctx, Query, Resolver } from "type-graphql";

import { Context } from "../types/Context";

import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import { Friends } from "../entity/Friends";
import { FriendQueryResponse } from "../types/FriendQueryResponse";

@Resolver()
export class FriendsResolver {
  @Query((_return) => FriendQueryResponse)
  async createFriends(
    @Arg("friendId") friendId: string,
    @Arg("status") status: boolean,
    @Ctx() { req }: Context
  ): Promise<FriendQueryResponse> {
    const id = req.session.userId;
    const user = await User.findOneBy({
      id: id,
    });
    if (!user) {
      return {
        code: 401,
        success: false,
        message: `error`,
      };
    }
    const checkFriend = await User.findOneBy({
      id: friendId,
    });
    if (!checkFriend) {
      return {
        code: 404,
        success: false,
        message: `error`,
      };
    }
    const existingFriends = await Friends.findOne({
      where: [{ userId: user.id, friendId: checkFriend.id }],
    });
    if (existingFriends) {
      existingFriends.status = status;
      await AppDataSource.manager.save(existingFriends);
      return {
        code: 200,
        success: true,
        message: `success`,
        friends: [existingFriends],
      };
    }
    const newFriends = await Friends.create({
      userId: user.id,
      friendId: checkFriend.id,
      status: false,
    });
    await AppDataSource.manager.save(newFriends);
    return {
      code: 200,
      success: true,
      message: `success`,
      friends: [newFriends],
    };
  }
}
