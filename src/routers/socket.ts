import { Socket } from "socket.io";
import { Request } from "express";
import * as chat from "../services/chat";
import { MessageEntity } from "../entity/Message";
import { sendNotificationByUser } from "../services/notification";
import { isOnlineUserById } from "../services/user";

export default function (io: Socket | any) {
  io.on("connection", function (socket: Socket | any) {
    const req = socket.request as Request;
    const uuid = req.user?.id;
    if (!uuid) {
      chat.leaveConversation(socket.id).then(() => {
        socket.disconnect();
      });
      return;
    } else {
      chat.getConversationsWithUsers(uuid).then((conversations) => {
        io.to(socket.id).emit("conversations", conversations);
      });
    }

    socket.on("createConversation", async (friendId: string) => {
      await chat.createConversation(uuid, friendId);
      chat.getConversationsWithUsers(uuid).then((conversations) => {
        io.to(socket.id).emit("conversations", conversations);
      });
    });

    socket.on("sendMessage", async (newMessage: MessageEntity) => {
      if (!newMessage.conversation) return null;
      const message = await chat.createMessage(newMessage);
      if (message) {
        if (message.conversation.id) {
          const activeConversations = await chat.getActiveUsers(
            newMessage.conversation.id
          );
          activeConversations.forEach((activeConversation) => {
            io.to(activeConversation.socketId).emit("newMessage", message);
            if (activeConversation.user.id !== uuid) {
              isOnlineUserById(activeConversation.user.id).then((isOnline) => {
                if (!isOnline) {
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
        io.to(socket.id).emit("messages", messages);
      }
    });
    socket.on("leaveConversation", () => {
      chat.leaveConversation(socket.id);
    });
    socket.on("disconnect", () => {});
  });
}
