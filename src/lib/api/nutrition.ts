/**
 * Nutrition API functions
 */

import { API_BASE_URL, API_ENDPOINTS } from "../config";
import { getToken } from "../utils/token";
import { getErrorMessage } from "../utils/errorMessage";

export interface DietItem {
  food_name: string;
  weight?: string; // Optional - user selects either weight OR quantity
  quantity?: string; // Optional - user selects either weight OR quantity
}

export interface Meal {
  meal_name: string;
  diet_items: DietItem[];
}

export interface NutritionData {
  date: string; // YYYY-MM-DD format
  meals: Meal[];
  water_glasses: number;
}

export interface NutritionResponse extends NutritionData {
  created_at?: string;
  updated_at?: string;
}

/**
 * Get nutrition entries - all or by specific date
 */
export const getNutritionEntries = async (date?: string): Promise<NutritionResponse[]> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    let url = `${API_BASE_URL}${API_ENDPOINTS.NUTRITION.GET}?access_token=${token}`;
    if (date) {
      url += `&date=${date}`;
    }

    console.log("Fetching nutrition entries:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = "Failed to fetch nutrition entries";
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error("Unauthorized - Please login again");
      }

      throw new Error(`${errorMessage} (Status: ${response.status})`);
    }

    const result = await response.json();
    console.log("Nutrition entries fetched successfully:", result);
    
    // If single entry returned (when date is provided), wrap in array
    if (date && !Array.isArray(result)) {
      return [result];
    }
    
    // If array returned, return as is
    return Array.isArray(result) ? result : [];
  } catch (error: unknown) {
    console.error("Error in getNutritionEntries:", error);
    throw new Error(getErrorMessage(error, "Failed to fetch nutrition entries"));
  }
};

/**
 * Get single nutrition entry by date
 */
export const getNutritionByDate = async (date: string): Promise<NutritionResponse | null> => {
  try {
    const entries = await getNutritionEntries(date);
    return entries.length > 0 ? entries[0] : null;
  } catch (error: unknown) {
    console.error("Error in getNutritionByDate:", error);
    // If 404 or not found, return null
    if (getErrorMessage(error, "").includes("404") || getErrorMessage(error, "").includes("not found")) {
      return null;
    }
    throw error;
  }
};

/**
 * Create nutrition entry
 */
export const createNutrition = async (data: NutritionData): Promise<NutritionResponse> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}${API_ENDPOINTS.NUTRITION.CREATE}?access_token=${token}`;
    console.log("Creating nutrition entry:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = "Failed to create nutrition entry";
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error("Unauthorized - Please login again");
      }

      if (response.status === 422) {
        throw new Error(errorMessage);
      }

      throw new Error(`${errorMessage} (Status: ${response.status})`);
    }

    const result = await response.json();
    console.log("Nutrition entry created successfully:", result);
    return result;
  } catch (error: unknown) {
    console.error("Error in createNutrition:", error);
    throw new Error(getErrorMessage(error, "Failed to create nutrition entry"));
  }
};

/**
 * Update nutrition entry
 */
export const updateNutrition = async (date: string, data: Partial<NutritionData>): Promise<NutritionResponse> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}${API_ENDPOINTS.NUTRITION.UPDATE}?access_token=${token}&date=${date}`;
    console.log("Updating nutrition entry:", url);

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = "Failed to update nutrition entry";
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error("Unauthorized - Please login again");
      }

      if (response.status === 404) {
        throw new Error("Nutrition entry not found for this date");
      }

      if (response.status === 422) {
        throw new Error(errorMessage);
      }

      throw new Error(`${errorMessage} (Status: ${response.status})`);
    }

    const result = await response.json();
    console.log("Nutrition entry updated successfully:", result);
    return result;
  } catch (error: unknown) {
    console.error("Error in updateNutrition:", error);
    throw new Error(getErrorMessage(error, "Failed to update nutrition entry"));
  }
};

/**
 * Delete nutrition entry
 */
export const deleteNutrition = async (date: string): Promise<void> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}${API_ENDPOINTS.NUTRITION.DELETE}?access_token=${token}&date=${date}`;
    console.log("Deleting nutrition entry:", url);

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = "Failed to delete nutrition entry";
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error("Unauthorized - Please login again");
      }

      if (response.status === 404) {
        throw new Error("Nutrition entry not found for this date");
      }

      throw new Error(`${errorMessage} (Status: ${response.status})`);
    }

    console.log("Nutrition entry deleted successfully");
  } catch (error: unknown) {
    console.error("Error in deleteNutrition:", error);
    throw new Error(getErrorMessage(error, "Failed to delete nutrition entry"));
  }
};


