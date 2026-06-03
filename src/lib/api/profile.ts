/**
 * Profile API functions
 */

import { API_BASE_URL, API_ENDPOINTS } from "../config";
import { getToken } from "../utils/token";
import { getErrorMessage } from "../utils/errorMessage";

export interface ProfileData {
  age?: number;
  height?: number;
  body_weight?: number;
  goal?: string;
  lifestyle_routine?: string;
  medical_condition?: string;
}

export interface ProfileResponse {
  id?: number;
  age?: number;
  height?: number;
  body_weight?: number;
  goal?: string;
  lifestyle_routine?: string;
  medical_condition?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get user profile
 */
export const getProfile = async (): Promise<ProfileResponse | null> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}${API_ENDPOINTS.PROFILE.GET}?access_token=${token}`;
    console.log("Fetching profile:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // If 404, profile doesn't exist yet
      if (response.status === 404) {
        return null;
      }

      let errorMessage = "Failed to fetch profile";
      
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
    console.log("Profile fetched successfully:", result);
    return result;
  } catch (error: unknown) {
    console.error("Error in getProfile:", error);
    // If it's a 404 or "not found" error, return null (profile doesn't exist)
    if (getErrorMessage(error, "").includes("404") || getErrorMessage(error, "").includes("not found") || getErrorMessage(error, "").includes("Not Found")) {
      return null;
    }
    throw new Error(getErrorMessage(error, "Failed to fetch profile"));
  }
};

/**
 * Create user profile
 */
export const createProfile = async (data: ProfileData): Promise<ProfileResponse> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}${API_ENDPOINTS.PROFILE.CREATE}?access_token=${token}`;
    console.log("Creating profile:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = "Failed to create profile";
      
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
    console.log("Profile created successfully:", result);
    return result;
  } catch (error: unknown) {
    console.error("Error in createProfile:", error);
    throw new Error(getErrorMessage(error, "Failed to create profile"));
  }
};

/**
 * Update user profile (partial update)
 */
export const updateProfile = async (data: Partial<ProfileData>): Promise<ProfileResponse> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}${API_ENDPOINTS.PROFILE.UPDATE}?access_token=${token}`;
    console.log("Updating profile:", url);

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = "Failed to update profile";
      
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
    console.log("Profile updated successfully:", result);
    return result;
  } catch (error: unknown) {
    console.error("Error in updateProfile:", error);
    throw new Error(getErrorMessage(error, "Failed to update profile"));
  }
};

