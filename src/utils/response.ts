import { Response } from "express";

interface SuccessResponseOptions {
  message?: string;
  data?: any;
  code?: string;
}

interface ErrorResponseOptions {
  message?: string;
  code?: string;
  data?: any;
  errors?: string[];
}

export class ApiResponse {
  static success(res: Response, statusCode = 200, options: SuccessResponseOptions = {}) {
    const { message = "Success", data = null, code = "OK" } = options;

    return res.status(statusCode).json({
      success: true,
      code,
      message,
      data,
    });
  }

  static error(res: Response, statusCode = 500, options: ErrorResponseOptions = {}) {
    const { message = "Internal Server Error", code = "INTERNAL_ERROR", data, errors } = options;

    return res.status(statusCode).json({
      success: false,
      code,
      message,
      ...(data ? { data } : {}),
      ...(errors ? { errors } : {}),
    });
  }

  static failSafe(res: Response, error: any) {
    return this.error(res, 500, {
      message: error.message || "Internal Server Error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}
