// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export const api = {
  // Analyze food image
  analyzeImage: async (imageFile: File) => {
    const formData = new FormData();
    formData.append("file", imageFile);

    const response = await fetch(`${API_BASE_URL}/analyze-image`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Failed to analyze image");
    }

    return response.json();
  },

  // Get analytics data
  getAnalytics: async (meals: any[]) => {
    const response = await fetch(`${API_BASE_URL}/process-analytics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(meals),
    });

    if (!response.ok) {
      // Return null or throw depending on preference, current UI handles errors
      const error = await response.text();
      console.error("Analytics fetch error:", error);
      throw new Error(error || "Failed to fetch analytics");
    }

    return response.json();
  },

  // Get health insight
  getInsight: async (data: { protein: number; carbs: number; goal: number }) => {
    const response = await fetch(`${API_BASE_URL}/get-insight`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Failed to fetch insight");
    }

    return response.json();
  },
};
