import { User } from "./User";
import { Account } from "./Account";
import { AccountOwner } from "./AccountOwner";
import { Transaction } from "./Transaction";
import { TransactionLog } from "./TransactionLog";

export const associateModels = () => {
  User.belongsToMany(Account, {
    through: AccountOwner,
    foreignKey: "user_id",
  });

  Account.belongsToMany(User, {
    through: AccountOwner,
    foreignKey: "account_id",
  });

  Account.hasMany(Transaction, {
    foreignKey: "from_account_id",
    as: "OutgoingTransactions",
  });

  Account.hasMany(Transaction, {
    foreignKey: "to_account_id",
    as: "IncomingTransactions",
  });

  TransactionLog.belongsTo(Transaction, {
    foreignKey: "transaction_id",
  });
};
