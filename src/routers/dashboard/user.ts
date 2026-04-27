import { Request, Response, Router } from "express";
import { ILike, MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";
import { Bookmark } from "../../entity/Bookmark";
import { Post } from "../../entity/Post";
import { Friends } from "../../entity/Friends";
import { Role, FriendStatus } from "../../constants";
import { dateNow } from "../../utils";

const router = Router();

router.get("/all", async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const search = req.query.search as string | undefined;

  const whereClause = search
    ? [
        { fullName: ILike(`%${search}%`) },
        { username: ILike(`%${search}%`) },
        { email: ILike(`%${search}%`) },
      ]
    : undefined;

  const [users, totalCount] = await User.findAndCount({
    where: whereClause,
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      role: true,
      avatar: true,
      createAt: true,
    },
    order: { createAt: "DESC" },
    take: limit,
    skip: (page - 1) * limit,
  });

  res.json({
    code: 200,
    success: true,
    users,
    page,
    limit,
    totalCount,
    hasNextPage: (page - 1) * limit + users.length < totalCount,
  });
});

router.get("/new", async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const time = new Date(dateNow().date);

  const [users, totalCount] = await User.findAndCount({
    where: { createAt: MoreThanOrEqual(time) },
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      role: true,
      avatar: true,
      createAt: true,
    },
    order: { createAt: "DESC" },
    take: limit,
    skip: (page - 1) * limit,
  });

  res.json({
    code: 200,
    success: true,
    users,
    page,
    limit,
    totalCount,
    hasNextPage: (page - 1) * limit + users.length < totalCount,
  });
});

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        fullName: true,
        firstName: true,
        lastName: true,
        avatar: true,
        coverImage: true,
        role: true,
        statusEmail: true,
        birthday: true,
        sex: true,
        createAt: true,
        updateAt: true,
      },
    });
    if (!user) {
      return res.status(404).json({ code: 404, success: false, message: "User not found" });
    }

    const [postCount, friendCount, bookmarkCount] = await Promise.all([
      AppDataSource.getRepository(Post).count({ where: { user: { id } } }),
      AppDataSource.getRepository(Friends).count({
        where: [
          { creator: { id }, status: FriendStatus.ACCEPTED },
          { receiver: { id }, status: FriendStatus.ACCEPTED },
        ],
      }),
      AppDataSource.getRepository(Bookmark).count({ where: { user: { id } } }),
    ]);

    return res.json({
      code: 200,
      success: true,
      user,
      stats: { postCount, friendCount, bookmarkCount },
    });
  } catch (error) {
    return res.status(500).json({ code: 500, success: false, message: "Server error" });
  }
});

router.put("/:id/role", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  const adminId = req.user?.id;

  if (!Object.values(Role).includes(role)) {
    return res.status(400).json({ code: 400, success: false, message: "Invalid role" });
  }
  if (id === adminId) {
    return res.status(400).json({ code: 400, success: false, message: "Cannot change your own role" });
  }

  try {
    const user = await User.findOneBy({ id });
    if (!user) {
      return res.status(404).json({ code: 404, success: false, message: "User not found" });
    }
    user.role = role as Role;
    await user.save();
    return res.json({ code: 200, success: true, message: "Role updated", role: user.role });
  } catch (error) {
    return res.status(500).json({ code: 500, success: false, message: "Server error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminId = req.user?.id;

  if (id === adminId) {
    return res.status(400).json({ code: 400, success: false, message: "Cannot delete your own account" });
  }

  try {
    const user = await User.findOneBy({ id });
    if (!user) {
      return res.status(404).json({ code: 404, success: false, message: "User not found" });
    }
    await user.softRemove();
    return res.json({ code: 200, success: true, message: "User deleted" });
  } catch (error) {
    return res.status(500).json({ code: 500, success: false, message: "Server error" });
  }
});

export default router;
