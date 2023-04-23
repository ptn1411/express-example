import { NextFunction, Request, Response } from "express";
import { Role } from "../constants";

export const checkRole = (filter: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role === filter) {
      return next();
    }
    return res.json({
      code: 403,
      success: false,
      message: "error",
    });
  };
};
