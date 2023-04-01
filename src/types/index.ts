import "express-session";
import { User } from "../entity/User";
declare module "express-session" {
  interface SessionData {
    userId?: string;
    cookie: Cookie;
  }
}
declare module "express-serve-static-core" {
  export interface Request {
    user?: User;
  }
}
