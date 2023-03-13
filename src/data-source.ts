import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Post } from "./entity/Post";
import path from "path";
import { __prod__ } from "./constants";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  ...(__prod__ ? {} : { synchronize: true }),
  entities: [User, Post],
  migrations: [path.join(__dirname, "/migrations/*")],
});
