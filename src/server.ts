import dotenv from "dotenv";
dotenv.config();

import express from "express";
import sequelize from "./databases/database";
import { initializeUser } from "./models/user";
import userRoutes from "./routes/user.routes";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

initializeUser();

console.log("Registered models:", sequelize.models);

sequelize
  .sync({ alter: true })
  .then(() => console.log("Database tables updated!"))
  .catch((err) => console.log("Error syncing database:", err));

app.use("/api/v1/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
