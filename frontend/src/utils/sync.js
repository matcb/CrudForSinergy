const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function syncTasksToSupabase(tasks) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tasks/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tasks),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.details || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      throw new Error("Cannot connect to backend server. Make sure the server is running on port 4000.");
    }
    throw error;
  }
}

export async function fetchTasksFromSupabase(userEmail) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/tasks?userEmail=${encodeURIComponent(userEmail)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.details || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      throw new Error("Cannot connect to backend server. Make sure the server is running on port 4000.");
    }
    throw error;
  }
}
