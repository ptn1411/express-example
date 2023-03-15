import { JwtPayload } from "jsonwebtoken";
import { User } from "../entity/User";

export type UserAuthPayload = JwtPayload & {
  user: User;
};
