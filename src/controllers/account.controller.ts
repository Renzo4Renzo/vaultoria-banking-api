import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { createAccount } from "../services/account.service";
import { ApiResponse } from "../utils/response";

export const postAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      ApiResponse.error(res, 400, { message: `user_id is required`, code: "VALIDATION_MISSING_FIELDS" });
      return;
    }

    const account = await createAccount(user_id);

    ApiResponse.success(res, 201, {
      message: "Account created successfully",
      code: "ACCOUNT_CREATED",
      data: account,
    });
  } catch (error: any) {
    if (error.message && error.message === "User not found") {
      ApiResponse.error(res, 400, {
        message: error.message,
        code: "USER_NOT_FOUND",
      });
      return;
    }

    ApiResponse.failSafe(res, error);
  }
};
