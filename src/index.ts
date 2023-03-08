import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import router from "./routers/index";
import { AppDataSource } from "./data-source";

import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolver/Hello";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { UserResolver } from "./resolver/User";
import SessionStore from "./utils/sessionStore";

AppDataSource.initialize()
  .then(async () => {
    const app: Express = express();

    const apolloServer = new ApolloServer({
      schema: await buildSchema({
        resolvers: [HelloResolver, UserResolver],
        validate: false,
      }),
      plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app, cors: false });
    const port = process.env.PORT;

    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));

    app.use(
      helmet({
        contentSecurityPolicy: false,
      })
    );
    app.use(
      cors({
        origin: "*",
        methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
        credentials: true,
        optionsSuccessStatus: 200,
      })
    );
    const sessionStore = SessionStore();
    app.use(morgan("combined"));
    app.use(
      session({
        secret: "keyboard cat",

        store: new sessionStore("data/session.json"),
        cookie: {
          maxAge: 1000 * 60 * 60,
          httpOnly: true,
          secure: true,
          sameSite: "lax",
        },
      })
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
