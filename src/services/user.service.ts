import { User } from "../models/User";
import { CreateUserDTO } from "../dtos/user.dto";
// import { Pool } from "pg";

// const pool = new Pool({
//   database: process.env.DB_NAME as string,
//   user: process.env.DB_USER as string,
//   password: process.env.DB_PASSWORD as string,
//   host: (process.env.DB_HOST as string) || "localhost",
//   port: Number(process.env.DB_PORT) || 5432,
// });

// export const createUser = async ({ name, email }: CreateUserDTO) => {
//   const query = `
//     INSERT INTO users (name, email)
//     VALUES ($1, $2)
//     RETURNING *;
//   `;

//   const values = [name, email];

//   const { rows } = await pool.query(query, values);
//   return rows[0];
// };

export const createUser = async ({ name, email }: CreateUserDTO): Promise<User> => {
  return await User.create({ name, email });
};
