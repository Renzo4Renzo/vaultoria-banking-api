import sequelize from "../databases/database";

import { Transaction as TransactionModel } from "../models/Transaction";
import { Account } from "../models/Account";
import { AccountOwner } from "../models/AccountOwner";
import { TransactionLog } from "../models/TransactionLog";
import { DepositIntoAccountDTO, TransferFromAccountDTO, WithdrawFromAccountDTO } from "../dtos/transaction.dto";
import { TransactionWithLogInfo } from "../utils/types";
import { ErrorMessages } from "../utils/error";
import { Transaction } from "sequelize";

const getTransactionIfExists = async (request_id: string): Promise<TransactionWithLogInfo | null> => {
  const existingTransaction = await TransactionModel.findOne({ where: { request_id } });
  if (!existingTransaction) return null;

  const existingLog = await TransactionLog.findOne({ where: { transaction_id: existingTransaction.id } });

  return {
    ...existingTransaction.get({ plain: true }),
    status: existingLog?.status,
    error_message: existingLog?.error_message,
  };
};

export const depositIntoAccount = async ({
  user_id,
  to_account_id,
  amount,
  request_id,
}: DepositIntoAccountDTO): Promise<TransactionWithLogInfo> => {
  if (request_id) {
    const existingTransaction = await getTransactionIfExists(request_id);
    if (existingTransaction) return existingTransaction;
  }

  const newTransaction = await TransactionModel.create({
    type: "DEPOSIT",
    amount,
    to_account_id: null,
    request_id: request_id || null,
  });

  const transactionLog = await TransactionLog.create({
    transaction_id: newTransaction.id,
    status: "PENDING",
  });

  try {
    await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ }, async (t) => {
      const account = await Account.findByPk(to_account_id, { transaction: t });

      if (!account) {
        throw new Error(ErrorMessages.AccountNotFound);
      }

      const isOwner = await AccountOwner.findOne({
        where: { user_id, account_id: to_account_id },
        transaction: t,
      });

      if (!isOwner) {
        throw new Error(ErrorMessages.UnauthorizedAccessToAccount);
      }

      await newTransaction.update({ to_account_id }, { transaction: t });

      const newBalance = Number(account.balance) + amount;
      await account.update({ balance: newBalance }, { transaction: t });
    });

    await transactionLog.update({ status: "COMPLETED" });

    return newTransaction;
  } catch (error: any) {
    await transactionLog.update({
      status: "FAILED",
      error_message: error.message,
    });
    throw error;
  }
};

export const withdrawFromAccount = async ({
  user_id,
  from_account_id,
  amount,
  request_id,
}: WithdrawFromAccountDTO): Promise<TransactionWithLogInfo> => {
  if (request_id) {
    const existingTransaction = await getTransactionIfExists(request_id);
    if (existingTransaction) return existingTransaction;
  }

  const newTransaction = await TransactionModel.create({
    type: "WITHDRAWAL",
    amount,
    from_account_id: null,
    request_id: request_id || null,
  });

  const transactionLog = await TransactionLog.create({
    transaction_id: newTransaction.id,
    status: "PENDING",
  });

  try {
    await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ }, async (t) => {
      const account = await Account.findByPk(from_account_id, { transaction: t });

      if (!account) {
        throw new Error(ErrorMessages.AccountNotFound);
      }

      const isOwner = await AccountOwner.findOne({
        where: { user_id, account_id: from_account_id },
        transaction: t,
      });

      if (!isOwner) {
        throw new Error(ErrorMessages.UnauthorizedAccessToAccount);
      }

      await newTransaction.update({ from_account_id }, { transaction: t });

      if (Number(account.balance) - amount < 0) {
        throw new Error(ErrorMessages.InsufficientBalance);
      }

      const newBalance = Number(account.balance) - amount;
      await account.update({ balance: newBalance }, { transaction: t });
    });

    await transactionLog.update({ status: "COMPLETED" });

    return newTransaction;
  } catch (error: any) {
    await transactionLog.update({
      status: "FAILED",
      error_message: error.message,
    });
    throw error;
  }
};

export const transferToAccount = async ({
  user_id,
  from_account_id,
  to_account_id,
  amount,
  request_id,
}: TransferFromAccountDTO): Promise<TransactionWithLogInfo> => {
  if (request_id) {
    const existingTransaction = await getTransactionIfExists(request_id);
    if (existingTransaction) return existingTransaction;
  }

  const newTransaction = await TransactionModel.create({
    type: "TRANSFER",
    amount,
    from_account_id: null,
    to_account_id: null,
    request_id: request_id || null,
  });

  const transactionLog = await TransactionLog.create({
    transaction_id: newTransaction.id,
    status: "PENDING",
  });

  try {
    await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ }, async (t) => {
      const accounts = await Account.findAll({
        where: { id: [from_account_id, to_account_id] },
        transaction: t,
      });

      const sourceAccount = accounts.find((acc) => acc.id === from_account_id);
      const destinationAccount = accounts.find((acc) => acc.id === to_account_id);

      if (!sourceAccount) {
        throw new Error(ErrorMessages.SourceAccountNotFound);
      }

      if (!destinationAccount) {
        throw new Error(ErrorMessages.DestinationAccountNotFound);
      }

      const isOwner = await AccountOwner.findOne({
        where: { user_id, account_id: from_account_id },
        transaction: t,
      });

      if (!isOwner) {
        throw new Error(ErrorMessages.UnauthorizedAccessToAccount);
      }

      await newTransaction.update({ from_account_id, to_account_id }, { transaction: t });

      if (Number(sourceAccount.balance) - amount < 0) {
        throw new Error(ErrorMessages.InsufficientBalance);
      }

      const newSourceBalance = Number(sourceAccount.balance) - amount;
      const newDestinationBalance = Number(destinationAccount.balance) + amount;

      await sourceAccount.update({ balance: newSourceBalance }, { transaction: t });
      await destinationAccount.update({ balance: newDestinationBalance }, { transaction: t });
    });

    await transactionLog.update({ status: "COMPLETED" });

    return newTransaction;
  } catch (error: any) {
    await transactionLog.update({
      status: "FAILED",
      error_message: error.message,
    });
    throw error;
  }
};
