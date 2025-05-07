export const ErrorMessages = {
  AccountNotFound: "Account not found",
  SourceAccountNotFound: "Source account not found",
  DestinationAccountNotFound: "Destination account not found",
  UnauthorizedAccessToAccount: "Unauthorized access to account",
  InsufficientBalance: "Insufficient balance",
  AccountOwnerExists: "Account Owner already exists",
  AccountOwnerNotFound: "Account Owner not found",
  UserNotFound: "User not found",
  OrphanAccountNowAllowed: "Orphan Account not allowed",
  UserEmailNotUnique: "Email already used",
} as const;

export type ErrorMessage = (typeof ErrorMessages)[keyof typeof ErrorMessages];

export const errorMap: Record<ErrorMessage, { status: number; code: string }> = {
  [ErrorMessages.AccountNotFound]: { status: 404, code: "ACCOUNT_NOT_FOUND" },
  [ErrorMessages.SourceAccountNotFound]: { status: 404, code: "SOURCE_ACCOUNT_NOT_FOUND" },
  [ErrorMessages.DestinationAccountNotFound]: { status: 404, code: "DESTINATION_ACCOUNT_NOT_FOUND" },
  [ErrorMessages.UnauthorizedAccessToAccount]: { status: 403, code: "ACCOUNT_ACCESS_NOT_AUTHORIZED" },
  [ErrorMessages.InsufficientBalance]: { status: 409, code: "INSUFFICIENT_BALANCE" },
  [ErrorMessages.AccountOwnerExists]: { status: 409, code: "ACCOUNT_ALREADY_EXISTS" },
  [ErrorMessages.AccountOwnerNotFound]: { status: 404, code: "ACCOUNT_OWNER_NOT_FOUND" },
  [ErrorMessages.UserNotFound]: { status: 404, code: "USER_NOT_FOUND" },
  [ErrorMessages.OrphanAccountNowAllowed]: { status: 409, code: "ORPHAN_ACCOUNT_NOT_ALLOWED" },
  [ErrorMessages.UserEmailNotUnique]: { status: 409, code: "USER_EMAIL_NOT_UNIQUE" },
};
