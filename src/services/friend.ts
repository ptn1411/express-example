import { AppDataSource } from "../data-source";
import { Friends } from "../entity/Friends";

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
