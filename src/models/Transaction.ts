import { DataTypes, Model } from "sequelize";
import sequelize from "../databases/database";

const transactionTypes = ["DEPOSIT", "WITHDRAWAL", "TRANSFER"] as const;
type transactionType = (typeof transactionTypes)[number];

export class Transaction extends Model {
  public id!: number;
  public type!: transactionType;
  public amount!: number;
  public from_account_id?: number;
  public to_account_id?: number;
}

export const initializeTransaction = () => {
  Transaction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: DataTypes.ENUM(...transactionTypes),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      from_account_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      to_account_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Transaction",
      tableName: "transactions",
      timestamps: false,
    }
  );
};
