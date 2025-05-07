import sequelize from "../databases/database";
import { Transaction } from "sequelize";

import { User } from "../models/User";
import { Account } from "../models/Account";
import { AccountOwner } from "../models/AccountOwner";
import { ErrorMessages } from "../utils/errorMessages";

export const createAccount = async (user_id: number): Promise<Account> => {
  return await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED }, async (t) => {
    const user = await User.findByPk(user_id, {
      attributes: ["id"],
      transaction: t,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const account = await Account.create(
      {
        balance: 0.0,
      },
      { transaction: t }
    );

    await AccountOwner.create(
      {
        user_id,
        account_id: account.id,
      },
      { transaction: t }
    );

    return account;
  });
};

export const getAccountBalance = async (user_id: number, account_id: number): Promise<Account["balance"]> => {
  const account = await Account.findOne({
    where: { id: account_id },
    attributes: ["id", "balance"],
  });

  if (!account) {
    throw new Error(ErrorMessages.AccountNotFound);
  }

  const isOwner = await AccountOwner.findOne({
    where: {
      user_id,
      account_id,
    },
  });

  if (!isOwner) {
    throw new Error(ErrorMessages.UnauthorizedAccessToAccount);
  }

  return account.balance;
};
