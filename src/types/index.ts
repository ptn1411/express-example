import { User } from "../entity/User";

declare module "express-serve-static-core" {
  export interface Request {
    user?: User;
  }
}
