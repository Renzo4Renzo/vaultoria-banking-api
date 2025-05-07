import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { deposit, transfer, withdraw } from "../controllers/transaction.controller";

const router = Router();

router.post("/deposit", authenticateToken, deposit);
router.post("/withdraw", authenticateToken, withdraw);
router.post("/transfer", authenticateToken, transfer);

export default router;
