import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redisClient = new Redis({
  port: 6379,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
});

export default redisClient;
