import { Transaction } from "sequelize";
import sequelize from "../databases/database";

import { Account } from "../models/Account";
import { AccountOwner } from "../models/AccountOwner";
import { User } from "../models/User";
import { ErrorMessages } from "../utils/errorMessages";
import { isForeignKeyViolation, isPrimaryKeyViolation } from "../utils/databaseViolations";

export const addOwner = async (
  authenticatedUserId: number,
  user_id: number,
  account_id: number
): Promise<AccountOwner> => {
  return await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED }, async (t) => {
    const account = await Account.findByPk(account_id, {
      attributes: ["id"],
      transaction: t,
    });

    if (!account) {
      throw new Error(ErrorMessages.AccountNotFound);
    }

    const owners = await AccountOwner.findAll({
      where: {
        account_id,
        user_id: [authenticatedUserId, user_id],
      },
      attributes: ["user_id"],
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    const isAuthorized = owners.some((owner) => owner.user_id === authenticatedUserId);
    const isOwner = owners.some((owner) => owner.user_id === user_id);

    if (!isAuthorized) {
      throw new Error(ErrorMessages.UnauthorizedAccessToAccount);
    }

    if (isOwner) {
      throw new Error(ErrorMessages.AccountOwnerExists);
    }

    try {
      return await AccountOwner.create({ user_id, account_id }, { transaction: t });
    } catch (error) {
      if (isPrimaryKeyViolation(error)) {
        throw new Error(ErrorMessages.AccountOwnerExists);
      }
      if (isForeignKeyViolation(error)) {
        throw new Error(ErrorMessages.UserNotFound);
      }
      throw error;
    }
  });
};

export const deleteOwner = async (authenticatedUserId: number, user_id: number, account_id: number): Promise<void> => {
  return await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED }, async (t) => {
    const account = await Account.findByPk(account_id, { transaction: t });

    if (!account) {
      throw new Error(ErrorMessages.AccountNotFound);
    }

    const isAuthorized = await AccountOwner.findOne({
      where: { user_id: authenticatedUserId, account_id },
      attributes: ["user_id"],
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (!isAuthorized) {
      throw new Error(ErrorMessages.UnauthorizedAccessToAccount);
    }

    const deleted = await AccountOwner.destroy({
      where: { user_id, account_id },
      transaction: t,
    });

    if (deleted === 0) {
      throw new Error(ErrorMessages.AccountOwnerNotFound);
    }

    const remainingOwners = await AccountOwner.findAll({
      where: { account_id },
      attributes: ["user_id"],
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (remainingOwners.length === 0) {
      throw new Error(ErrorMessages.OrphanAccountNowAllowed);
    }
  });
};

export const getOwners = async (user_id: number, account_id: number): Promise<User[]> => {
  const account = await Account.findByPk(account_id, { attributes: ["id"] });

  if (!account) {
    throw new Error(ErrorMessages.AccountNotFound);
  }

  const accountOwners = await AccountOwner.findAll({
    where: { account_id },
    attributes: ["user_id"],
  });

  const ownerIds = accountOwners.map((owner) => owner.user_id);

  if (!ownerIds.includes(user_id)) {
    throw new Error(ErrorMessages.UnauthorizedAccessToAccount);
  }

  return await User.findAll({
    where: { id: ownerIds },
  });
};
