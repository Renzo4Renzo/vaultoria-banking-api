import { DatabaseError } from "sequelize";

type ErrorParent = {
  code: string;
  constraint: string;
};

export function isPrimaryKeyViolation(error: unknown): boolean {
  return (
    error instanceof DatabaseError &&
    (error.parent as unknown as ErrorParent)?.code === "23505" && // PostgreSQL unique_violation
    (error.parent as unknown as ErrorParent)?.constraint?.includes("pkey") // Checks it's the PK
  );
}

export function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof DatabaseError && (error.parent as unknown as ErrorParent)?.code === "23503"; // foreign_key_violation
}

export function isUniqueConstraintViolation(error: unknown): boolean {
  return (error as any)?.name === "SequelizeUniqueConstraintError";
}
