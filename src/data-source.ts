import "reflect-metadata";
import path from "path";
import { __prod__ } from "./constants";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Post } from "./entity/Post";
import { Image } from "./entity/Image";

import { Like } from "./entity/Like";
import { Comment } from "./entity/Comment";
import { Bookmark } from "./entity/Bookmark";
import { Friends } from "./entity/Friends";
import { ActiveConversationEntity } from "./entity/Active-conversation";
import { ConversationEntity } from "./entity/Conversation";
import { MessageEntity } from "./entity/Message";
import { UserOnline } from "./entity/User-online";
import { Device } from "./entity/Device";
import { ProfileUser } from "./entity/Profile-user";
import { UserNotifications } from "./entity/UserNotifications";
import { Notifications } from "./entity/Notifications";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  logging: false,
  ...(__prod__ ? {} : { synchronize: true }),
  entities: [
    User,
    Post,
    Image,
    Like,
    Comment,
    Bookmark,
    Friends,
    ActiveConversationEntity,
    ConversationEntity,
    MessageEntity,
    UserOnline,
    Device,
    ProfileUser,
    UserNotifications,
    Notifications,
  ],

  migrations: [path.join(__dirname, "/migrations/*")],
});
