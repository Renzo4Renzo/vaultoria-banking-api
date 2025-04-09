import { Request, Response } from "express";
import { createUser } from "../services/user.service";
import { ValidationError } from "sequelize";
import { ApiResponse } from "../utils/response";
import { validateRequiredFields } from "../utils/validateRequiredFields";

export const postUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email } = req.body;

    const isValid = validateRequiredFields(res, req.body, ["name", "email"]);

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
    if (error instanceof ValidationError) {
      ApiResponse.error(res, 400, {
        message: "Validation error",
        code: "USER_DUPLICATE_EMAIL",
        errors: error.errors.map((err: any) => err.message),
      });
      return;
    }

    ApiResponse.failSafe(res, error);
  }
};
