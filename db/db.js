const DB_NAME = "CrudForSinergy"
const DB_VERSION = 1
const STORE_NAME = "tasks" // ← Mudei para minúsculo (convenção)

export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)
        
        request.onerror = () => {
            reject("Erro ao conectar com banco de dados")
        }

        request.onsuccess = (event) => {
            resolve(event.target.result)

                db.onversionchange = () => {
                db.close();
                console.log("Database connection closed due to version change.");
          };

          resolve(db);
        }

        request.onupgradeneeded = (event) => {
            const db = event.target.result
            
            // ✅ CORRIGIDO: if agora está DENTRO da função
            if(!db.objectStoreNames.contains(STORE_NAME)){
                // ✅ CORRIGIDO: db.createObjectStore (não DB_NAME)
                const objectStore = db.createObjectStore(STORE_NAME, {
                    keyPath: 'id',
                    autoIncrement: true
                })

                objectStore.createIndex('title', 'title', {unique: false})
                objectStore.createIndex('status', 'status', {unique: false})
                objectStore.createIndex('priority', 'priority', {unique: false})
                objectStore.createIndex('createdAt', 'createdAt', {unique: false})
            }
        }
    })
}

export const addTask = async (task) => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    
    const taskData = {
      ...task,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const request = objectStore.add(taskData);

    request.onsuccess = () => {
      resolve({ ...taskData, id: request.result });
    };

    request.onerror = () => {
      reject('Erro ao adicionar tarefa');
    };
  });
};

export const getAllTasks = async () => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject('Erro ao buscar tarefas');
    };
  });
};

export const getTaskById = async (id) => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.get(id);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject('Erro ao buscar tarefa');
    };
  });
};

export const updateTask = async (id, updatedData) => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    
    const getRequest = objectStore.get(id);

    getRequest.onsuccess = () => {
      const existingTask = getRequest.result;
      
      if (!existingTask) {
        reject('Tarefa não encontrada');
        return;
      }

      const updatedTask = {
        ...existingTask,
        ...updatedData,
        id: id,
        updatedAt: new Date().toISOString()
      };

      const updateRequest = objectStore.put(updatedTask);

      updateRequest.onsuccess = () => {
        resolve(updatedTask);
      };

      updateRequest.onerror = () => {
        reject('Erro ao atualizar tarefa');
      };
    };

    getRequest.onerror = () => {
      reject('Erro ao buscar tarefa para atualizar');
    };
  });
};

export const deleteTask = async (id) => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.delete(id);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject('Erro ao deletar tarefa');
    };
  });
};

export const getTasksByStatus = async (status) => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const index = objectStore.index('status');
    const request = index.getAll(status);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject('Erro ao buscar tarefas por status');
    };
  });
};