import { Request, Response, Router } from "express";
import { AppDataSource } from "../../data-source";
import { Report } from "../../entity/Report";

const router = Router();

const VALID_STATUSES = ["pending", "resolved", "rejected"];

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
        user: { id: true, username: true },
        post: { uuid: true, content: true },
      },
      relations: ["user", "post"],
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

export default router;
