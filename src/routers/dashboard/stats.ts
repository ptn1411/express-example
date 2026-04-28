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

function getDateRanges() {
  const today = new Date(dateNow().date);

  const dayOfWeek = today.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - daysFromMonday);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  return { today, startOfWeek, startOfMonth };
}

router.get("/overview", async (_req: Request, res: Response) => {
  const { today } = getDateRanges();

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

router.get("/users", async (_req: Request, res: Response) => {
  const { today, startOfWeek, startOfMonth } = getDateRanges();

  try {
    const [
      total,
      todayCount,
      weekCount,
      monthCount,
      roleUser,
      rolePremium,
      roleAdmin,
      emailNew,
      emailPending,
      emailConfirmed,
      emailExpired,
      topPosters,
    ] = await Promise.all([
      AppDataSource.getRepository(User).count(),
      AppDataSource.getRepository(User).count({ where: { createAt: MoreThanOrEqual(today) } }),
      AppDataSource.getRepository(User).count({ where: { createAt: MoreThanOrEqual(startOfWeek) } }),
      AppDataSource.getRepository(User).count({ where: { createAt: MoreThanOrEqual(startOfMonth) } }),
      AppDataSource.getRepository(User).count({ where: { role: Role.USER } }),
      AppDataSource.getRepository(User).count({ where: { role: Role.PREMIUM } }),
      AppDataSource.getRepository(User).count({ where: { role: Role.ADMIN } }),
      AppDataSource.getRepository(User).count({ where: { statusEmail: "new" } }),
      AppDataSource.getRepository(User).count({ where: { statusEmail: "pending" } }),
      AppDataSource.getRepository(User).count({ where: { statusEmail: "confirmed" } }),
      AppDataSource.getRepository(User).count({ where: { statusEmail: "expired " } }),
      AppDataSource.getRepository(Post)
        .createQueryBuilder("post")
        .select("user.id", "id")
        .addSelect("user.username", "username")
        .addSelect("user.fullName", "fullName")
        .addSelect("user.avatar", "avatar")
        .addSelect("COUNT(post.uuid)", "postCount")
        .innerJoin("post.user", "user")
        .groupBy("user.id")
        .orderBy("postCount", "DESC")
        .limit(5)
        .getRawMany(),
    ]);

    return res.json({
      code: 200,
      success: true,
      registrations: { total, today: todayCount, thisWeek: weekCount, thisMonth: monthCount },
      byRole: { user: roleUser, premium: rolePremium, admin: roleAdmin },
      byEmailStatus: {
        new: emailNew,
        pending: emailPending,
        confirmed: emailConfirmed,
        expired: emailExpired,
      },
      topPosters,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, success: false, message: "Server error" });
  }
});

router.get("/posts", async (_req: Request, res: Response) => {
  const { today, startOfWeek, startOfMonth } = getDateRanges();

  try {
    const [
      total,
      todayCount,
      weekCount,
      monthCount,
      topPosters,
    ] = await Promise.all([
      AppDataSource.getRepository(Post).count(),
      AppDataSource.getRepository(Post).count({ where: { createAt: MoreThanOrEqual(today) } }),
      AppDataSource.getRepository(Post).count({ where: { createAt: MoreThanOrEqual(startOfWeek) } }),
      AppDataSource.getRepository(Post).count({ where: { createAt: MoreThanOrEqual(startOfMonth) } }),
      AppDataSource.getRepository(Post)
        .createQueryBuilder("post")
        .select("user.id", "id")
        .addSelect("user.username", "username")
        .addSelect("user.fullName", "fullName")
        .addSelect("user.avatar", "avatar")
        .addSelect("COUNT(post.uuid)", "postCount")
        .innerJoin("post.user", "user")
        .groupBy("user.id")
        .orderBy("postCount", "DESC")
        .limit(5)
        .getRawMany(),
    ]);

    return res.json({
      code: 200,
      success: true,
      total,
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      topPosters,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, success: false, message: "Server error" });
  }
});

router.get("/friends", async (_req: Request, res: Response) => {
  const { today, startOfWeek, startOfMonth } = getDateRanges();

  try {
    const [
      total,
      todayCount,
      weekCount,
      monthCount,
      pending,
      declined,
    ] = await Promise.all([
      AppDataSource.getRepository(Friends).count({ where: { status: FriendStatus.ACCEPTED } }),
      AppDataSource.getRepository(Friends).count({
        where: { status: FriendStatus.ACCEPTED, createAt: MoreThanOrEqual(today) },
      }),
      AppDataSource.getRepository(Friends).count({
        where: { status: FriendStatus.ACCEPTED, createAt: MoreThanOrEqual(startOfWeek) },
      }),
      AppDataSource.getRepository(Friends).count({
        where: { status: FriendStatus.ACCEPTED, createAt: MoreThanOrEqual(startOfMonth) },
      }),
      AppDataSource.getRepository(Friends).count({ where: { status: FriendStatus.PENDING } }),
      AppDataSource.getRepository(Friends).count({ where: { status: FriendStatus.DECLINED } }),
    ]);

    return res.json({
      code: 200,
      success: true,
      accepted: { total, today: todayCount, thisWeek: weekCount, thisMonth: monthCount },
      pending,
      declined,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, success: false, message: "Server error" });
  }
});

router.get("/reports", async (_req: Request, res: Response) => {
  const { today, startOfWeek, startOfMonth } = getDateRanges();

  try {
    const [
      total,
      todayCount,
      weekCount,
      monthCount,
      pending,
      resolved,
      rejected,
      mostReported,
    ] = await Promise.all([
      AppDataSource.getRepository(Report).count(),
      AppDataSource.getRepository(Report).count({ where: { createAt: MoreThanOrEqual(today) } }),
      AppDataSource.getRepository(Report).count({ where: { createAt: MoreThanOrEqual(startOfWeek) } }),
      AppDataSource.getRepository(Report).count({ where: { createAt: MoreThanOrEqual(startOfMonth) } }),
      AppDataSource.getRepository(Report).count({ where: { status: "pending" } }),
      AppDataSource.getRepository(Report).count({ where: { status: "resolved" } }),
      AppDataSource.getRepository(Report).count({ where: { status: "rejected" } }),
      AppDataSource.getRepository(Report)
        .createQueryBuilder("report")
        .select("post.uuid", "postUuid")
        .addSelect("post.content", "content")
        .addSelect("COUNT(report.id)", "reportCount")
        .innerJoin("report.post", "post")
        .groupBy("post.uuid")
        .orderBy("reportCount", "DESC")
        .limit(5)
        .getRawMany(),
    ]);

    return res.json({
      code: 200,
      success: true,
      total,
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      byStatus: { pending, resolved, rejected },
      mostReported,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, success: false, message: "Server error" });
  }
});

export default router;
