import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import TaskManager from "./pages/TaskManager";
import Login from "./pages/Login";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );

  
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(localStorage.getItem("isAuthenticated") === "true");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Routes>
      
      <Route path="/" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
      <Route
        path="/tasks"
        element={isAuthenticated ? <TaskManager /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
