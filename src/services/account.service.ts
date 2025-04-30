import sequelize from "../databases/database";

import { User } from "../models/User";
import { Account } from "../models/Account";
import { AccountOwner } from "../models/AccountOwner";
import { ErrorMessages } from "../utils/error";

export const createAccount = async (user_id: number): Promise<Account> => {
  return await sequelize.transaction(async (t) => {
    const user = await User.findByPk(user_id, { transaction: t, lock: t.LOCK.UPDATE });

    if (!user) {
      throw new Error("User not found");
    }

    const account = await Account.create(
      {
        balance: 0.0,
      },
      { transaction: t }
    );

    await Account.findByPk(account.id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

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
  const account = await Account.findByPk(account_id);

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
