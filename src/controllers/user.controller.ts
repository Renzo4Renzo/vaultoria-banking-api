import { Request, Response } from "express";
import { createUser } from "../services/user.service";
import { ApiResponse } from "../utils/response";
import { validateRequiredFields } from "../utils/validateRequiredFields";
import { setMappedError } from "../utils/setMappedError";

export const postUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email } = req.body;

    const isValid = validateRequiredFields(res, { name, email });

    if (!isValid) {
      return;
    }

    const user = await createUser({ name, email });

    ApiResponse.success(res, 201, {
      message: "User created successfully",
      code: "USER_CREATED",
      data: user,
    });
  } catch (error: any) {
    if (setMappedError(res, error)) {
      return;
    }
    ApiResponse.failSafe(res, error);
  }
};
