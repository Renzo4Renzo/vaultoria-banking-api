import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { ApiResponse } from "../utils/response";
import { validateRequiredFields } from "../utils/validateRequiredFields";
import { getOwners } from "../services/accountOwner.service";
import { setMappedError } from "../utils/setMappedError";

export const getAccountOwners = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user_id = Number(req.user?.id);
    const account_id = Number(req.params.account_id);

    const isValid = validateRequiredFields(res, { user_id, account_id }, ["user_id", "account_id"]);

    if (!isValid) {
      return;
    }

    const users = await getOwners(user_id, account_id);

    ApiResponse.success(res, 200, {
      message: "Users retrieved successfully",
      code: "OWNERS_RETRIEVED",
      data: { users },
    });
  } catch (error: any) {
    if (setMappedError(res, error)) {
      return;
    }
    ApiResponse.failSafe(res, error);
  }
};
