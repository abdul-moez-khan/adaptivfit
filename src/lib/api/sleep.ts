/**
 * Sleep API functions
 */

import { API_BASE_URL, API_ENDPOINTS } from "../config";
import { getToken } from "../utils/token";

export interface SleepData {
  date: string; // YYYY-MM-DD format
  sleep_start: string;
  sleep_end: string;
  total_sleep_hours: number;
  sleep_quality: "excellent" | "good" | "fair" | "poor";
  energy_level_morning: "low" | "medium" | "high";
  muscle_soreness: "none" | "mild" | "moderate" | "severe";
  notes?: string;
}

export interface SleepResponse extends SleepData {
  created_at?: string;
  updated_at?: string;
}

/**
 * Get sleep entries - all or by specific date
 */
export const getSleepEntries = async (date?: string): Promise<SleepResponse[]> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    let url = `${API_BASE_URL}${API_ENDPOINTS.SLEEP.GET}?access_token=${token}`;
    if (date) {
      url += `&date=${date}`;
    }

    console.log("Fetching sleep entries:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = "Failed to fetch sleep entries";
      
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
    console.log("Sleep entries fetched successfully:", result);
    
    // If single entry returned (when date is provided), wrap in array
    if (date && !Array.isArray(result)) {
      return [result];
    }
    
    // If array returned, return as is
    return Array.isArray(result) ? result : [];
  } catch (error: any) {
    console.error("Error in getSleepEntries:", error);
    throw new Error(error.message || "Failed to fetch sleep entries");
  }
};

/**
 * Get single sleep entry by date
 */
export const getSleepByDate = async (date: string): Promise<SleepResponse | null> => {
  try {
    const entries = await getSleepEntries(date);
    return entries.length > 0 ? entries[0] : null;
  } catch (error: any) {
    console.error("Error in getSleepByDate:", error);
    // If 404 or not found, return null
    if (error.message.includes("404") || error.message.includes("not found")) {
      return null;
    }
    throw error;
  }
};

/**
 * Create sleep entry
 */
export const createSleep = async (data: SleepData): Promise<SleepResponse> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}${API_ENDPOINTS.SLEEP.CREATE}?access_token=${token}`;
    console.log("Creating sleep entry:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = "Failed to create sleep entry";
      
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
    console.log("Sleep entry created successfully:", result);
    return result;
  } catch (error: any) {
    console.error("Error in createSleep:", error);
    throw new Error(error.message || "Failed to create sleep entry");
  }
};

/**
 * Update sleep entry
 */
export const updateSleep = async (date: string, data: Partial<SleepData>): Promise<SleepResponse> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}${API_ENDPOINTS.SLEEP.UPDATE}?access_token=${token}&date=${date}`;
    console.log("Updating sleep entry:", url);

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = "Failed to update sleep entry";
      
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
        throw new Error("Sleep entry not found for this date");
      }

      if (response.status === 422) {
        throw new Error(errorMessage);
      }

      throw new Error(`${errorMessage} (Status: ${response.status})`);
    }

    const result = await response.json();
    console.log("Sleep entry updated successfully:", result);
    return result;
  } catch (error: any) {
    console.error("Error in updateSleep:", error);
    throw new Error(error.message || "Failed to update sleep entry");
  }
};

/**
 * Delete sleep entry
 */
export const deleteSleep = async (date: string): Promise<void> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}${API_ENDPOINTS.SLEEP.DELETE}?access_token=${token}&date=${date}`;
    console.log("Deleting sleep entry:", url);

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = "Failed to delete sleep entry";
      
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
        throw new Error("Sleep entry not found for this date");
      }

      throw new Error(`${errorMessage} (Status: ${response.status})`);
    }

    console.log("Sleep entry deleted successfully");
  } catch (error: any) {
    console.error("Error in deleteSleep:", error);
    throw new Error(error.message || "Failed to delete sleep entry");
  }
};

