import { Router } from "express";
import { profileController } from "./controllers/profileController";
import { proxyController } from "./controllers/proxyController";
const router = Router();

router.use("/profile", profileController);
router.use("/proxy", proxyController);
export default router;
