import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { ApiResponse } from "../utils/response";
import { validateRequiredFields } from "../utils/validateRequiredFields";
import { addOwner, deleteOwner, getOwners } from "../services/accountOwner.service";
import { setMappedError } from "../utils/setMappedError";

export const addAccountOwner = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const authenticatedUserId = Number(req.user?.id);
    const accountId = Number(req.params.account_id);
    const userId = Number(req.params.user_id);

    const isValid = validateRequiredFields(res, { authenticatedUserId, userId, accountId });

    if (!isValid) {
      return;
    }

    const accountOwner = await addOwner(authenticatedUserId, userId, accountId);

    ApiResponse.success(res, 201, {
      message: "Owner added succesfully",
      code: "OWNER_ADDED",
      data: { accountOwner },
    });
  } catch (error: any) {
    if (setMappedError(res, error)) {
      return;
    }
    ApiResponse.failSafe(res, error);
  }
};

export const deleteAccountOwner = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const authenticatedUserId = Number(req.user?.id);
    const accountId = Number(req.params.account_id);
    const userId = Number(req.params.user_id);

    const isValid = validateRequiredFields(res, { authenticatedUserId, userId, accountId });

    if (!isValid) {
      return;
    }

    await deleteOwner(authenticatedUserId, userId, accountId);

    ApiResponse.success(res, 204, {
      message: "Owner deleted succesfully",
      code: "OWNER_DELETED",
    });
  } catch (error: any) {
    if (setMappedError(res, error)) {
      return;
    }
    ApiResponse.failSafe(res, error);
  }
};

export const getAccountOwners = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user_id = Number(req.user?.id);
    const account_id = Number(req.params.account_id);

    const isValid = validateRequiredFields(res, { user_id, account_id });

    if (!isValid) {
      return;
    }

    const users = await getOwners(user_id, account_id);

    ApiResponse.success(res, 200, {
      message: "Owner retrieved successfully",
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
