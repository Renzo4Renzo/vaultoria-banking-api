import { DataTypes, Model } from "sequelize";
import sequelize from "../databases/database";
import { TransactionType, transactionTypes } from "../utils/types";

export class Transaction extends Model {
  public id!: number;
  public type!: TransactionType;
  public amount!: number;
  public from_account_id?: number;
  public to_account_id?: number;
  public request_id?: string;
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
      request_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
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
