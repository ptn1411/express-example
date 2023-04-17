import { UserOnline } from "../entity/User-online";

export let isOnlineUserById = async (userId: string) => {
  const existingUserOnline = await UserOnline.findOneBy({
    user: {
      id: userId,
    },
  });
  if (existingUserOnline) {
    const timeUpdateOnline = 300000;
    const dateNow = new Date();
    const dateOnline = new Date(existingUserOnline.updateAt);
    const timeDiff = dateOnline.getTime() - dateNow.getTime();
    console.log(timeDiff);

    if (timeDiff < timeUpdateOnline) {
      return true;
    }
    return false;
  } else {
    return false;
  }
};
