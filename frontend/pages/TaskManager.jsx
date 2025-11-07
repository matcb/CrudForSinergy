// src/pages/TaskManager.jsx
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import TaskModal from '../components/TaskModal';
import TaskList from '../components/TaskList';
import TaskStats from '../components/TaskStats';
import FilterButtons from '../components/FilterButton';

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('todas');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'media',
    dueDate: '',
    status: 'pendente'
  });

  // Carregar tarefas do localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  // Salvar tarefas
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const resetForm = () => setFormData({
    title: '',
    description: '',
    priority: 'media',
    dueDate: '',
    status: 'pendente'
  });

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (editingTask) {
      setTasks(tasks.map(task =>
        task.id === editingTask.id
          ? { ...formData, id: task.id, createdAt: task.createdAt, updatedAt: new Date().toISOString() }
          : task
      ));
      setEditingTask(null);
    } else {
      const newTask = {
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setTasks([newTask, ...tasks]);
    }

    resetForm();
    setIsModalOpen(false);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      status: task.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const toggleStatus = (id) => {
    setTasks(tasks.map(task =>
      task.id === id
        ? {
            ...task,
            status: task.status === 'concluida' ? 'pendente' : 'concluida',
            updatedAt: new Date().toISOString()
          }
        : task
    ));
  };

  const filteredTasks = tasks.filter(task =>
    filter === 'todas' ? true : task.status === filter
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Gerenciador de Tarefas</h1>
              <p className="text-gray-600">Organize suas atividades de forma simples</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md"
            >
              <Plus size={20} />
              Nova Tarefa
            </button>
          </div>

          <FilterButtons filter={filter} setFilter={setFilter} />
        </div>

        <TaskStats tasks={tasks} />
        <TaskList
          tasks={filteredTasks}
          toggleStatus={toggleStatus}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />

        <TaskModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          editingTask={editingTask}
          resetForm={resetForm}
        />
      </div>
    </div>
  );
}
