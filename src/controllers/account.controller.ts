import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { createAccount, getAccountBalance } from "../services/account.service";
import { ApiResponse } from "../utils/response";
import { validateRequiredFields } from "../utils/validateRequiredFields";
import { setMappedError } from "../utils/setMappedError";

export const postAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user_id = Number(req.user?.id);

    const isValid = validateRequiredFields(res, { user_id });

    if (!isValid) {
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

export const getBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user_id = Number(req.user?.id);
    const account_id = Number(req.params.account_id);

    const isValid = validateRequiredFields(res, { user_id, account_id });

    if (!isValid) {
      return;
    }

    const balance = await getAccountBalance(user_id, account_id);

    ApiResponse.success(res, 200, {
      message: "Balance retrieved successfully",
      code: "BALANCE_RETRIEVED",
      data: { balance },
    });
  } catch (error: any) {
    if (setMappedError(res, error)) {
      return;
    }

    ApiResponse.failSafe(res, error);
  }
};
