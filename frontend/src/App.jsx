import React, { useState, useEffect } from "react";
import TaskManager from "./pages/TaskManager";
import ToggleTheme from "./components/ToggleTheme";


export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Detecta se o body já está no modo escuro
    setDarkMode(document.body.classList.contains("dark"));
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen transition-colors duration-500 bg-[var(--bg)] text-[var(--fg)]">
      {/* Botão de alternar */}
      <div className="flex justify-end p-4">
        <ToggleTheme darkMode={darkMode} setDarkMode={setDarkMode} />
      </div>

      <TaskManager />
    </div>
  );
}
