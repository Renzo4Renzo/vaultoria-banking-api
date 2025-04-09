import { ApiResponse } from "./response";
import { Response } from "express";

export function validateRequiredFields(res: Response, body: any, requiredFields: string[]): boolean {
  const missingFields = requiredFields.filter(
    (field) => body[field] == null || body[field] === "" || Number.isNaN(body[field])
  ); // catches undefined, null, empty strings and NaN values

  if (missingFields.length > 0) {
    ApiResponse.error(res, 400, {
      message: `Missing required fields: ${missingFields.join(", ")}`,
      code: "VALIDATION_MISSING_FIELDS",
    });
    return false;
  }

  return true;
}
