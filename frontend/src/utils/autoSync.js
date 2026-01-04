import { syncTasksToSupabase } from "./sync.js";

let syncTimeout = null;
let isSyncing = false;
let syncCallbacks = [];

const SYNC_DEBOUNCE_MS = 1000;

export async function triggerAutoSync(onSyncStart = null, onSyncComplete = null) {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  if (onSyncStart) syncCallbacks.push({ type: "start", fn: onSyncStart });
  if (onSyncComplete) syncCallbacks.push({ type: "complete", fn: onSyncComplete });

  syncTimeout = setTimeout(async () => {
    await performSync();
  }, SYNC_DEBOUNCE_MS);
}

async function performSync() {
  if (isSyncing) {
    return;
  }

  isSyncing = true;

  syncCallbacks
    .filter((cb) => cb.type === "start")
    .forEach((cb) => {
      try {
        cb.fn();
      } catch (e) {
        console.error("Sync callback error:", e);
      }
    });

  try {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      throw new Error("User not logged in");
    }

    const { getAllTasks } = await import("../../../db/db.js");
    
    const allTasks = await getAllTasks(userEmail);

    if (!allTasks || allTasks.length === 0) {
      notifyComplete(true, "No tasks to sync");
      return;
    }

    await syncTasksToSupabase(allTasks);

    notifyComplete(true, "Synced successfully");
  } catch (error) {
    console.warn("Auto-sync failed (this is normal if backend is offline):", error.message);
    notifyComplete(false, error.message);
  } finally {
    isSyncing = false;
    syncCallbacks = [];
  }
}

function notifyComplete(success, message) {
  syncCallbacks
    .filter((cb) => cb.type === "complete")
    .forEach((cb) => {
      try {
        cb.fn(success, message);
      } catch (e) {
        console.error("Sync callback error:", e);
      }
    });
}

export async function forceSyncNow() {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
    syncTimeout = null;
  }
  await performSync();
}

export function isAutoSyncing() {
  return isSyncing;
}
