import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { getTopUsers } from "../controllers/report.controller";

const router = Router();

router.get("/topUsers", authenticateToken, getTopUsers);

export default router;
