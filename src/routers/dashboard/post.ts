import { Request, Response, Router } from "express";
import { MoreThanOrEqual } from "typeorm";
import { Post } from "../../entity/Post";
import { dateNow } from "../../utils";

const router = Router();

router.get("/all", async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const [posts, totalCount] = await Post.findAndCount({
    select: {
      uuid: true,
      content: true,
      createAt: true,
    },
    relations: ["user"],
    order: { createAt: "DESC" },
    take: limit,
    skip: (page - 1) * limit,
  });

  res.json({
    code: 200,
    success: true,
    posts,
    page,
    limit,
    totalCount,
    hasNextPage: (page - 1) * limit + posts.length < totalCount,
  });
});

router.get("/new", async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const time = new Date(dateNow().date);

  const [posts, totalCount] = await Post.findAndCount({
    where: { createAt: MoreThanOrEqual(time) },
    select: {
      uuid: true,
      content: true,
      createAt: true,
    },
    order: { createAt: "DESC" },
    take: limit,
    skip: (page - 1) * limit,
  });

  res.json({
    code: 200,
    success: true,
    posts,
    page,
    limit,
    totalCount,
    hasNextPage: (page - 1) * limit + posts.length < totalCount,
  });
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const post = await Post.findOneBy({ uuid: id });
    if (!post) {
      return res.status(404).json({ code: 404, success: false, message: "Post not found" });
    }
    await post.softRemove();
    return res.json({ code: 200, success: true, message: "Post deleted" });
  } catch (error) {
    return res.status(500).json({ code: 500, success: false, message: "Server error" });
  }
});

export default router;
