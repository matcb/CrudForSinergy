import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getConnection } from "./config/db.js";
import taskRoutes from "./routes/task.js";

dotenv.config();

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/tasks", taskRoutes);

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