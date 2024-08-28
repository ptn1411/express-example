import dotenv from "dotenv";
import Redis from "ioredis";
dotenv.config();

const redisClient = new Redis({
  port: 6379,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
  db: 3,
});

export default redisClient;
