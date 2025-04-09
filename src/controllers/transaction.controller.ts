import { Response } from "express";
import { depositIntoAccount, transferToAccount, withdrawFromAccount } from "../services/transaction.service";
import { AuthRequest } from "../middleware/auth";
import { ApiResponse } from "../utils/response";
import { validateRequiredFields } from "../utils/validateRequiredFields";

const errorMap: Record<string, { status: number; code: string }> = {
  "Account not found": { status: 404, code: "ACCOUNT_NOT_FOUND" },
  "Source account not found": { status: 404, code: "SOURCE_ACCOUNT_NOT_FOUND" },
  "Destination account not found": { status: 404, code: "DESTINATION_ACCOUNT_NOT_FOUND" },
  "Unauthorized access to account": { status: 403, code: "TRANSACTION_NOT_AUTHORIZED" },
  "Insufficient balance": { status: 409, code: "INSUFFICIENT_BALANCE" },
};

export const deposit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user_id = Number(req.user?.id);
    const { to_account_id, amount } = req.body;
    const idempotencyKey = req.header("Idempotency-Key") || undefined;

    const isValid = validateRequiredFields(res, { user_id, ...req.body }, ["user_id", "to_account_id", "amount"]);

    if (!isValid) {
      return;
    }

    if (Number(amount) <= 0) {
      ApiResponse.error(res, 400, {
        message: "Invalid amount",
        code: "INVALID_DEPOSIT_AMOUNT",
      });
      return;
    }

    const depositTransaction = await depositIntoAccount({ user_id, to_account_id, amount, request_id: idempotencyKey });

    ApiResponse.success(res, 200, {
      message: "Deposit completed successfully",
      code: "DEPOSIT_TRANSACTION_SUCCEDED",
      data: depositTransaction,
    });
  } catch (error: any) {
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

export const withdraw = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user_id = Number(req.user?.id);
    const { from_account_id, amount } = req.body;
    const idempotencyKey = req.header("Idempotency-Key") || undefined;

    const isValid = validateRequiredFields(res, { user_id, ...req.body }, ["user_id", "from_account_id", "amount"]);

    if (!isValid) {
      return;
    }

    if (Number(amount) <= 0) {
      ApiResponse.error(res, 400, {
        message: "Invalid amount",
        code: "INVALID_WITHDRAW_AMOUNT",
      });
      return;
    }

    const withdrawTransaction = await withdrawFromAccount({
      user_id,
      from_account_id,
      amount,
      request_id: idempotencyKey,
    });

    ApiResponse.success(res, 200, {
      message: "Withdraw completed successfully",
      code: "WITHDRAW_TRANSACTION_SUCCEDED",
      data: withdrawTransaction,
    });
  } catch (error: any) {
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

export const transfer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user_id = Number(req.user?.id);
    const { from_account_id, to_account_id, amount } = req.body;
    const idempotencyKey = req.header("Idempotency-Key") || undefined;

    const isValid = validateRequiredFields(res, { user_id, ...req.body }, [
      "user_id",
      "from_account_id",
      "to_account_id",
      "amount",
    ]);

    if (!isValid) {
      return;
    }

    if (Number(amount) <= 0) {
      ApiResponse.error(res, 400, {
        message: "Invalid amount",
        code: "INVALID_WITHDRAW_AMOUNT",
      });
      return;
    }

    if (Number(from_account_id) === Number(to_account_id)) {
      ApiResponse.error(res, 400, {
        message: "Destination account can't be the same as source account",
        code: "INVALID_DESTINATION_ACCOUNT",
      });
      return;
    }

    const transferTransaction = await transferToAccount({
      user_id,
      from_account_id,
      to_account_id,
      amount,
      request_id: idempotencyKey,
    });

    ApiResponse.success(res, 200, {
      message: "Transfer completed successfully",
      code: "TRANSFER_TRANSACTION_SUCCEDED",
      data: transferTransaction,
    });
  } catch (error: any) {
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
