import { Socket } from "socket.io";
import { Request } from "express";
import * as chat from "../services/chat";
import { MessageEntity } from "../entity/Message";
import { sendNotificationByUser } from "../services/notification";

import redisClient from "../redis";
import { listFriendOnline } from "../services/friend";
import { KEY_PREFIX } from "../constants";
import { censorText } from "../services/offensiveWords";
import { MessageType } from "../types/Message";
import eventEmitter from "../utils/eventManager";

export default function (io: Socket | any) {
  io.on("connection", async function (socket: Socket | any) {
    eventEmitter.on("notification", (data: any) => {
      redisClient
        .get(`${KEY_PREFIX}socketid:${data.user.id}`)
        .then((socketId) => {
          if (socketId) {
            io.to(socketId).emit("notification", data);
          }
        });
    });
    const req = socket.request as Request;
    const uuid = req.user?.id;
    const username = req.user?.username;
    if (!uuid || !username) {
      chat.leaveConversation(socket.id).then(() => {
        socket.disconnect();
      });
      return;
    } else {
      await redisClient.set(`${KEY_PREFIX}userid:${uuid}`, uuid);
      await redisClient.set(`${KEY_PREFIX}socketid:${uuid}`, socket.id);
      chat.getConversationsWithUsers(uuid).then((conversations) => {
        io.to(socket.id).emit("conversations", conversations);
      });
    }

    listFriendOnline(uuid).then((friends) => {
      io.to(socket.id).emit("onlineFriends", friends);
    });
    chat.getSocketIdByUuid(uuid).then((sockets) => {
      if (sockets && sockets.length > 0) {
        sockets.map((socketId) => {
          io.to(socketId).emit("connected", uuid);
        });
      }
    });
    socket.on("createConversation", async (friendId: string) => {
      await chat.createConversation(uuid, friendId);
      chat.getConversationsWithUsers(uuid).then((conversations) => {
        io.to(socket.id).emit("conversations", conversations);
      });
    });

    socket.on("sendMessage", async (newMessage: MessageEntity) => {
      if (!newMessage.conversation) return null;
      if (newMessage.type === MessageType.TEXT) {
        newMessage.message = censorText(newMessage.message);
      }

      const message = await chat.createMessage(newMessage);
      if (message) {
        if (message.conversation.id) {
          const activeConversations = await chat.getActiveUsers(
            newMessage.conversation.id
          );
          redisClient.get(`${KEY_PREFIX}socketid:${uuid}`).then((socketId) => {
            if (socketId) {
              io.to(socketId).emit("newMessage", message);
            }
          });
          const conversations = await chat.getConversationUser(
            newMessage.conversation.id
          );
          conversations?.users.forEach((user) => {
            if (user.id !== uuid) {
              redisClient
                .get(`${KEY_PREFIX}socketid:${user.id}`)
                .then((socketId) => {
                  if (socketId) {
                    io.to(socketId).emit("newChatWindow", {
                      id: newMessage.conversation.id,
                      isOpen: true,
                      user: {
                        id: req.user?.id,
                        fullName: req.user?.fullName,
                        avatar: req.user?.avatar,
                        username: req.user?.username,
                      },
                    });
                  }
                });
            }
          });

          activeConversations.forEach((activeConversation) => {
            // io.to(activeConversation.socketId).emit("newMessage", message);
            if (activeConversation.user.id !== uuid) {
              redisClient
                .get(`${KEY_PREFIX}socketid:${activeConversation.user.id}`)
                .then((socketId) => {
                  if (socketId) {
                    io.to(socketId).emit("newChatWindow", {
                      id: activeConversation.conversationId,
                      isOpen: true,
                      user: {
                        id: req.user?.id,
                        fullName: req.user?.fullName,
                        avatar: req.user?.avatar,
                        username: req.user?.username,
                      },
                    });

                    io.to(socketId).emit("newMessage", message);
                  }

                  if (socketId === null) {
                    sendNotificationByUser(
                      activeConversation.user.id,
                      `${activeConversation.user.fullName} đã gửi tin nhắn`,
                      message.message
                    );
                  }
                });
            }
          });
        }
      }
      return null;
    });
    socket.on("joinConversation", async (friendId: string) => {
      const activeConversation = await chat.joinConversation(
        friendId,
        uuid,
        socket.id
      );

      if (activeConversation) {
        const messages = await chat.getMessages(
          activeConversation.conversationId
        );
        io.to(socket.id).emit("messages", messages.reverse());
      }
    });
    socket.on("chatWindowJoinConversation", async (conversationId: number) => {
      if (conversationId) {
        const messages = await chat.getMessages(conversationId);
        io.to(socket.id).emit("chatWindowMessages", messages.reverse());
      }
    });

    socket.on("leaveConversation", () => {
      chat.leaveConversation(socket.id);
    });
    socket.on("disconnect", async () => {
      const listFriendOnline = await chat.getSocketIdByUuid(uuid);

      await redisClient.del(`${KEY_PREFIX}userid:${uuid}`);
      await redisClient.del(`${KEY_PREFIX}socketid:${uuid}`);
      listFriendOnline?.map((socketId) => {
        io.to(socketId).emit("disconnected", uuid);
      });
    });
  });
}
