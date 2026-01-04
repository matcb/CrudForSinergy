import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing required environment variables: SUPABASE_URL and SUPABASE_ANON_KEY must be set"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getConnection() {
  try {
    const { data, error } = await supabase.from("tasks").select("id").limit(1);
    if (error) throw error;
    console.log("Connected to Supabase");
    return supabase;
  } catch (err) {
    console.error("❌ Supabase connection failed:", err);
    throw err;
  }
}
