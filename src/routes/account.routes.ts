import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { postAccount, getBalance } from "../controllers/account.controller";

const router = Router();

router.post("/", authenticateToken, postAccount);
router.get("/:account_id/balance", authenticateToken, getBalance);

export default router;
