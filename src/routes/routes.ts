import { Router } from "express";
import { profileController } from "./controllers/profileController";
import { proxyController } from "./controllers/proxyController";
import { automationController } from "./controllers/automationController";
const router = Router();

router.use("/profile", profileController);
router.use("/proxy", proxyController);
router.use("/auto", automationController);

export default router;
