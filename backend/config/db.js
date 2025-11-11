import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getConnection() {
  try {
    const { data, error } = await supabase.from("tasks").select("id").limit(1); // Test query to any table
    if (error) throw error;
    console.log("Connected to Supabase");
    return supabase; // Return the client
  } catch (err) {
    console.error("❌ Supabase connection failed:", err);
    throw err;
  }
}