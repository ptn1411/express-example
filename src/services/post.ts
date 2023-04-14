import { AppDataSource } from "../data-source";
import { Post } from "../entity/Post";
import { getFriends } from "./friend";

export let getPostsFromFriend = async (userId: string) => {
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
  });

  const postsData: any = [];
  posts.forEach((post) => {
    if (friendsId.includes(post.user.id)) {
      postsData.push(post);
    }
  });
  return postsData;
};
