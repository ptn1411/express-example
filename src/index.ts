import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import cookieParser from "cookie-parser";
import router from "./routers/index";
import { AppDataSource } from "./data-source";

import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolver/hello";
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} from "apollo-server-core";
import { UserResolver } from "./resolver/user";

import { Context } from "./types/Context";
import RedisStore from "connect-redis";
import { createClient } from "redis";
import { COOKIE_NAME, ORIGIN, SESSION_MAX_AGE, __prod__ } from "./constants";
import { PostResolver } from "./resolver/post";
import { ImageResolver } from "./resolver/image";
import { LikeResolver } from "./resolver/like";
import { CommentResolver } from "./resolver/comment";
import { BookmarkResolver } from "./resolver/bookmark";

import { FriendsResolver } from "./resolver/friends";

AppDataSource.initialize()
  .then(async () => {
    const app: Express = express();
    const port = process.env.PORT;
    let redisClient = createClient({
      socket: {
        host: "vps.phamthanhnam.com",
        port: 6379,
      },
      password: process.env.REDIS_PASSWORD,
    });
    redisClient.connect().catch(console.error);

    // Initialize store.
    let redisStore = new RedisStore({
      client: redisClient,
      prefix: `${COOKIE_NAME}:`,
      ttl: SESSION_MAX_AGE,
    });

    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));

    app.use(
      cors({
        origin: ORIGIN,
        methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
        credentials: true,
        optionsSuccessStatus: 200,
      })
    );

    app.use(morgan("dev"));
    app.set("trust proxy", 1);
    app.use(cookieParser());
    app.use(
      session({
        name: COOKIE_NAME,
        store: redisStore,
        secret: process.env.SECRET_SESSION_KEY as string,
        cookie: {
          maxAge: SESSION_MAX_AGE,
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          domain: "localhost",
          path: "/",
        },
        resave: false,
        saveUninitialized: false,
      })
    );

    const apolloServer = new ApolloServer({
      schema: await buildSchema({
        resolvers: [
          HelloResolver,
          UserResolver,
          PostResolver,
          ImageResolver,
          LikeResolver,
          CommentResolver,
          BookmarkResolver,
          FriendsResolver,
        ],
        validate: false,
      }),
      context: ({ req, res }): Pick<Context, "req" | "res"> => ({ req, res }),
      plugins: [
        __prod__
          ? ApolloServerPluginLandingPageDisabled()
          : ApolloServerPluginLandingPageGraphQLPlayground(),
      ],
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({
      app,
      cors: {
        credentials: true,
        origin: ORIGIN,
      },
    });
    app.use(
      helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false })
    );

    app.use("/", router);

    app.get("*", function (_req: Request, res: Response) {
      return res.json({
        code: 404,
      });
    });

    app.listen(port, () => {
      console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
  })
  .catch((error: any) => console.log(error));
