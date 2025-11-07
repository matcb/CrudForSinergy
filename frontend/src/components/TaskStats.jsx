// src/components/TaskStats.jsx
import React from 'react';

export default function TaskStats({ tasks }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow-md">
        <p className="text-gray-600 text-sm">Total de Tarefas</p>
        <p className="text-3xl font-bold text-gray-800">{tasks.length}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-md">
        <p className="text-gray-600 text-sm">Concluídas</p>
        <p className="text-3xl font-bold text-green-600">
          {tasks.filter(t => t.status === 'concluida').length}
        </p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-md">
        <p className="text-gray-600 text-sm">Pendentes</p>
        <p className="text-3xl font-bold text-orange-600">
          {tasks.filter(t => t.status === 'pendente').length}
        </p>
      </div>
    </div>
  );
}
