import { Router } from "express";
import user from "./user";
import { checkApiAuthAccessToken } from "../../middleware/checkAuth";
import { checkRole } from "../../middleware/checkRole";
import { Role } from "../../constants";

const router = Router();

router.use("/user", checkApiAuthAccessToken, checkRole(Role.ADMIN), user);

export default router;
