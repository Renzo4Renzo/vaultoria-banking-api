import { Transaction } from "sequelize";
import sequelize from "../databases/database";

import { Account } from "../models/Account";
import { AccountOwner } from "../models/AccountOwner";
import { User } from "../models/User";
import { ErrorMessages } from "../utils/error";

export const getOwners = async (user_id: number, account_id: number): Promise<User[]> => {
  return await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED }, async (t) => {
    const account = await Account.findByPk(account_id, { transaction: t });

    if (!account) {
      throw new Error(ErrorMessages.AccountNotFound);
    }

    const accountOwners = await AccountOwner.findAll({
      where: { account_id },
      attributes: ["user_id"],
      lock: t.LOCK.SHARE,
      transaction: t,
    });

    const ownerIds = accountOwners.map((account) => account.user_id);

    if (!ownerIds.includes(user_id)) {
      throw new Error(ErrorMessages.UnauthorizedAccessToAccount);
    }

    return await User.findAll({
      where: { id: ownerIds },
      transaction: t,
    });
  });
};
