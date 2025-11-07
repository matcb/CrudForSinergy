// src/components/FilterButtons.jsx
import React from 'react';

export default function FilterButtons({ filter, setFilter }) {
  const options = ['todas', 'pendente', 'em_progresso', 'concluida'];
  return (
    <div className="flex gap-2 mt-6 flex-wrap">
      {options.map(status => (
        <button
          key={status}
          onClick={() => setFilter(status)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === status
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {status === 'todas' ? 'Todas' : status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
        </button>
      ))}
    </div>
  );
}
