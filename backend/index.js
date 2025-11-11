import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getConnection } from "./config/db.js";
/*import authRoutes from "./routes/auth.js"; // Add back if needed
import taskRoutes from "./routes/tasks.js"; // Add back if needed*/

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/*app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);*/

(async () => {
  try {
    await getConnection();
    console.log("Database ready");
  } catch (err) {
    console.error("Failed to connect to database. Server will exit.");
    process.exit(1); 
  }

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});