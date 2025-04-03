import { Router } from "express";
import { postUser } from "../controllers/user.controller";

const router = Router();

router.post("/", postUser);

export default router;
