import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../utils/response";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: number };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    ApiResponse.error(res, 401, { message: `The request doesn't contain a token`, code: "MISSING_TOKEN" });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as { id: number };
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    ApiResponse.error(res, 403, { message: `The request contains an invalid token`, code: "INVALID_TOKEN" });
    return;
  }
};
