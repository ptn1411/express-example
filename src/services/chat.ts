import { KEY_PREFIX } from "../constants";
import { AppDataSource } from "../data-source";
import { ActiveConversationEntity } from "../entity/Active-conversation";
import { ConversationEntity } from "../entity/Conversation";
import { MessageEntity } from "../entity/Message";
import { User } from "../entity/User";
import redisClient from "../redis";
import { removeKeyObject } from "../utils";
import { listFriendOnline } from "./friend";
const arrayKeyRemove = [
  "password",
  "email",
  "phone",
  "firstName",
  "lastName",
  "birthday",
  "sex",
  "coverImage",
  "createAt",
  "updateAt",
];
export let getConversation = async (creatorId: string, friendId: string) => {
  const existingConversation = await AppDataSource.getRepository(
    ConversationEntity
  )
    .createQueryBuilder("conversation")
    .leftJoin("conversation.users", "user")
    .where("user.id = :creatorId", { creatorId })
    .orWhere("user.id = :friendId", { friendId })
    .groupBy("conversation.id")
    .having("COUNT(*) > 1")
    .getOne();
  const existingUser = await User.findOneBy({
    id: creatorId,
  });
  const checkFriend = await User.findOneBy({
    id: friendId,
  });
  if (existingUser && checkFriend && existingConversation) {
    existingConversation.users = [
      removeKeyObject(existingUser, arrayKeyRemove) as User,
      removeKeyObject(checkFriend, arrayKeyRemove) as User,
    ];
    return existingConversation;
  }
  return null;
};

export let createConversation = async (creatorId: string, friendId: string) => {
  const doesConversationExist = await getConversation(creatorId, friendId);

  if (!doesConversationExist) {
    const existingUser = await User.findOneBy({
      id: creatorId,
    });
    if (!existingUser) {
      return null;
    }
    const checkFriend = await User.findOneBy({
      id: friendId,
    });
    if (!checkFriend) {
      return null;
    }
    const newConversation = await ConversationEntity.create({
      users: [existingUser, checkFriend],
    });

    await AppDataSource.getRepository(ConversationEntity).save(newConversation);
    return newConversation;
  }

  return doesConversationExist;
};
export let getConversationsForUser = async (userId: string) => {
  const existingConversation = await AppDataSource.getRepository(
    ConversationEntity
  )
    .createQueryBuilder("conversation")
    .leftJoin("conversation.users", "user")
    .where("user.id = :userId", { userId })
    .orderBy("conversation.lastUpdated", "DESC")
    .getMany();
  return existingConversation;
};

export let getUsersInConversation = async (conversationId: number) => {
  const existingConversation = await AppDataSource.getRepository(
    ConversationEntity
  ).findOne({
    where: {
      id: conversationId,
    },
    relations: {
      users: true,
    },
    select: {
      users: {
        id: true,
        username: true,
        avatar: true,
        fullName: true,
      },
    },
  });
  // .createQueryBuilder("conversation")
  // .innerJoinAndSelect("conversation.users", "user")
  // .where("conversation.id = :conversationId", { conversationId })
  // .getMany();
  return existingConversation;
};
export let getConversationsWithUsers = async (userId: string) => {
  const conversations = await getConversationsForUser(userId);

  return Promise.all(
    conversations.map(async (conversation) => {
      return await getUsersInConversation(conversation.id);
    })
  );
};
export let joinConversation = async (
  friendId: string,
  userId: string,
  socketId: string
) => {
  const conversation = await getConversation(userId, friendId);
  if (!conversation) {
    console.warn(
      `No conversation exists for userId: ${userId} and friendId: ${friendId}`
    );
    return;
  }
  const conversationId = conversation.id;
  const activeConversation = await AppDataSource.getRepository(
    ActiveConversationEntity
  ).findOne({
    where: {
      user: {
        id: userId,
      },
    },
  });
  const existingUser = await User.findOneBy({
    id: userId,
  });
  if (!existingUser) {
    return null;
  }
  if (activeConversation) {
    await AppDataSource.getRepository(ActiveConversationEntity).delete({
      user: {
        id: userId,
      },
    });
    const newActiveConversationEntity = await ActiveConversationEntity.create({
      user: existingUser,
      socketId,
      conversationId,
    });
    return await AppDataSource.getRepository(ActiveConversationEntity).save(
      newActiveConversationEntity
    );
  } else {
    const newActiveConversationEntity = await ActiveConversationEntity.create({
      user: existingUser,
      socketId,
      conversationId,
    });
    return await AppDataSource.getRepository(ActiveConversationEntity).save(
      newActiveConversationEntity
    );
  }
};
export let leaveConversation = async (socketId: string) => {
  return await AppDataSource.getRepository(ActiveConversationEntity).delete({
    socketId,
  });
};
export let getActiveUsers = async (conversationId: number) => {
  const activeConversation = await AppDataSource.getRepository(
    ActiveConversationEntity
  ).find({
    where: {
      conversationId,
    },
    relations: {
      user: true,
    },
    select: {
      user: {
        id: true,
        username: true,
        avatar: true,
        fullName: true,
      },
    },
  });
  return activeConversation;
};
export let getSocketIdByUuid = async (uuid: string) => {
  const listUser = await listFriendOnline(uuid);
  if (listUser === null) {
    return null;
  }

  const keys = listUser.map((friend) => `${KEY_PREFIX}socketid:${friend}`);

  if (keys.length === 0) {
    return null;
  }
  const listOnline = await redisClient.mget(keys);

  return listOnline.filter((x) => x) as string[];
};
export let createMessage = async (message: MessageEntity) => {
  const existingUser = await User.findOne({
    where: {
      id: message.user.id,
    },
    select: {
      id: true,
      username: true,
      avatar: true,
      fullName: true,
    },
  });
  if (!existingUser) {
    return null;
  }
  message.user = existingUser;
  const existingMessage = await MessageEntity.create({
    ...message,
  });
  return await AppDataSource.getRepository(MessageEntity).save(existingMessage);
};
export let getMessages = async (conversationId: number) => {
  return await AppDataSource.getRepository(MessageEntity).find({
    where: {
      conversation: {
        id: conversationId,
      },
    },
    relations: {
      user: true,
    },
    order: {
      createdAt: "ASC",
    },
    select: {
      user: {
        id: true,
        username: true,
        avatar: true,
        fullName: true,
      },
    },
  });
  // .createQueryBuilder("message")
  // .leftJoinAndSelect("message.user", "user")
  // .where("message.conversation.id =:conversationId", { conversationId })
  // .orderBy("message.createdAt", "ASC")

  // .getMany();
};

export let removeActiveConversations = async () => {
  return await AppDataSource.getRepository(ActiveConversationEntity)
    .createQueryBuilder()
    .delete()
    .execute();
};
export let removeMessages = async () => {
  return await AppDataSource.getRepository(MessageEntity)
    .createQueryBuilder()
    .delete()
    .execute();
};
export let removeConversations = async () => {
  return await AppDataSource.getRepository(ConversationEntity)
    .createQueryBuilder()
    .delete()
    .execute();
};
