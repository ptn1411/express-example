import { Request, Response, Router } from "express";
import { checkApiAuthAccessToken } from "../middleware/checkAuth";
import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import { UserOnline } from "../entity/User-online";
import { Device } from "../entity/Device";
import { faker } from "@faker-js/faker";
import ormjson from "ormjson";
import { newFriends } from "../services/friend";
import argon2 from "argon2";
import { Post } from "../entity/Post";
import { v4 as uuidv4 } from "uuid";
import redisClient from "../redis";
import { KEY_PREFIX } from "../constants";

const router = Router();

function dbUser() {
  return new ormjson("userFake.json");
}

router.get(
  "/search",
  checkApiAuthAccessToken,
  async (req: Request, res: Response) => {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(404).send("Bad Request");
    }
    const data = await AppDataSource.getRepository(User)
      .createQueryBuilder("user")
      .where("user.fullName LIKE :keyword", { keyword: `%${keyword}%` })
      .orWhere("user.username LIKE :keyword", { keyword: `%${keyword}%` })
      .select(["user.id", "user.username", "user.fullName", "user.avatar"])
      .limit(10)
      .getMany();
    return res.json({
      code: 200,
      success: true,
      users: data,
    });
  }
);

router.put(
  "/online",
  checkApiAuthAccessToken,
  async (req: Request, res: Response) => {
    const uuid = req.user?.id;
    if (!uuid) {
      return res.status(401).send("Unauthorized");
    }

    try {
      const existingUserOnline = await UserOnline.findOneBy({
        user: {
          id: uuid,
        },
      });

      if (existingUserOnline) {
        existingUserOnline.updateAt = new Date();
        await AppDataSource.manager.save(existingUserOnline);
        return res.json({
          code: 200,
          success: true,
          lastOnline: existingUserOnline.updateAt,
        });
      }
      const newUserOnline = await UserOnline.create({
        user: {
          id: uuid,
        },
      });
      await redisClient.set(`${KEY_PREFIX}userid:${uuid}`, uuid);
      await AppDataSource.manager.save(newUserOnline);
      return res.json({
        code: 200,
        success: true,
        lastOnline: newUserOnline.updateAt,
      });
    } catch (error) {
      return res.json({
        code: 500,
        success: false,
      });
    }
  }
);
router.post(
  "/notification/subscription",
  checkApiAuthAccessToken,
  async (req: Request, res: Response) => {
    const uuid = req.user?.id;
    const { subscription, agent } = req.body;
    if (!uuid) {
      return res.status(401).send("Unauthorized");
    }
    const ip = req.ip;
    const existingUser = await User.findOneBy({
      id: uuid,
    });
    if (!existingUser) {
      return res.status(404).send("Not found");
    }
    const existingDevice = await Device.findOneBy({
      user: {
        id: uuid,
      },
    });

    if (existingDevice) {
      existingDevice.ip = ip;
      existingDevice.agent = agent;
      existingDevice.subscription = JSON.stringify(subscription);
      await AppDataSource.manager.save(existingDevice);
      return res.send(ip);
    }
    const newDevice = await Device.create({
      user: {
        id: uuid,
      },
      ip,
      agent,
      subscription: JSON.stringify(subscription),
    });
    await AppDataSource.manager.save(newDevice);
    return res.send(ip);
  }
);
router.get("/new", async (req: Request, res: Response) => {
  if (req.query.auth != "7tbrBTVtUA795RKutQ") {
    return res.status(401).send("Unauthorized");
  }
  const password = faker.internet.password();
  const username = faker.internet.userName();
  const hashPassword = await argon2.hash(password);

  const newUser = User.create({
    username,
    password: hashPassword,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    fullName: faker.name.fullName(),
    phone: faker.phone.number(),
    email: faker.internet.email(),
    birthday: String(faker.date.birthdate()),
    sex: faker.datatype.boolean(),
    avatar:
      "https://api.phamthanhnam.com/image/n/20230423-useravatar-1682214795690.png",
    coverImage:
      "https://api.phamthanhnam.com/image/n/20230423-backgroundlogin-1682214873268.png",
    statusEmail: "confirmed",
  });
  await AppDataSource.manager.save(newUser);
  await dbUser()
    .create({
      id: newUser.id,
      username,
      password,
      fullName: newUser.fullName,
    })
    .save();
  return res.json({
    code: 200,
    success: true,
    user: newUser,
  });
});
router.get("/friend", async (req: Request, res: Response) => {
  if (req.query.auth != "7tbrBTVtUA795RKutQ") {
    return res.status(401).send("Unauthorized");
  }
  const data = await dbUser().findAll();
  for (let i = 0; i < data.length; i++) {
    if (i < data.length - 5) {
      await newFriends(data[i].id, data[i + 1].id);
      await newFriends(data[i].id, data[i + 2].id);
      await newFriends(data[i].id, data[i + 3].id);
      await newFriends(data[i].id, data[i + 4].id);
    }
  }
  // const friend = await newFriends(creator, receiver);
  return res.json({
    code: 200,
    success: true,
    data,
  });
});
router.get("/post", async (req: Request, res: Response) => {
  if (req.query.auth != "7tbrBTVtUA795RKutQ") {
    return res.status(401).send("Unauthorized");
  }

  const dataUser = await dbUser().findAll();

  for (let i = 0; i < dataUser.length; i++) {
    const user = await User.findOneBy({
      id: dataUser[i].id,
    });
    if (user) {
      for (let j = 0; j < 50; j++) {
        const uuid = uuidv4();
        const newPost = Post.create();
        newPost.uuid = uuid;
        newPost.user = user;
        newPost.images = [];
        newPost.content = faker.lorem.paragraph();
        newPost.shares = 0;
        await await AppDataSource.manager.save(newPost);
      }
    }
  }
  return res.json({
    code: 200,
    success: true,
  });
});
export default router;
