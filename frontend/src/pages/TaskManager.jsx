import React, { useState, useEffect } from "react";
import { Plus, LogOut, Cloud, CloudOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TaskModal from "../components/TaskModal";
import TaskList from "../components/TaskList";
import TaskStats from "../components/TaskStats";
import FilterButtons from "../components/FilterButton";
import {
  addTask,
  deleteTask,
  getAllTasks,
  updateTask,
} from "../../../db/db.js";
import { triggerAutoSync, isAutoSyncing, forceSyncNow } from "../utils/autoSync.js";

export default function TaskManager() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState("todas");
  const [loading, setLoading] = useState(true);
  const [dbBusy, setDbBusy] = useState(false);
  const [error, setError] = useState(null);
  const [autoSyncing, setAutoSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "media",
    dueDate: "",
    status: "pendente",
  });

  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    loadTasks();
    
    const syncCheckInterval = setInterval(() => {
      setAutoSyncing(isAutoSyncing());
    }, 500);
    
    return () => clearInterval(syncCheckInterval);
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const allTasks = await getAllTasks(userEmail);
      setTasks(allTasks || []);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
      setError("Erro ao carregar tarefas do banco de dados. Por favor, recarregue a página.");
    } finally {
      setLoading(false);
    }
  };

  const safeDBAction = async (callback) => {
    if (dbBusy) return;
    setDbBusy(true);
    setError(null);
    try {
      await callback();
    } catch (err) {
      console.error("Database error:", err);
      setError(err.message || "Ocorreu um erro ao processar a operação. Tente novamente.");
      throw err;
    } finally {
      setDbBusy(false);
    }
  };

  const resetForm = () =>
    setFormData({
      title: "",
      description: "",
      priority: "media",
      dueDate: "",
      status: "pendente",
    });

  const sanitizeInput = (input) => {
    if (typeof input !== "string") return input;
    return input
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  };

  const validateTaskData = (data) => {
    const errors = [];
    
    if (!data.title || !data.title.trim()) {
      errors.push("Título é obrigatório");
    } else if (data.title.length > 200) {
      errors.push("Título deve ter no máximo 200 caracteres");
    }

    if (data.description && data.description.length > 1000) {
      errors.push("Descrição deve ter no máximo 1000 caracteres");
    }

    if (data.dueDate) {
      const dueDate = new Date(data.dueDate);
      if (isNaN(dueDate.getTime())) {
        errors.push("Data inválida");
      }
    }

    if (!["baixa", "media", "alta"].includes(data.priority)) {
      errors.push("Prioridade inválida");
    }

    if (!["pendente", "concluida"].includes(data.status)) {
      errors.push("Status inválido");
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = name === "title" || name === "description" 
      ? sanitizeInput(value) 
      : value;
    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateTaskData(formData);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(". "));
      return;
    }

    try {
      await safeDBAction(async () => {
        if (editingTask) {
          await updateTask(editingTask.id, formData);
        } else {
          await addTask(formData);
        }
        await loadTasks();
        resetForm();
        setIsModalOpen(false);
        setEditingTask(null);
        
        triggerAutoSync(
          () => setAutoSyncing(true),
          (success, message) => {
            setAutoSyncing(false);
            if (success) {
              setLastSyncTime(new Date());
            }
          }
        );
      });
    } catch (err) {
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      dueDate: task.dueDate || "",
      status: task.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta tarefa?")) {
      try {
        await safeDBAction(async () => {
          await deleteTask(id);
          await loadTasks();
          
          triggerAutoSync(
            () => setAutoSyncing(true),
            (success, message) => {
              setAutoSyncing(false);
              if (success) {
                setLastSyncTime(new Date());
              }
            }
          );
        });
      } catch (err) {
      }
    }
  };

  const toggleStatus = async (id) => {
    try {
      await safeDBAction(async () => {
        const task = tasks.find((t) => t.id === id);
        if (!task) {
          setError("Tarefa não encontrada");
          return;
        }
        const newStatus = task.status === "concluida" ? "pendente" : "concluida";
        await updateTask(id, { status: newStatus });
        await loadTasks();
        
        triggerAutoSync(
          () => setAutoSyncing(true),
          (success, message) => {
            setAutoSyncing(false);
            if (success) {
              setLastSyncTime(new Date());
            }
          }
        );
      });
    } catch (err) {
    }
  };

  const handleSyncToSupabase = async () => {
    if (tasks.length === 0) {
      setError("Nenhuma tarefa para sincronizar");
      return;
    }

    setAutoSyncing(true);
    setError(null);

    try {
      await forceSyncNow();
      setLastSyncTime(new Date());
    } catch (err) {
      console.error("Sync error:", err);
      setError(err.message || "Erro ao sincronizar tarefas com Supabase");
    } finally {
      setAutoSyncing(false);
    }
  };

  const filteredTasks = tasks.filter((task) =>
    filter === "todas" ? true : task.status === filter
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
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-800">
                  Gerenciador de Tarefas
                </h1>
                {autoSyncing && (
                  <div className="flex items-center gap-2 text-sm text-indigo-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                    <span className="hidden sm:inline">Sincronizando...</span>
                  </div>
                )}
                {!autoSyncing && lastSyncTime && (
                  <div className="flex items-center gap-1 text-xs text-green-600" title={`Última sincronização: ${lastSyncTime.toLocaleTimeString()}`}>
                    <Cloud size={14} />
                    <span className="hidden sm:inline">Sincronizado</span>
                  </div>
                )}
              </div>
              <p className="text-gray-500 text-sm">{userEmail}</p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleSyncToSupabase}
                disabled={autoSyncing || dbBusy || tasks.length === 0}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                title="Sincronizar manualmente (auto-sync está ativo)"
              >
                {autoSyncing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sincronizando...</span>
                  </>
                ) : (
                  <>
                    <Cloud size={20} />
                    <span className="hidden sm:inline">Sync Manual</span>
                    <span className="sm:hidden">Sync</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  resetForm();
                  setEditingTask(null);
                  setIsModalOpen(true);
                }}
                disabled={dbBusy}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md disabled:opacity-50"
              >
                <Plus size={20} />
                Nova Tarefa
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem("isAuthenticated");
                  localStorage.removeItem("userEmail");
                  window.dispatchEvent(new Event("storage"));
                  navigate("/");
                }}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md"
              >
                <LogOut size={20} />
                Sair
              </button>
            </div>
          </div>

          <FilterButtons filter={filter} setFilter={setFilter} />
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 font-bold"
            >
              ×
            </button>
          </div>
        )}

        <TaskStats tasks={tasks} />

        {filteredTasks.length === 0 ? (
          <p className="text-center text-gray-600 mt-6">
            Nenhuma tarefa encontrada.
          </p>
        ) : (
          <TaskList
            tasks={filteredTasks}
            toggleStatus={toggleStatus}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        )}

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
