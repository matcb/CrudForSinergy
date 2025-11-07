import React from "react";

export default function ToggleTheme({ darkMode, setDarkMode }) {
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-lg border border-gray-400 dark:border-gray-600"
    >
      {darkMode ? "☀️ Claro" : "🌙 Escuro"}
    </button>
  );
}
