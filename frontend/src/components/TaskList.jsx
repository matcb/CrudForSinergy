// src/components/TaskList.jsx
import React from 'react';
import TaskItem from './TaskItem';

export default function TaskList({ tasks, toggleStatus, handleEdit, handleDelete }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {tasks.length === 0 ? (
        <div className="col-span-2 bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">Nenhuma tarefa encontrada</p>
          <p className="text-gray-400 mt-2">Crie sua primeira tarefa para começar!</p>
        </div>
      ) : (
        tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            toggleStatus={toggleStatus}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        ))
      )}
    </div>
  );
}
