import { AppDataSource } from "../data-source";
import { Post } from "../entity/Post";
import { getFriends } from "./friend";

export let getPostsFromFriend = async (
  userId: string,
  page = 1,
  limit = 10
) => {
  const friendsId = await getFriends(userId);
  const arrayFriendsId: any = [];
  friendsId.map((friend) => {
    arrayFriendsId.push({
      user: {
        id: friend,
      },
    });
  });

  const postRepository = await AppDataSource.getRepository(Post);

  const posts = await postRepository.find({
    relations: {
      user: true,
      likes: {
        user: true,
      },
      comments: {
        user: true,
        likes: {
          user: true,
        },
      },
    },
    order: {
      createAt: "ASC",
    },
    where: [...arrayFriendsId],
    take: limit,
    skip: (page - 1) * limit,
  });

  return posts;
};
