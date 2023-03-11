import { Request, Response } from "express";
import { Session, SessionData } from "express-session";

//session: Session & Partial<SessionData> & { userId?: number };
export type Context = {
  req: Request & {
    session: Session & Partial<SessionData>;
  };
  res: Response;
};
