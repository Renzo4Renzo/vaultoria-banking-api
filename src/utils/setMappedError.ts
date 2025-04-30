import { Response } from "express";
import { ApiResponse } from "./response";
import { errorMap, ErrorMessage } from "./error";

export const setMappedError = (res: Response, error: { message: ErrorMessage }) => {
  if (error.message && errorMap[error.message]) {
    const { status, code } = errorMap[error.message];
    ApiResponse.error(res, status, {
      message: error.message,
      code,
    });
    return true;
  }
  return false;
};
