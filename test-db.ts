import "dotenv/config";
import { Pool } from "pg";

console.log("URL =", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

await pool.query("select 1");
console.log("✅ DB OK");
process.exit(0);