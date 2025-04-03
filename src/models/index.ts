import { initializeUser } from "./User";
import { initializeAccount } from "./Account";
import { initializeAccountOwner } from "./AccountOwner";
import { initializeTransaction } from "./Transaction";
import { initializeTransactionLog } from "./TransactionLog";
import { associateModels } from "./associate_models";

export const initializeModels = () => {
  initializeUser();
  initializeAccount();
  initializeAccountOwner();
  initializeTransaction();
  initializeTransactionLog();

  //Relationships between tables
  associateModels();
};
