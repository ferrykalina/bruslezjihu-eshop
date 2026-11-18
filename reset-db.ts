import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function resetDb() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("Connected to Neon. Dropping public schema...");
    await client.query("DROP SCHEMA public CASCADE;");
    await client.query("CREATE SCHEMA public;");
    console.log("Schema reset successfully. You can now run drizzle-kit push.");
  } catch (error) {
    console.error("Error resetting schema:", error);
  } finally {
    await client.end();
  }
}

resetDb();
