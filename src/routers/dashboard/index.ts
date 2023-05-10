import { Router } from "express";
import user from "./user";
import { checkApiAuthAccessToken } from "../../middleware/checkAuth";
import { checkRole } from "../../middleware/checkRole";
import { Role } from "../../constants";
import post from "./post";
import friend from "./friend";
const router = Router();

router.use("/user", checkApiAuthAccessToken, checkRole([Role.ADMIN]), user);
router.use("/post", checkApiAuthAccessToken, checkRole([Role.ADMIN]), post);
router.use("/friend", checkApiAuthAccessToken, checkRole([Role.ADMIN]), friend);

export default router;
