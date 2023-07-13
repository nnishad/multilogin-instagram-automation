import { Router } from "express";
import { profileController } from "./controllers/profileController";
import { proxyController } from "./controllers/proxyController";
import { mockController } from "./controllers/mockController";
import { accountController } from "./controllers/accountController";

const router = Router();

router.use("/profile", profileController);
router.use("/proxy", proxyController);
router.use("/account", accountController);
router.use("/mock", mockController);
export default router;
