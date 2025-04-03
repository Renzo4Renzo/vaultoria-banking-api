import sequelize from "../databases/database";

import { User } from "../models/User";
import { Account } from "../models/Account";
import { AccountOwner } from "../models/AccountOwner";

export const createAccount = async (user_id: number): Promise<Account> => {
  return await sequelize.transaction(async (t) => {
    const user = await User.findByPk(user_id, { transaction: t });
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
