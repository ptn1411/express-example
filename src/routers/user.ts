import { Request, Response, Router } from "express";
import { checkApiAuthAccessToken } from "../middleware/checkAuth";
import { User } from "../entity/User";
import { AppDataSource } from "../data-source";

const router = Router();

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
    // .find({
    //   where: {
    //     fullName: Like(`%${keyword}%`),
    //   },

    //   select: {
    //     id: true,
    //     username: true,
    //     avatar: true,
    //     fullName: true,
    //   },
    // });
    return res.json({
      code: 200,
      success: true,
      users: data,
    });
  }
);

export default router;
