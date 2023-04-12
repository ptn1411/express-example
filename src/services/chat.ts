import { AppDataSource } from "../data-source";
import { ActiveConversationEntity } from "../entity/Active-conversation";
import { ConversationEntity } from "../entity/Conversation";
import { MessageEntity } from "../entity/Message";
import { User } from "../entity/User";

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

  return existingConversation;
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
      userId,
    },
  });
  if (activeConversation) {
    await AppDataSource.getRepository(ActiveConversationEntity).delete({
      userId,
    });
    return await AppDataSource.getRepository(ActiveConversationEntity).save({
      userId,
      socketId,
      conversationId,
    });
  } else {
    return await AppDataSource.getRepository(ActiveConversationEntity).save({
      userId,
      socketId,
      conversationId,
    });
  }
};
export let leaveConversation = async (socketId: string) => {
  return await AppDataSource.getRepository(ActiveConversationEntity).delete({
    socketId,
  });
};
export let getActiveUsers = async (conversationId: number) => {
  return await AppDataSource.getRepository(ActiveConversationEntity).find({
    where: {
      conversationId,
    },
  });
};
export let createMessage = async (message: MessageEntity) => {
  return await AppDataSource.getRepository(MessageEntity).save(message);
};
export let getMessages = async (conversationId: number) => {
  return await AppDataSource.getRepository(MessageEntity)
    .createQueryBuilder("message")
    .where("message.conversation.id =:conversationId", { conversationId })
    .orderBy("message.createdAt", "ASC")
    .getMany();
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
