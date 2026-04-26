import cors from "cors";
import dotenv from "dotenv";
import express, { Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import "reflect-metadata";
dotenv.config();

import compression from "compression";
import cookieParser from "cookie-parser";
import { AppDataSource } from "./data-source";
import router from "./routers/index";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginLandingPageDisabled } from "@apollo/server/plugin/disabled";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolver/Hello";
import { UserResolver } from "./resolver/User";

import { Context } from "./types/Context";

import { ORIGIN, __prod__ } from "./constants";
import { BookmarkResolver } from "./resolver/bookmark";
import { CommentResolver } from "./resolver/comment";
import { ImageResolver } from "./resolver/image";
import { LikeResolver } from "./resolver/like";
import { PostResolver } from "./resolver/post";

import http from "http";
import { Server as SocketIO } from "socket.io";
import { FriendsResolver } from "./resolver/friends";

import { socketMiddleware } from "./middleware/checkAuth";
import { ProfileResolver } from "./resolver/profile";
import socket from "./routers/socket";

AppDataSource.initialize()
  .then(async () => {
    const app: Express = express();
    const server = new http.Server(app);
    const port = process.env.PORT;

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

    const globalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    });
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: "Too many requests, please try again later." },
    });
    app.use(globalLimiter);

    const apolloServer = new ApolloServer<Pick<Context, "req" | "res">>({
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
      plugins: [
        __prod__
          ? ApolloServerPluginLandingPageDisabled()
          : ApolloServerPluginLandingPageLocalDefault({ embed: true }),
      ],
    });
    await apolloServer.start();

    app.use("/graphql", authLimiter);
    app.use("/refresh_token", authLimiter);
    app.use(
      "/graphql",
      cors<cors.CorsRequest>({ credentials: true, origin: ORIGIN }),
      express.json({ limit: "64mb" }),
      expressMiddleware(apolloServer, {
        context: async ({ req, res }: { req: any; res: any }): Promise<Pick<Context, "req" | "res">> => ({
          req,
          res,
        }),
      })
    );

    app.use(
      helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false })
    );
    app.use(
      compression({
        level: 6,
        threshold: 100 * 1000,
        filter: shouldCompress,
      }) as any
    );

    function shouldCompress(req: any, res: any) {
      if (req.headers["x-no-compression"]) {
        return false;
      }
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
