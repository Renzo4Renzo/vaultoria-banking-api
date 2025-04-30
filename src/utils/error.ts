export const ErrorMessages = {
  AccountNotFound: "Account not found",
  SourceAccountNotFound: "Source account not found",
  DestinationAccountNotFound: "Destination account not found",
  UnauthorizedAccessToAccount: "Unauthorized access to account",
  InsufficientBalance: "Insufficient balance",
} as const;

export type ErrorMessage = (typeof ErrorMessages)[keyof typeof ErrorMessages];

export const errorMap: Record<ErrorMessage, { status: number; code: string }> = {
  [ErrorMessages.AccountNotFound]: { status: 404, code: "ACCOUNT_NOT_FOUND" },
  [ErrorMessages.SourceAccountNotFound]: { status: 404, code: "SOURCE_ACCOUNT_NOT_FOUND" },
  [ErrorMessages.DestinationAccountNotFound]: { status: 404, code: "DESTINATION_ACCOUNT_NOT_FOUND" },
  [ErrorMessages.UnauthorizedAccessToAccount]: { status: 403, code: "ACCOUNT_ACCESS_NOT_AUTHORIZED" },
  [ErrorMessages.InsufficientBalance]: { status: 409, code: "INSUFFICIENT_BALANCE" },
};
