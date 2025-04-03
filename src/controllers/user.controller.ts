import { Request, Response } from "express";
import { createUser } from "../services/user.service";
import { ValidationError } from "sequelize";
import { ApiResponse } from "../utils/response";

export const postUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      ApiResponse.error(res, 400, { message: `Name and email are required`, code: "VALIDATION_MISSING_FIELDS" });
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
