import { Request, Response, Router } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.send("Server");
});

router.get("/dev", (_req: Request, res: Response) => {
  res.send("Server dev");
});
router.get("/3005", (_req: Request, res: Response) => {
  res.send("Server 3005");
});
router.get("/3006", (_req: Request, res: Response) => {
  res.send("Server 3006");
});
router.get("/3007", (_req: Request, res: Response) => {
  res.send("Server 3005");
});
router.get("/3008", (_req: Request, res: Response) => {
  res.send("Server 3006");
});
export default router;
