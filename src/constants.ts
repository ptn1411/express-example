export const COOKIE_NAME = process.env.COOKIE_NAME as string;
export const DAY_TIME = 60 * 60 * 24; //thoi gian mot ngay
export const __prod__ = process.env.NODE_ENV === "production";
export const REFRESH_TOKEN_COOKIE_NAME = process.env
  .REFRESH_TOKEN_COOKIE_NAME as string;
export const KEY_PREFIX = __prod__ ? "prod" : "dev";
export const REACTIONS_TYPE = ["LIKE", "LOVE", "HAHA", "WOW", "SAD", "ANGRY"];

export const ORIGIN = __prod__
  ? ["http://phamthanhnam.com", "https://phamthanhnam.com", "phamthanhnam.com"]
  : ["http://localhost:3000", "http://localhost:3001", "http://localhost:8080"];
export enum Role {
  USER = "user",
  PREMIUM = "premium",
  ADMIN = "admin",
}
export enum LevelPassword {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}
