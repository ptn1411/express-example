export const COOKIE_NAME = process.env.COOKIE_NAME as string;
export const DAY_TIME = 1000 * 60 * 60 * 24; //thoi gian mot ngay
export const SESSION_MAX_AGE = ((DAY_TIME * 365) / 12) * 3; //thoi gian 3 thang
export const __prod__ = process.env.NODE_ENV === "production";
export const REFRESH_TOKEN_COOKIE_NAME = process.env
  .REFRESH_TOKEN_COOKIE_NAME as string;
