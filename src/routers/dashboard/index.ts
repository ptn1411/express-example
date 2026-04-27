import { Router } from "express";
import user from "./user";
import { checkApiAuthAccessToken } from "../../middleware/checkAuth";
import { checkRole } from "../../middleware/checkRole";
import { Role } from "../../constants";
import post from "./post";
import friend from "./friend";
import report from "./report";
import stats from "./stats";

const router = Router();

router.use("/user", checkApiAuthAccessToken, checkRole([Role.ADMIN]), user);
router.use("/post", checkApiAuthAccessToken, checkRole([Role.ADMIN]), post);
router.use("/friend", checkApiAuthAccessToken, checkRole([Role.ADMIN]), friend);
router.use("/reports", checkApiAuthAccessToken, checkRole([Role.ADMIN]), report);
router.use("/stats", checkApiAuthAccessToken, checkRole([Role.ADMIN]), stats);

export default router;
