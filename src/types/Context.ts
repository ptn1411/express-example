import { Request, Response } from "express";
import { Session, SessionData } from "express-session";
import { User } from "../entity/User";

//session: Session & Partial<SessionData> & { userId?: number };
export type Context = {
  req: Request & {
    session: Session & Partial<SessionData>;
  };
  res: Response;
  user: Partial<User>;
};
