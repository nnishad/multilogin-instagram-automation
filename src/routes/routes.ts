import { Router } from "express";
import { profileController } from "./controllers/profileController";
import { proxyController } from "./controllers/proxyController";
import { mockSMSPoolController } from "./controllers/mockSMSPool";

const router = Router();

router.use("/profile", profileController);
router.use("/proxy", proxyController);
router.use("/", mockSMSPoolController);
export default router;
