// src/pages/TaskManager.jsx
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import TaskModal from '../components/TaskModal';
import TaskList from '../components/TaskList';
import TaskStats from '../components/TaskStats';
import FilterButtons from '../components/FilterButton';
import {
  addTask,
  deleteTask,
  getAllTasks,
  updateTask,
  getTaskById,
  getTasksByStatus
} from "../../../db/db"

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('todas');
  const [loading, setLoading] = useState(true); 
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'media',
    dueDate: '',
    status: 'pendente'
  });

    useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const allTasks = await getAllTasks();
      setTasks(allTasks);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      alert('Erro ao carregar tarefas do banco de dados');
    } finally {
      setLoading(false);
    }
  };



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

  // ✅ SUBSTITUIR: handleSubmit com IndexedDB
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Título é obrigatório!');
      return;
    }

    try {
      if (editingTask) {
        // Atualizar tarefa existente
        await updateTask(editingTask.id, formData);
      } else {
        // Criar nova tarefa
        await addTask(formData);
      }
      
      await loadTasks(); // Recarregar lista
      resetForm();
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      alert('Erro ao salvar tarefa');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate || '',
      status: task.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await deleteTask(id);
        await loadTasks();
      } catch (error) {
        console.error('Erro ao deletar tarefa:', error);
        alert('Erro ao deletar tarefa');
      }
    }
  };

  const toggleStatus = async (id) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const newStatus = task.status === 'concluida' ? 'pendente' : 'concluida';
      await updateTask(id, { ...task, status: newStatus });
      await loadTasks();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const filteredTasks = tasks.filter(task =>
    filter === 'todas' ? true : task.status === filter
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                📦 Gerenciador de Tarefas
              </h1>
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



  
