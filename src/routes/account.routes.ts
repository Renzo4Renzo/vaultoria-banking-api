import { Router } from "express";
import { postAccount } from "../controllers/account.controller";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.post("/", authenticateToken, postAccount);

export default router;
