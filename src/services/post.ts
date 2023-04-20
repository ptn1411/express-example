import { AppDataSource } from "../data-source";
import { Post } from "../entity/Post";
import { getFriends } from "./friend";

export let getPostsFromFriend = async (
  userId: string,
  page = 1,
  limit = 10
) => {
  const friendsId = await getFriends(userId);
  const postRepository = await AppDataSource.getRepository(Post);
  const posts = await postRepository.find({
    relations: {
      user: true,
      likes: {
        user: true,
      },
      comments: {
        user: true,
      },
    },
    order: {
      createAt: "DESC",
    },
    take: limit,
    skip: (page - 1) * limit,
  });

  const postsData: any = [];
  posts.forEach((post) => {
    if (friendsId.includes(post.user.id)) {
      postsData.push(post);
    }
  });
  return postsData;
};
