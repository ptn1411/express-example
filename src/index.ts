import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import cookieParser from "cookie-parser";
import compression from "compression";
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

import { createClient } from "redis";
import { ORIGIN, __prod__ } from "./constants";
import { PostResolver } from "./resolver/post";
import { ImageResolver } from "./resolver/image";
import { LikeResolver } from "./resolver/like";
import { CommentResolver } from "./resolver/comment";
import { BookmarkResolver } from "./resolver/bookmark";

import { FriendsResolver } from "./resolver/friends";
import http from "http";
import { Server as SocketIO } from "socket.io";

import socket from "./routers/socket";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { socketMiddleware } from "./middleware/checkAuth";
import { ProfileResolver } from "./resolver/profile";

AppDataSource.initialize()
  .then(async () => {
    const app: Express = express();
    const server = new http.Server(app);
    const port = process.env.PORT;
    let redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: 6379,
      },
      password: process.env.REDIS_PASSWORD,
    });
    redisClient.connect().catch(console.error);

    app.use(express.json({ limit: "64mb" }));
    app.use(express.urlencoded({ limit: "64mb", extended: true }));

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
          ProfileResolver,
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
    app.use(
      compression({
        level: 6,
        threshold: 100 * 1000,
        filter: shouldCompress,
      })
    );

    function shouldCompress(
      req: express.Request<
        ParamsDictionary,
        any,
        any,
        ParsedQs,
        Record<string, any>
      >,
      res: express.Response<any, Record<string, any>>
    ) {
      if (req.headers["x-no-compression"]) {
        // don't compress responses with this request header
        return false;
      }
      // fallback to standard filter function
      return compression.filter(req, res);
    }

    app.use("/", router);

    const io = new SocketIO(server, {
      cors: {
        origin: ORIGIN,
        credentials: true,
      },
    });

    io.engine.use(helmet());
    io.use((socket, next) => {
      socketMiddleware(socket, next);
    });
    socket(io);

    server.listen(port, () => {
      console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
  })
  .catch((error: any) => console.log(error));
