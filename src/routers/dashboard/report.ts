import { Request, Response, Router } from "express";
import { AppDataSource } from "../../data-source";
import { Report } from "../../entity/Report";
import { Post } from "../../entity/Post";

const router = Router();

const VALID_STATUSES = ["pending", "resolved", "rejected"];

// Danh sách tất cả reports — kèm thông tin đầy đủ người báo cáo + bài viết + tác giả
router.get("/", async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const status = req.query.status as string | undefined;

  const whereClause = status && VALID_STATUSES.includes(status) ? { status } : undefined;

  try {
    const [reports, totalCount] = await AppDataSource.getRepository(Report).findAndCount({
      where: whereClause,
      select: {
        id: true,
        status: true,
        createAt: true,
        user: { id: true, username: true, fullName: true, avatar: true },
        post: {
          uuid: true,
          content: true,
          createAt: true,
          user: { id: true, username: true, fullName: true, avatar: true },
        },
      },
      relations: ["user", "post", "post.user"],
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

// Danh sách bài viết bị báo cáo, nhóm theo bài — sắp xếp theo số report giảm dần
router.get("/posts", async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const status = req.query.status as string | undefined;

  try {
    const qb = AppDataSource.getRepository(Report)
      .createQueryBuilder("report")
      .select("post.uuid", "postUuid")
      .addSelect("post.content", "content")
      .addSelect("post.createAt", "postCreatedAt")
      .addSelect("author.id", "authorId")
      .addSelect("author.username", "authorUsername")
      .addSelect("author.fullName", "authorFullName")
      .addSelect("author.avatar", "authorAvatar")
      .addSelect("COUNT(report.id)", "totalReports")
      .addSelect("SUM(CASE WHEN report.status = 'pending' THEN 1 ELSE 0 END)", "pendingReports")
      .addSelect("MAX(report.createAt)", "lastReportedAt")
      .innerJoin("report.post", "post")
      .innerJoin("post.user", "author")
      .groupBy("post.uuid")
      .orderBy("totalReports", "DESC");

    if (status && VALID_STATUSES.includes(status)) {
      qb.where("report.status = :status", { status });
    }

    const totalRaw = await qb.clone().select("COUNT(DISTINCT post.uuid)", "cnt").getRawOne();
    const totalCount = Number(totalRaw?.cnt ?? 0);

    const posts = await qb
      .limit(limit)
      .offset((page - 1) * limit)
      .getRawMany();

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

// Chi tiết 1 report — đầy đủ thông tin bài viết (ảnh, tác giả) + người báo cáo
router.get("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ code: 400, success: false, message: "Invalid report id" });
  }

  try {
    const report = await AppDataSource.getRepository(Report).findOne({
      where: { id },
      select: {
        id: true,
        status: true,
        createAt: true,
        user: { id: true, username: true, fullName: true, avatar: true },
        post: {
          uuid: true,
          content: true,
          images: true,
          shares: true,
          createAt: true,
          user: { id: true, username: true, fullName: true, avatar: true },
        },
      },
      relations: ["user", "post", "post.user"],
    });

    if (!report) {
      return res.status(404).json({ code: 404, success: false, message: "Report not found" });
    }

    // Đếm tổng số report cho bài viết này
    const totalReportsForPost = report.post
      ? await AppDataSource.getRepository(Report).count({ where: { post: { uuid: report.post.uuid } } })
      : 0;

    return res.json({
      code: 200,
      success: true,
      report,
      totalReportsForPost,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, success: false, message: "Server error" });
  }
});

router.put("/:id/status", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ code: 400, success: false, message: "Invalid status" });
  }

  try {
    const report = await AppDataSource.getRepository(Report).findOneBy({ id });
    if (!report) {
      return res.status(404).json({ code: 404, success: false, message: "Report not found" });
    }
    report.status = status;
    await report.save();
    return res.json({ code: 200, success: true, message: "Status updated", report });
  } catch (error) {
    return res.status(500).json({ code: 500, success: false, message: "Server error" });
  }
});

// Giải quyết tất cả reports của 1 bài cùng lúc (khi xóa hoặc bỏ qua toàn bộ)
router.put("/post/:postId/resolve-all", async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { status } = req.body;

  if (!["resolved", "rejected"].includes(status)) {
    return res.status(400).json({ code: 400, success: false, message: "Status must be resolved or rejected" });
  }

  try {
    const post = await Post.findOneBy({ uuid: postId });
    if (!post) {
      return res.status(404).json({ code: 404, success: false, message: "Post not found" });
    }

    await AppDataSource.getRepository(Report)
      .createQueryBuilder("report")
      .update()
      .set({ status })
      .where("report.post = :postId", { postId })
      .andWhere("report.status = 'pending'")
      .execute();

    return res.json({ code: 200, success: true, message: `All pending reports marked as ${status}` });
  } catch (error) {
    return res.status(500).json({ code: 500, success: false, message: "Server error" });
  }
});

export default router;
