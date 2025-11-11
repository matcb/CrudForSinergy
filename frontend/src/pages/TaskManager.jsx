import React, { useState, useEffect } from "react";
import { Plus, LogOut } from "lucide-react";
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

export default function TaskManager() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState("todas");
  const [loading, setLoading] = useState(true);
  const [dbBusy, setDbBusy] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "media",
    dueDate: "",
    status: "pendente",
  });

  const userEmail = localStorage.getItem("userEmail");

  // --------------------------------------------------- LOAD TASKS
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const allTasks = await getAllTasks(userEmail);
      setTasks(allTasks || []);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
      alert("Erro ao carregar tarefas do banco de dados");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------- SAFE DB WRAPPER
  const safeDBAction = async (callback) => {
    if (dbBusy) return;
    setDbBusy(true);
    try {
      await callback();
    } finally {
      setDbBusy(false);
    }
  };

  // --------------------------------------------------- FORM HELPERS
  const resetForm = () =>
    setFormData({
      title: "",
      description: "",
      priority: "media",
      dueDate: "",
      status: "pendente",
    });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --------------------------------------------------- SAVE TASK
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Título é obrigatório!");
      return;
    }

    await safeDBAction(async () => {
      if (editingTask) {
        await updateTaskForUser(editingTask.id, formData, userEmail);
      } else {
        await addTask(formData, userEmail);
      }
      await loadTasks();
      resetForm();
      setIsModalOpen(false);
      setEditingTask(null);
    });
  };

  // --------------------------------------------------- EDIT / DELETE / TOGGLE
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
      await safeDBAction(async () => {
        await deleteTaskForUser(id, userEmail);
        await loadTasks();
      });
    }
  };

  const toggleStatus = async (id) => {
    await safeDBAction(async () => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const newStatus = task.status === "concluida" ? "pendente" : "concluida";
      await updateTaskForUser(id, { ...task, status: newStatus }, userEmail);
      await loadTasks();
    });
  };

  // --------------------------------------------------- FILTER
  const filteredTasks = tasks.filter((task) =>
    filter === "todas" ? true : task.status === filter
  );

  // --------------------------------------------------- LOADING UI
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

  // --------------------------------------------------- MAIN UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* ---------- HEADER ---------- */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Gerenciador de Tarefas
              </h1>
              <p className="text-gray-500 text-sm">{userEmail}</p>
            </div>

            <div className="flex gap-3">
              {/* NOVA TAREFA */}
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

              {/* LOGOUT */}
              <button
                onClick={() => {
                  localStorage.removeItem("isAuthenticated");
                  localStorage.removeItem("userEmail");
                  window.dispatchEvent(new Event("storage")); // atualiza App.jsx
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

        {/* ---------- STATS ---------- */}
        <TaskStats tasks={tasks} />

        {/* ---------- LIST OR EMPTY MESSAGE ---------- */}
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

        {/* ---------- MODAL ---------- */}
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
