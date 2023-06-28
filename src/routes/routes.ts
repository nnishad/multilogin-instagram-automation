import { Router } from "express";
import { profileController } from "./controllers/profileController";
import { proxyController } from "./controllers/proxyController";
import { mockSMSPoolController } from "./controllers/mockSMSPool";
import { accountController } from "./controllers/accountController";

const router = Router();

router.use("/profile", profileController);
router.use("/proxy", proxyController);
router.use("/account", accountController);
router.use("/", mockSMSPoolController);
export default router;
