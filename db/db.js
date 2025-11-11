
let db;
const DB_NAME = "CrudForSinergy";
const DB_VERSION = 3; 
const TASK_STORE = "tasks";
const USER_STORE = "users";


export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject("Erro ao conectar com banco de dados");

    request.onsuccess = (e) => {
      db = e.target.result;
      db.onversionchange = () => {
        db.close();
        console.log("Database connection closed due to version change.");
      };
      resolve(db);
    };

    request.onupgradeneeded = (e) => {
      db = e.target.result;

      if (!db.objectStoreNames.contains(TASK_STORE)) {
        const taskStore = db.createObjectStore(TASK_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
        taskStore.createIndex("title", "title", { unique: false });
        taskStore.createIndex("status", "status", { unique: false });
        taskStore.createIndex("priority", "priority", { unique: false });
        taskStore.createIndex("createdAt", "createdAt", { unique: false });
        taskStore.createIndex("userEmail", "userEmail", { unique: false }); // ✅ required
      }

      
      if (!db.objectStoreNames.contains(USER_STORE)) {
        const userStore = db.createObjectStore(USER_STORE, {
          keyPath: "email", // email is the unique identifier
        });
        userStore.createIndex("email", "email", { unique: true });
      }
    };
  });
};


export const addTask = async (task) => {
  const db = await initDB();
  const email = localStorage.getItem("userEmail");

  return new Promise((resolve, reject) => {
    const tx = db.transaction([TASK_STORE], "readwrite");
    const store = tx.objectStore(TASK_STORE);

    const taskData = {
      ...task,
      userEmail: email, // associate with logged user
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const req = store.add(taskData);
    req.onsuccess = () => resolve({ ...taskData, id: req.result });
    req.onerror = () => reject("Erro ao adicionar tarefa");
  });
};


export const getAllTasks = async (userEmail = null) => {
  const db = await initDB();
  const email = userEmail || localStorage.getItem("userEmail");

  return new Promise((resolve, reject) => {
    const tx = db.transaction([TASK_STORE], "readonly");
    const store = tx.objectStore(TASK_STORE);

    let request;
    if (store.indexNames.contains("userEmail")) {
      const index = store.index("userEmail");
      request = index.getAll(email);
    } else {
      request = store.getAll();
    }

    request.onsuccess = () => {
      const filtered = (request.result || []).filter((t) => t.userEmail === email);
      resolve(filtered);
    };
    request.onerror = () => reject("Erro ao buscar tarefas");
  });
};


export const getTaskById = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([TASK_STORE], "readonly");
    const store = tx.objectStore(TASK_STORE);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject("Erro ao buscar tarefa");
  });
};

  export const updateTask = async (id, updatedData) => {
  const db = await initDB();
  const email = localStorage.getItem("userEmail");

  return new Promise((resolve, reject) => {
    const tx = db.transaction([TASK_STORE], "readwrite");
    const store = tx.objectStore(TASK_STORE);
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const existing = getReq.result;
      if (!existing) return reject("Tarefa não encontrada");
      if (existing.userEmail !== email)
        return reject("Acesso negado — tarefa pertence a outro usuário");

      const updatedTask = {
        ...existing,
        ...updatedData,
        updatedAt: new Date().toISOString(),
      };

      const putReq = store.put(updatedTask);
      putReq.onsuccess = () => resolve(updatedTask);
      putReq.onerror = () => reject("Erro ao atualizar tarefa");
    };

    getReq.onerror = () => reject("Erro ao buscar tarefa");
  });
};


export const deleteTask = async (id) => {
  const db = await initDB();
  const email = localStorage.getItem("userEmail");

  return new Promise((resolve, reject) => {
    const tx = db.transaction([TASK_STORE], "readwrite");
    const store = tx.objectStore(TASK_STORE);
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const existing = getReq.result;
      if (!existing) return reject("Tarefa não encontrada");
      if (existing.userEmail !== email)
        return reject("Acesso negado — tarefa pertence a outro usuário");

      const delReq = store.delete(id);
      delReq.onsuccess = () => resolve(true);
      delReq.onerror = () => reject("Erro ao deletar tarefa");
    };

    getReq.onerror = () => reject("Erro ao buscar tarefa");
  });
};


export const getTasksByStatus = async (status) => {
  const db = await initDB();
  const email = localStorage.getItem("userEmail");

  return new Promise((resolve, reject) => {
    const tx = db.transaction([TASK_STORE], "readonly");
    const store = tx.objectStore(TASK_STORE);
    const index = store.index("status");
    const req = index.getAll(status);

    req.onsuccess = () => {
      const filtered = (req.result || []).filter((t) => t.userEmail === email);
      resolve(filtered);
    };
    req.onerror = () => reject("Erro ao buscar tarefas por status");
  });
};




export const addUser = async (user) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([USER_STORE], "readwrite");
    const store = tx.objectStore(USER_STORE);
    const req = store.add(user);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error?.message ?? "Erro ao cadastrar usuário");
  });
};


export const getUserByEmail = async (email) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([USER_STORE], "readonly");
    const store = tx.objectStore(USER_STORE);
    const req = store.get(email);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};
