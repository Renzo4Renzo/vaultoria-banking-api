import { DataTypes, Model } from "sequelize";
import sequelize from "../databases/database";
import { TransactionLogType, transactionLogTypes } from "../utils/types";

export class TransactionLog extends Model {
  public id!: number;
  public transaction_id!: number;
  public status!: TransactionLogType;
  public error_message!: string;
}

export const initializeTransactionLog = () => {
  TransactionLog.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      transaction_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(...transactionLogTypes),
        allowNull: false,
      },
      error_message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "TransactionLog",
      tableName: "transaction_logs",
      timestamps: false,
    }
  );
};
