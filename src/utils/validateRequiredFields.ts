import { ApiResponse } from "./response";
import { Response } from "express";

export function validateRequiredFields(res: Response, body: Record<string, any>): boolean {
  const requiredFields = Object.keys(body);

  const missingFields = requiredFields.filter(
    (field) => body[field] == null || body[field] === "" || Number.isNaN(body[field])
  );

  if (missingFields.length > 0) {
    ApiResponse.error(res, 400, {
      message: `Missing required fields: ${missingFields.join(", ")}`,
      code: "VALIDATION_MISSING_FIELDS",
    });
    return false;
  }

  return true;
}
