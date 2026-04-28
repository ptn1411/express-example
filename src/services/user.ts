import { ONLINE_WINDOW_MS } from "../constants";
import { UserOnline } from "../entity/User-online";

export let isOnlineUserById = async (userId: string) => {
  const existingUserOnline = await UserOnline.findOneBy({
    user: { id: userId },
  });
  if (!existingUserOnline) return false;
  const timeDiff = Date.now() - new Date(existingUserOnline.updateAt).getTime();
  return timeDiff < ONLINE_WINDOW_MS;
};
