import path from "path";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { __prod__ } from "./constants";
import { ActiveConversationEntity } from "./entity/Active-conversation";
import { Bookmark } from "./entity/Bookmark";
import { Comment } from "./entity/Comment";
import { ConversationEntity } from "./entity/Conversation";
import { Device } from "./entity/Device";
import { Friends } from "./entity/Friends";
import { Image } from "./entity/Image";
import { Like } from "./entity/Like";
import { MessageEntity } from "./entity/Message";
import { Notifications } from "./entity/Notifications";
import { Post } from "./entity/Post";
import { ProfileUser } from "./entity/Profile-user";
import { Report } from "./entity/Report";
import { User } from "./entity/User";
import { UserOnline } from "./entity/User-online";
import { UserNotifications } from "./entity/UserNotifications";

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
    Report,
  ],

  migrations: [path.join(__dirname, "/migrations/*")],
});
