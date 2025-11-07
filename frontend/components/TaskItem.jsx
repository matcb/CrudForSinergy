// src/components/TaskItem.jsx
import React from 'react';
import { Trash2, Edit, Check, X, Clock, AlertCircle } from 'lucide-react';

export default function TaskItem({ task, toggleStatus, handleEdit, handleDelete }) {
  const getPriorityColor = (priority) => ({
    baixa: 'bg-green-100 text-green-800 border-green-200',
    media: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    alta: 'bg-red-100 text-red-800 border-red-200'
  }[priority]);

  const getStatusColor = (status) => ({
    pendente: 'bg-gray-100 text-gray-800',
    em_progresso: 'bg-blue-100 text-blue-800',
    concluida: 'bg-green-100 text-green-800'
  }[status]);

  const isOverdue = () =>
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'concluida';

  return (
    <div
      className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow ${
        task.status === 'concluida' ? 'opacity-75' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className={`text-xl font-bold text-gray-800 ${
          task.status === 'concluida' ? 'line-through' : ''
        }`}>
          {task.title}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => toggleStatus(task.id)}
            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
          >
            {task.status === 'concluida' ? <X size={20} /> : <Check size={20} className="text-green-600" />}
          </button>
          <button
            onClick={() => handleEdit(task)}
            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Edit size={20} className="text-blue-600" />
          </button>
          <button
            onClick={() => handleDelete(task.id)}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Trash2 size={20} className="text-red-600" />
          </button>
        </div>
      </div>

      <p className="text-gray-600 mb-4">{task.description}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
          {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')}
        </span>
      </div>

      {task.dueDate && (
        <div className={`flex items-center gap-2 text-sm ${
          isOverdue() ? 'text-red-600 font-semibold' : 'text-gray-600'
        }`}>
          {isOverdue() ? <AlertCircle size={16} /> : <Clock size={16} />}
          <span>
            {isOverdue() ? 'Atrasada: ' : 'Vence em: '}
            {new Date(task.dueDate).toLocaleDateString('pt-BR')}
          </span>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3">
        Criada em: {new Date(task.createdAt).toLocaleDateString('pt-BR')} às{' '}
        {new Date(task.createdAt).toLocaleTimeString('pt-BR')}
      </p>
    </div>
  );
}
