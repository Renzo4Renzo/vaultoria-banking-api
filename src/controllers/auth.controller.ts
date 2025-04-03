import { Request, Response } from "express";
import { ApiResponse } from "../utils/response";
import { User } from "../models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const createToken = async (req: Request, res: Response): Promise<void> => {
  const { user_id } = req.body;

  if (!user_id && user_id !== 0) {
    ApiResponse.error(res, 400, { message: `user_id is required`, code: "VALIDATION_MISSING_FIELDS" });
    return;
  }

  const user = await User.findByPk(user_id);

  if (!user) {
    ApiResponse.error(res, 404, { message: `User not found`, code: "USER_NOT_FOUND" });
    return;
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "24h" });

  ApiResponse.success(res, 201, {
    message: "Token created successfully",
    code: "TOKEN_CREATED",
    data: { token },
  });
};
