import { Transaction } from "../models/Transaction";
import { TransactionLog } from "../models/TransactionLog";

export const transactionTypes = ["DEPOSIT", "WITHDRAWAL", "TRANSFER"] as const;
export type TransactionType = (typeof transactionTypes)[number];

export const transactionLogTypes = ["PENDING", "COMPLETED", "FAILED"] as const;
export type TransactionLogType = (typeof transactionLogTypes)[number];

export type TransactionWithLogInfo = Transaction & Partial<Pick<TransactionLog, "status" | "error_message">>;
