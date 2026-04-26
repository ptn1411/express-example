import { KEY_PREFIX } from "../constants";
import { AppDataSource } from "../data-source";
import { Friends } from "../entity/Friends";
import { User } from "../entity/User";
import redisClient from "../redis";
const acceptedFriendQuery = (userId: string) => ({
  where: [
    { creator: { id: userId }, status: "accepted" },
    { receiver: { id: userId }, status: "accepted" },
  ] as const,
  select: {
    creator: { id: true, username: true },
    receiver: { id: true, username: true },
  },
  relations: ["creator", "receiver"] as const,
});

export let getFriends = async (userId: string): Promise<string[]> => {
  const friends = await AppDataSource.getRepository(Friends).find(
    acceptedFriendQuery(userId)
  );
  return friends.map((f) =>
    f.creator.id === userId ? f.receiver.id : f.creator.id
  );
};

export let getUserNameFriends = async (userId: string): Promise<string[]> => {
  const friends = await AppDataSource.getRepository(Friends).find(
    acceptedFriendQuery(userId)
  );
  return friends.map((f) =>
    f.creator.id === userId ? f.receiver.username : f.creator.username
  );
};

export let listFriendOnline = async (userId: string) => {
  const friends = await getFriends(userId);
  if (friends.length === 0) {
    return null;
  }

  const keys = friends.map((friend) => `${KEY_PREFIX}userid:${friend}`);
  if (keys.length === 0) {
    return null;
  }
  const listOnline = await redisClient.mget(keys);

  return listOnline.filter((x) => x) as string[];
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
    status: "pending",
  });
  await AppDataSource.getRepository(Friends).save(friendRequest);
  return friendRequest;
};
