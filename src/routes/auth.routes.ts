import { Router } from "express";
import { createToken } from "../controllers/auth.controller";

const router = Router();

router.post("/token", createToken);

export default router;
