export async function withRetry<T>(fn: () => Promise<T>, retries = 5): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const pgCode = error?.original?.code || error?.code;
      if (pgCode === "40001" && i < retries - 1) {
        // PostgreSQL serialization failure, retry
        await new Promise((r) => setTimeout(r, 100 * (i + 1))); // exponential backoff
        continue;
      }
      throw error;
    }
  }

  throw new Error("Transaction failed after retries");
}
