import { Request, Response, Router } from "express";
import { ILike, IsNull, MoreThanOrEqual, Not } from "typeorm";
import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";
import { Bookmark } from "../../entity/Bookmark";
import { Post } from "../../entity/Post";
import { Friends } from "../../entity/Friends";
import { Report } from "../../entity/Report";
import { Role, FriendStatus } from "../../constants";
import { dateNow } from "../../utils";
import { User_Status_Email } from "../../types/User";

const router = Router();

const VALID_EMAIL_STATUSES: User_Status_Email[] = ["new", "pending", "confirmed", "expired "];

router.get("/all", async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const search = req.query.search as string | undefined;
  const role = req.query.role as string | undefined;
  const statusEmail = req.query.statusEmail as string | undefined;

  const baseWhere: Record<string, unknown> = {};
  if (role && Object.values(Role).includes(role as Role)) {
    baseWhere.role = role;
  }
  if (statusEmail && VALID_EMAIL_STATUSES.includes(statusEmail as User_Status_Email)) {
    baseWhere.statusEmail = statusEmail;
  }

  const whereClause = search
    ? [
        { ...baseWhere, fullName: ILike(`%${search}%`) },
        { ...baseWhere, username: ILike(`%${search}%`) },
        { ...baseWhere, email: ILike(`%${search}%`) },
      ]
    : Object.keys(baseWhere).length > 0
    ? baseWhere
    : undefined;

  const [users, totalCount] = await User.findAndCount({
    where: whereClause as any,
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      role: true,
      statusEmail: true,
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

router.get("/deleted", async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  try {
    const [users, totalCount] = await AppDataSource.getRepository(User).findAndCount({
      withDeleted: true,
      where: { deletedAt: Not(IsNull()) },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        avatar: true,
        createAt: true,
        deletedAt: true,
      },
      order: { deletedAt: "DESC" },
      take: limit,
      skip: (page - 1) * limit,
    });

    return res.json({
      code: 200,
      success: true,
      users,
      page,
      limit,
      totalCount,
      hasNextPage: (page - 1) * limit + users.length < totalCount,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, success: false, message: "Server error" });
  }
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

    const [postCount, friendCount, bookmarkCount, reportCount] = await Promise.all([
      AppDataSource.getRepository(Post).count({ where: { user: { id } } }),
      AppDataSource.getRepository(Friends).count({
        where: [
          { creator: { id }, status: FriendStatus.ACCEPTED },
          { receiver: { id }, status: FriendStatus.ACCEPTED },
        ],
      }),
      AppDataSource.getRepository(Bookmark).count({ where: { user: { id } } }),
      AppDataSource.getRepository(Report).count({ where: { user: { id } } }),
    ]);

    return res.json({
      code: 200,
      success: true,
      user,
      stats: { postCount, friendCount, bookmarkCount, reportCount },
    });
  } catch (error) {
    return res.status(500).json({ code: 500, success: false, message: "Server error" });
  }
});

router.get("/:id/posts", async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  try {
    const user = await User.findOneBy({ id });
    if (!user) {
      return res.status(404).json({ code: 404, success: false, message: "User not found" });
    }

    const [posts, totalCount] = await AppDataSource.getRepository(Post).findAndCount({
      where: { user: { id } },
      select: { uuid: true, content: true, shares: true, createAt: true },
      order: { createAt: "DESC" },
      take: limit,
      skip: (page - 1) * limit,
    });

    return res.json({
      code: 200,
      success: true,
      posts,
      page,
      limit,
      totalCount,
      hasNextPage: (page - 1) * limit + posts.length < totalCount,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, success: false, message: "Server error" });
  }
});

router.get("/:id/friends", async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  try {
    const user = await User.findOneBy({ id });
    if (!user) {
      return res.status(404).json({ code: 404, success: false, message: "User not found" });
    }

    const [friendships, totalCount] = await AppDataSource.getRepository(Friends).findAndCount({
      where: [
        { creator: { id }, status: FriendStatus.ACCEPTED },
        { receiver: { id }, status: FriendStatus.ACCEPTED },
      ],
      select: {
        id: true,
        status: true,
        createAt: true,
        creator: { id: true, username: true, fullName: true, avatar: true },
        receiver: { id: true, username: true, fullName: true, avatar: true },
      },
      relations: ["creator", "receiver"],
      order: { createAt: "DESC" },
      take: limit,
      skip: (page - 1) * limit,
    });

    const friends = friendships.map((f) => (f.creator.id === id ? f.receiver : f.creator));

    return res.json({
      code: 200,
      success: true,
      friends,
      page,
      limit,
      totalCount,
      hasNextPage: (page - 1) * limit + friends.length < totalCount,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, success: false, message: "Server error" });
  }
});

router.get("/:id/reports", async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  try {
    const user = await User.findOneBy({ id });
    if (!user) {
      return res.status(404).json({ code: 404, success: false, message: "User not found" });
    }

    const [reports, totalCount] = await AppDataSource.getRepository(Report).findAndCount({
      where: { user: { id } },
      select: {
        id: true,
        status: true,
        createAt: true,
        post: { uuid: true, content: true },
      },
      relations: ["post"],
      order: { createAt: "DESC" },
      take: limit,
      skip: (page - 1) * limit,
    });

    return res.json({
      code: 200,
      success: true,
      reports,
      page,
      limit,
      totalCount,
      hasNextPage: (page - 1) * limit + reports.length < totalCount,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, success: false, message: "Server error" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { fullName, firstName, lastName, phone, birthday, sex } = req.body;

  try {
    const user = await User.findOneBy({ id });
    if (!user) {
      return res.status(404).json({ code: 404, success: false, message: "User not found" });
    }

    if (fullName !== undefined) user.fullName = String(fullName);
    if (firstName !== undefined) user.firstName = String(firstName);
    if (lastName !== undefined) user.lastName = String(lastName);
    if (phone !== undefined) user.phone = String(phone);
    if (birthday !== undefined) user.birthday = String(birthday);
    if (sex !== undefined) user.sex = Boolean(sex);

    await user.save();
    return res.json({ code: 200, success: true, message: "User updated", user: { id: user.id, fullName: user.fullName, firstName: user.firstName, lastName: user.lastName, phone: user.phone, birthday: user.birthday, sex: user.sex } });
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

router.put("/:id/email-status", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { statusEmail } = req.body;

  if (!VALID_EMAIL_STATUSES.includes(statusEmail)) {
    return res.status(400).json({ code: 400, success: false, message: "Invalid email status" });
  }

  try {
    const user = await User.findOneBy({ id });
    if (!user) {
      return res.status(404).json({ code: 404, success: false, message: "User not found" });
    }
    user.statusEmail = statusEmail as User_Status_Email;
    await user.save();
    return res.json({ code: 200, success: true, message: "Email status updated", statusEmail: user.statusEmail });
  } catch (error) {
    return res.status(500).json({ code: 500, success: false, message: "Server error" });
  }
});

router.post("/:id/restore", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id },
      withDeleted: true,
    });
    if (!user) {
      return res.status(404).json({ code: 404, success: false, message: "User not found" });
    }
    if (!user.deletedAt) {
      return res.status(400).json({ code: 400, success: false, message: "User is not deleted" });
    }
    await AppDataSource.getRepository(User).recover(user);
    return res.json({ code: 200, success: true, message: "User restored" });
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
