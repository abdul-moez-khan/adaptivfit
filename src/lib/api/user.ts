/**
 * User API functions
 */

import { API_BASE_URL, API_ENDPOINTS } from "../config";
import { getToken } from "../utils/token";

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  full_name: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get authenticated user's profile
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}${API_ENDPOINTS.AUTH.ME}`;
    console.log("Fetching user profile from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      let errorMessage = "Failed to fetch user profile";
      
      // Try to parse error response
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (e) {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }

      // Handle specific status codes
      if (response.status === 401 || response.status === 403) {
        throw new Error("Unauthorized - Please login again");
      }
      
      if (response.status === 404) {
        throw new Error(`Endpoint not found: ${url}. Please check if the backend endpoint exists.`);
      }

      throw new Error(`${errorMessage} (Status: ${response.status})`);
    }

    const result = await response.json();
    console.log("User profile fetched successfully:", result);
    return result;
  } catch (error: any) {
    console.error("Error in getUserProfile:", error);
    // Re-throw the error with more context
    if (error.message) {
      throw error;
    }
    throw new Error(error.message || "Failed to fetch user profile");
  }
};

