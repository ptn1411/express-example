import { UserNotifications } from "../entity/UserNotifications";
import { User } from "../entity/User";
import { Notifications } from "../entity/Notifications";
import { Post } from "../entity/Post";
import { AppDataSource } from "../data-source";
import { getFriends } from "./friend";
import { Like } from "../entity/Like";
import { Comment } from "../entity/Comment";
export let newPostNotion = async (user: User, post: Post) => {
  const newNotion = await Notifications.create({
    senderID: user.id,
    content: `${user.fullName} new post`,
    url: `${process.env.FRONTEND_URL}/post/${post.uuid}`,
  });
  const listFriendId = await getFriends(user.id);
  const users = await User.findByIds(listFriendId);
  await newNotion.save();
  const newNotifications = users.map((value) => {
    return UserNotifications.create({
      notification: newNotion,
      user: value,
      isRead: false,
    });
  });

  await AppDataSource.manager.save(newNotifications);
};

export let newLike = async (user: User, post: Post, like: Like) => {
  try {
    if (user.id === post.user.id) {
      return;
    }
    const newNotion = await Notifications.create({
      senderID: user.id,
      content: `${user.fullName} ${like.reactions} your post`,
      url: `${process.env.FRONTEND_URL}/post/${post.uuid}`,
    });
    await newNotion.save();
    const newUserNotion = await UserNotifications.create({
      notification: newNotion,
      user: post.user,
      isRead: false,
    });
    await newUserNotion.save();
    return;
  } catch (error) {
    console.log(error);
    return;
  }
};
export let newComment = async (user: User, comment: Comment, post: Post) => {
  try {
    if (user.id === post.user.id) {
      return;
    }
    const newNotion = await Notifications.create({
      senderID: user.id,
      content: `${user.fullName} comment ${comment.content} your post`,
      url: `${process.env.FRONTEND_URL}/post/${post.uuid}`,
    });
    await newNotion.save();
    const newUserNotion = await UserNotifications.create({
      notification: newNotion,
      user: post.user,
      isRead: false,
    });
    await newUserNotion.save();
    return;
  } catch (error) {
    console.log(error);

    return;
  }
};

export let newFriend = async (user: User, friend: User) => {
  const newNotion = await Notifications.create({
    senderID: user.id,
    content: `${user.fullName} sent a friend request`,
    url: `${process.env.FRONTEND_URL}/friends`,
  });
  await newNotion.save();
  const newUserNotion = await UserNotifications.create({
    notification: newNotion,
    user: friend,
    isRead: false,
  });
  await newUserNotion.save();
};
export let newFriendAccepted = async (user: User, friend: User) => {
  const newNotion = await Notifications.create({
    senderID: user.id,
    content: `${friend.fullName} Accepted`,
    url: `${process.env.FRONTEND_URL}/${friend.username}`,
  });
  await newNotion.save();
  const newUserNotion = await UserNotifications.create({
    notification: newNotion,
    user: friend,
    isRead: false,
  });
  await newUserNotion.save();
};
