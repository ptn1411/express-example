import { Request, Response, Router } from "express";
import { MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";
import { Post } from "../../entity/Post";
import { Friends } from "../../entity/Friends";
import { Report } from "../../entity/Report";
import { Role, FriendStatus } from "../../constants";
import { dateNow } from "../../utils";

const router = Router();

router.get("/overview", async (_req: Request, res: Response) => {
  const today = new Date(dateNow().date);

  try {
    const [
      totalUsers,
      todayUsers,
      userUsers,
      premiumUsers,
      adminUsers,
      totalPosts,
      todayPosts,
      totalFriendships,
      todayFriendships,
      totalReports,
      pendingReports,
    ] = await Promise.all([
      AppDataSource.getRepository(User).count(),
      AppDataSource.getRepository(User).count({ where: { createAt: MoreThanOrEqual(today) } }),
      AppDataSource.getRepository(User).count({ where: { role: Role.USER } }),
      AppDataSource.getRepository(User).count({ where: { role: Role.PREMIUM } }),
      AppDataSource.getRepository(User).count({ where: { role: Role.ADMIN } }),
      AppDataSource.getRepository(Post).count(),
      AppDataSource.getRepository(Post).count({ where: { createAt: MoreThanOrEqual(today) } }),
      AppDataSource.getRepository(Friends).count({ where: { status: FriendStatus.ACCEPTED } }),
      AppDataSource.getRepository(Friends).count({
        where: { status: FriendStatus.ACCEPTED, createAt: MoreThanOrEqual(today) },
      }),
      AppDataSource.getRepository(Report).count(),
      AppDataSource.getRepository(Report).count({ where: { status: "pending" } }),
    ]);

    return res.json({
      code: 200,
      success: true,
      users: {
        total: totalUsers,
        today: todayUsers,
        byRole: { user: userUsers, premium: premiumUsers, admin: adminUsers },
      },
      posts: { total: totalPosts, today: todayPosts },
      friendships: { total: totalFriendships, today: todayFriendships },
      reports: { total: totalReports, pending: pendingReports },
    });
  } catch (error) {
    return res.status(500).json({ code: 500, success: false, message: "Server error" });
  }
});

export default router;
