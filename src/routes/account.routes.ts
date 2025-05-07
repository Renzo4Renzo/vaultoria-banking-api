import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { postAccount, getBalance } from "../controllers/account.controller";
import { addAccountOwner, deleteAccountOwner, getAccountOwners } from "../controllers/accountOwner.controller";

const router = Router();

router.post("/", authenticateToken, postAccount);
router.get("/:account_id/balance", authenticateToken, getBalance);

router.post("/:account_id/owners/:user_id", authenticateToken, addAccountOwner);
router.delete("/:account_id/owners/:user_id", authenticateToken, deleteAccountOwner);
router.get("/:account_id/owners", authenticateToken, getAccountOwners);

export default router;
