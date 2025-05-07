import dotenv from "dotenv";
dotenv.config();

import express from "express";
import sequelize from "./databases/database";
import { initializeModels } from "./models/index";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import accountRoutes from "./routes/account.routes";
import transactionRoutes from "./routes/transaction.routes";
import reportsRoutes from "./routes/report.routes";

const app = express();
const PORT = process.env.PORT || 3000;
const apiPrefix = "/api/v1";
app.use(express.json());

initializeModels();

sequelize
  .sync({ alter: true })
  .then(() => console.log("Database tables updated!"))
  .catch((err) => console.log("Error syncing database:", err));

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/accounts`, accountRoutes);
app.use(`${apiPrefix}/transactions`, transactionRoutes);
app.use(`${apiPrefix}/reports`, reportsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
