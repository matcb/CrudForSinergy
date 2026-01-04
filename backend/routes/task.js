import express from "express";
import { supabase } from "../config/db.js"; 

const router = express.Router();


router.post("/sync", async (req, res) => {
  try {
    const tasks = req.body;
    
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: "Request body must be an array of tasks" });
    }
    
    const transformedTasks = tasks.map(task => ({
      user_email: task.userEmail || task.user_email,
      title: task.title,
      description: task.description || null,
      status: task.status,
      priority: task.priority,
      due_date: task.dueDate || task.due_date || null,
      created_at: task.createdAt || task.created_at || new Date().toISOString(),
      updated_at: task.updatedAt || task.updated_at || new Date().toISOString(),
    }));
    
    const { data, error } = await supabase
      .from("tasks")
      .insert(transformedTasks)
      .select();
    
    if (error) {
      console.error("Sync error:", error);
      
      if (error.code === "PGRST116" || error.message?.includes("relation") || error.message?.includes("does not exist")) {
        return res.status(503).json({ 
          error: "Supabase table 'tasks' not found",
          details: "Please create the 'tasks' table in your Supabase database. See README.md for schema.",
          code: error.code
        });
      }
      
      throw error;
    }
    
    res.json({ message: "Tasks synced successfully", data });
  } catch (err) {
    console.error("Sync error:", err);
    res.status(500).json({ 
      error: "Failed to sync tasks", 
      details: err.message || err.details || "Check Supabase configuration and table structure"
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const { userEmail } = req.query;
    if (!userEmail) {
      return res.status(400).json({ error: "userEmail query param required" });
    }
    
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_email", userEmail);
    
    if (error) {
      console.error("Supabase query error:", error);
      
      if (error.code === "PGRST116" || error.message?.includes("relation") || error.message?.includes("does not exist")) {
        return res.status(503).json({ 
          error: "Supabase table 'tasks' not found",
          details: "Please create the 'tasks' table in your Supabase database. See README.md for schema.",
          code: error.code
        });
      }
      
      throw error;
    }
    
    res.json(data || []);
  } catch (err) {
    console.error("Get tasks error:", err);
    res.status(500).json({ 
      error: err.message || "Failed to fetch tasks",
      details: err.details || err.hint || "Check Supabase configuration and table structure"
    });
  }
});

export default router;
