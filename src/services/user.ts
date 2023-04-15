import { UserOnline } from "../entity/User-online";

export let isOnlineUserById = async (userId: string) => {
  const existingUserOnline = await UserOnline.findOneBy({
    user: {
      id: userId,
    },
  });
  return .updateAt ? true : false;
};
