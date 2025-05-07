import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { setMappedError } from "../utils/setMappedError";
import { ApiResponse } from "../utils/response";
import { validateRequiredFields } from "../utils/validateRequiredFields";
import { getWealthiestUsers } from "../services/report.service";

export const getTopUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = Number(req.user?.id);

    if (Number(req.query.rank) <= 0 || Number(req.query.rank) > 10) {
      ApiResponse.error(res, 400, {
        message: "Rank should be a value between 1 and 10",
        code: "INVALID_RANK",
      });
      return;
    }

    const rank = Number(req.query.rank) || 3;

    const isValid = validateRequiredFields(res, { userId, rank });

    if (!isValid) {
      return;
    }

    const users = await getWealthiestUsers(rank);

    ApiResponse.success(res, 200, {
      message: "Top Users retrieved succesfully",
      code: "TOP_USERS_RETRIEVED",
      data: users,
    });
  } catch (error: any) {
    if (setMappedError(res, error)) {
      return;
    }
    ApiResponse.failSafe(res, error);
  }
};
