import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { createAccount, getAccountBalance } from "../services/account.service";
import { ApiResponse } from "../utils/response";
import { validateRequiredFields } from "../utils/validateRequiredFields";

export const postAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user_id = Number(req.user?.id);

    const isValid = validateRequiredFields(res, { user_id }, ["user_id"]);

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

    const isValid = validateRequiredFields(res, { user_id, account_id }, ["user_id", "account_id"]);

    if (!isValid) {
      return;
    }

    const balance = await getAccountBalance(user_id, Number(account_id));

    ApiResponse.success(res, 200, {
      message: "Balance retrieved successfully",
      code: "BALANCE_RETRIEVED",
      data: { balance },
    });
  } catch (error: any) {
    const errorMap: Record<string, { status: number; code: string }> = {
      "Account not found": { status: 404, code: "ACCOUNT_NOT_FOUND" },
      "Unauthorized access to account": { status: 403, code: "RETRIEVE_ACCOUNT_NOT_AUTHORIZED" },
    };

    if (error.message && errorMap[error.message]) {
      const { status, code } = errorMap[error.message];
      ApiResponse.error(res, status, {
        message: error.message,
        code,
      });
      return;
    }

    ApiResponse.failSafe(res, error);
  }
};
