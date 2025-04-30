import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { postAccount, getBalance } from "../controllers/account.controller";
import { getAccountOwners } from "../controllers/accountOwner.controller";

const router = Router();

router.post("/", authenticateToken, postAccount);
router.get("/:account_id/balance", authenticateToken, getBalance);
router.get("/:account_id/owners", authenticateToken, getAccountOwners);

export default router;
