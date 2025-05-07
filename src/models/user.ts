import { DataTypes, Model } from "sequelize";
import sequelize from "../databases/database";

export class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
}

export const initializeUser = () => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: false,
    }
  );
};
