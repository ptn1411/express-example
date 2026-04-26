export const COOKIE_NAME = process.env.COOKIE_NAME as string;
export const DAY_TIME = 60 * 60 * 24;
export const __prod__ = process.env.NODE_ENV === "production";
export const REFRESH_TOKEN_COOKIE_NAME = process.env
  .REFRESH_TOKEN_COOKIE_NAME as string;
export const KEY_PREFIX = __prod__ ? "prod" : "dev";
export const REACTIONS_TYPE = ["LIKE", "LOVE", "HAHA", "WOW", "SAD", "ANGRY"];
export const ONLINE_WINDOW_MS = 5 * 60 * 1000;
export const MAX_PAGE_LIMIT = 50;
export const FriendStatus = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  DECLINED: "declined",
  NOT_SENT: "not-sent",
  WAITING: "waiting-for-current-user-response",
} as const;

export const ORIGIN = __prod__
  ? ([process.env.FRONTEND_URL, process.env.URL_APP].filter(Boolean) as string[])
  : [
      "http://localhost:3000",
      "http://localhost:8080",
    ];
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
