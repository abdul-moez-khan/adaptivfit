/**
 * Digestion API functions
 */

import { API_BASE_URL, API_ENDPOINTS } from "../config";
import { getToken } from "../utils/token";

export interface DigestionData {
  date: string; // YYYY-MM-DD format
  bowel_movement_time?: string;
  stool_form?: "well_formed" | "loose" | "hard" | "watery" | "constipated";
  stool_frequency?: number;
  digestion_comfort?: "excellent" | "good" | "fair" | "poor";
  bloating?: "none" | "mild" | "moderate" | "severe";
  gas?: "none" | "mild" | "moderate" | "severe";
  appetite?: "excellent" | "good" | "fair" | "poor";
  hydration_level?: "excellent" | "good" | "fair" | "poor";
  notes?: string;
}

export interface DigestionResponse extends DigestionData {
  created_at?: string;
  updated_at?: string;
}

/**
 * Get digestion entries - all or by specific date
 */
export const getDigestionEntries = async (date?: string): Promise<DigestionResponse[]> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    let url = `${API_BASE_URL}${API_ENDPOINTS.DIGESTION.GET}?access_token=${token}`;
    if (date) {
      url += `&date=${date}`;
    }

    console.log("Fetching digestion entries:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = "Failed to fetch digestion entries";
      
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
    console.log("Digestion entries fetched successfully:", result);
    
    // If single entry returned (when date is provided), wrap in array
    if (date && !Array.isArray(result)) {
      return [result];
    }
    
    // If array returned, return as is
    return Array.isArray(result) ? result : [];
  } catch (error: any) {
    console.error("Error in getDigestionEntries:", error);
    throw new Error(error.message || "Failed to fetch digestion entries");
  }
};

/**
 * Get single digestion entry by date
 */
export const getDigestionByDate = async (date: string): Promise<DigestionResponse | null> => {
  try {
    const entries = await getDigestionEntries(date);
    return entries.length > 0 ? entries[0] : null;
  } catch (error: any) {
    console.error("Error in getDigestionByDate:", error);
    // If 404 or not found, return null
    if (error.message.includes("404") || error.message.includes("not found")) {
      return null;
    }
    throw error;
  }
};

/**
 * Create digestion entry
 */
export const createDigestion = async (data: DigestionData): Promise<DigestionResponse> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}${API_ENDPOINTS.DIGESTION.CREATE}?access_token=${token}`;
    console.log("Creating digestion entry:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = "Failed to create digestion entry";
      
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
    console.log("Digestion entry created successfully:", result);
    return result;
  } catch (error: any) {
    console.error("Error in createDigestion:", error);
    throw new Error(error.message || "Failed to create digestion entry");
  }
};

/**
 * Update digestion entry
 */
export const updateDigestion = async (date: string, data: Partial<DigestionData>): Promise<DigestionResponse> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}${API_ENDPOINTS.DIGESTION.UPDATE}?access_token=${token}&date=${date}`;
    console.log("Updating digestion entry:", url);

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = "Failed to update digestion entry";
      
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
        throw new Error("Digestion entry not found for this date");
      }

      if (response.status === 422) {
        throw new Error(errorMessage);
      }

      throw new Error(`${errorMessage} (Status: ${response.status})`);
    }

    const result = await response.json();
    console.log("Digestion entry updated successfully:", result);
    return result;
  } catch (error: any) {
    console.error("Error in updateDigestion:", error);
    throw new Error(error.message || "Failed to update digestion entry");
  }
};

/**
 * Delete digestion entry
 */
export const deleteDigestion = async (date: string): Promise<void> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}${API_ENDPOINTS.DIGESTION.DELETE}?access_token=${token}&date=${date}`;
    console.log("Deleting digestion entry:", url);

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = "Failed to delete digestion entry";
      
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
        throw new Error("Digestion entry not found for this date");
      }

      throw new Error(`${errorMessage} (Status: ${response.status})`);
    }

    console.log("Digestion entry deleted successfully");
  } catch (error: any) {
    console.error("Error in deleteDigestion:", error);
    throw new Error(error.message || "Failed to delete digestion entry");
  }
};

