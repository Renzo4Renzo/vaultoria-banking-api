import { Response } from "express";
import { depositIntoAccount, transferToAccount, withdrawFromAccount } from "../services/transaction.service";
import { AuthRequest } from "../middleware/auth";
import { ApiResponse } from "../utils/response";
import { validateRequiredFields } from "../utils/validateRequiredFields";
import { TransactionWithLogInfo } from "../utils/types";
import { setMappedError } from "../utils/setMappedError";
import { withRetry } from "../utils/retryDBCall";

interface IdempotentValidationOptions {
  res: Response;
  transaction: TransactionWithLogInfo;
}

export const validateIdempotentTransaction = ({ res, transaction }: IdempotentValidationOptions): boolean => {
  if (transaction.status) {
    ApiResponse.error(res, 409, {
      message: "This request has already been processed",
      code: "DUPLICATE_TRANSACTION",
    });
    return false;
  }

  return true;
};

export const deposit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user_id = Number(req.user?.id);
    const { to_account_id, amount } = req.body;
    const idempotencyKey = req.header("Idempotency-Key") || undefined;

    const isValid = validateRequiredFields(res, { user_id, ...req.body });

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

    const depositTransaction = await withRetry(() =>
      depositIntoAccount({ user_id, to_account_id, amount, request_id: idempotencyKey })
    );

    if (!validateIdempotentTransaction({ res, transaction: depositTransaction })) {
      return;
    }

    ApiResponse.success(res, 200, {
      message: "Deposit completed successfully",
      code: "DEPOSIT_TRANSACTION_SUCCEDED",
      data: depositTransaction,
    });
  } catch (error: any) {
    if (setMappedError(res, error)) {
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

    const isValid = validateRequiredFields(res, { user_id, ...req.body });

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

    const withdrawTransaction = await withRetry(() =>
      withdrawFromAccount({
        user_id,
        from_account_id,
        amount,
        request_id: idempotencyKey,
      })
    );

    if (!validateIdempotentTransaction({ res, transaction: withdrawTransaction })) {
      return;
    }

    ApiResponse.success(res, 200, {
      message: "Withdraw completed successfully",
      code: "WITHDRAW_TRANSACTION_SUCCEDED",
      data: withdrawTransaction,
    });
  } catch (error: any) {
    if (setMappedError(res, error)) {
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

    const isValid = validateRequiredFields(res, { user_id, ...req.body });

    if (!isValid) {
      return;
    }

    if (Number(amount) <= 0) {
      ApiResponse.error(res, 400, {
        message: "Invalid amount",
        code: "INVALID_TRANSFER_AMOUNT",
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

    const transferTransaction = await withRetry(() =>
      transferToAccount({
        user_id,
        from_account_id,
        to_account_id,
        amount,
        request_id: idempotencyKey,
      })
    );

    if (!validateIdempotentTransaction({ res, transaction: transferTransaction })) {
      return;
    }

    ApiResponse.success(res, 200, {
      message: "Transfer completed successfully",
      code: "TRANSFER_TRANSACTION_SUCCEDED",
      data: transferTransaction,
    });
  } catch (error: any) {
    if (setMappedError(res, error)) {
      return;
    }

    ApiResponse.failSafe(res, error);
  }
};
