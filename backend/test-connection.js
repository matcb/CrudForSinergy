import { getConnection } from "./config/db.js";

async function test() {
  try {
    console.log("Testing Supabase connection...");
    await getConnection();
    console.log("✅ Connection successful!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
    console.error("Details:", err);
    process.exit(1);
  }
}

test();
