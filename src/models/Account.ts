import { DataTypes, Model } from "sequelize";
import sequelize from "../databases/database";

export class Account extends Model {
  public id!: number;
  public balance!: number;
}

export const initializeAccount = () => {
  Account.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      balance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
    },
    {
      sequelize,
      modelName: "Account",
      tableName: "accounts",
      timestamps: false,
    }
  );
};
