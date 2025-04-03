import { DataTypes, Model } from "sequelize";
import sequelize from "../databases/database";

export class AccountOwner extends Model {
  public user_id!: number;
  public account_id!: number;
}

export const initializeAccountOwner = () => {
  AccountOwner.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true,
      },
      account_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: "AccountOwner",
      tableName: "account_owners",
      timestamps: false,
    }
  );
};
