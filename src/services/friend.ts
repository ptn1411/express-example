import { AppDataSource } from "../data-source";
import { Friends } from "../entity/Friends";
import { User } from "../entity/User";

export let getFriends = async (userId: string) => {
  const existingFriends = await AppDataSource.getRepository(Friends).find({
    where: [
      {
        creator: {
          id: userId,
        },
        status: "accepted",
      },
      {
        receiver: {
          id: userId,
        },
        status: "accepted",
      },
    ],
    relations: ["creator", "receiver"],
  });
  let userUuid: string[] = [];
  existingFriends.forEach((friend) => {
    if (friend.creator.id === userId) {
      userUuid.push(friend.receiver.id);
    } else if (friend.receiver.id === userId) {
      userUuid.push(friend.creator.id);
    }
  });
  return userUuid;
};
export let newFriends = async (creator: string, receiver: string) => {
  const existingUser = await User.findOneBy({
    id: creator,
  });
  if (!existingUser) {
    return undefined;
  }
  const checkFriend = await User.findOneBy({
    id: receiver,
  });
  if (!checkFriend) {
    return undefined;
  }
  const existingFriends = await Friends.findOne({
    where: [
      {
        creator: {
          id: creator,
        },
        receiver: {
          id: receiver,
        },
      },
      {
        creator: {
          id: receiver,
        },
        receiver: {
          id: creator,
        },
      },
    ],
  });
  if (existingFriends) {
    return existingFriends;
  }
  const friendRequest = await Friends.create({
    creator: existingUser,
    receiver: checkFriend,
    status: "accepted",
  });
  await AppDataSource.getRepository(Friends).save(friendRequest);
  return friendRequest;
};
