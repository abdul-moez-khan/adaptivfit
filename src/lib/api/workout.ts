/**
 * Workout API functions
 */

import { API_BASE_URL, API_ENDPOINTS } from "../config";
import { getToken } from "../utils/token";
import { getErrorMessage } from "../utils/errorMessage";
import type { FastApiValidationError } from "./types";

export interface WorkoutSet {
  reps: number;
  intensity: "low" | "medium" | "high";
}

export interface WorkoutExercise {
  exercise_name: string;
  sets: WorkoutSet[];
}

export interface WorkoutData {
  date: string; // YYYY-MM-DD format
  total_duration: number; // in minutes
  exercises: WorkoutExercise[];
}

export interface WorkoutResponse extends WorkoutData {
  created_at?: string;
  updated_at?: string;
}

/**
 * Get workouts - all or by specific date
 */
export const getWorkouts = async (date?: string): Promise<WorkoutResponse[]> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    let url = `${API_BASE_URL}${API_ENDPOINTS.WORKOUT.GET}?access_token=${token}`;
    if (date) {
      url += `&date=${date}`;
    }

    console.log("Fetching workouts:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = "Failed to fetch workouts";
      
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
    console.log("Workouts fetched successfully:", result);
    
    // If single workout returned (when date is provided), wrap in array
    if (date && !Array.isArray(result)) {
      return [result];
    }
    
    // If array returned, return as is
    return Array.isArray(result) ? result : [];
  } catch (error: unknown) {
    console.error("Error in getWorkouts:", error);
    throw new Error(getErrorMessage(error, "Failed to fetch workouts"));
  }
};

/**
 * Get single workout by date
 */
export const getWorkoutByDate = async (date: string): Promise<WorkoutResponse | null> => {
  try {
    const workouts = await getWorkouts(date);
    return workouts.length > 0 ? workouts[0] : null;
  } catch (error: unknown) {
    console.error("Error in getWorkoutByDate:", error);
    // If 404 or not found, return null
    if (getErrorMessage(error, "").includes("404") || getErrorMessage(error, "").includes("not found")) {
      return null;
    }
    throw error;
  }
};

/**
 * Create workout
 */
export const createWorkout = async (data: WorkoutData): Promise<WorkoutResponse> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}${API_ENDPOINTS.WORKOUT.CREATE}?access_token=${token}`;
    console.log("Creating workout:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = "Failed to create workout";
      
      try {
        const errorData = await response.json();
        console.error("Create workout error response:", errorData);
        
        // Handle different error response formats
        if (Array.isArray(errorData.detail)) {
          // Validation errors - array of error objects
          errorMessage = errorData.detail
            .map((err: FastApiValidationError | string) => {
              if (typeof err === "string") return err;
              if (err.msg) return err.msg;
              if (err.message) return err.message;
              if (err.loc && err.msg) return `${err.loc.join(".")}: ${err.msg}`;
              return JSON.stringify(err);
            })
            .join(", ");
        } else if (errorData.detail) {
          // Single detail string or object
          if (typeof errorData.detail === "string") {
            errorMessage = errorData.detail;
          } else if (errorData.detail.msg) {
            errorMessage = errorData.detail.msg;
          } else {
            errorMessage = JSON.stringify(errorData.detail);
          }
        } else if (errorData.message) {
          errorMessage = typeof errorData.message === "string" 
            ? errorData.message 
            : JSON.stringify(errorData.message);
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === "string"
            ? errorData.error
            : JSON.stringify(errorData.error);
        }
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error("Unauthorized - Please login again");
      }

      if (response.status === 400 || response.status === 409) {
        // Conflict - workout already exists for this date
        throw new Error("A workout already exists for this date. Please update it instead.");
      }

      if (response.status === 422) {
        // Validation error - use the parsed error message
        throw new Error(errorMessage || "Validation error: Please check your input");
      }

      throw new Error(`${errorMessage} (Status: ${response.status})`);
    }

    const result = await response.json();
    console.log("Workout created successfully:", result);
    return result;
  } catch (error: unknown) {
    console.error("Error in createWorkout:", error);
    throw new Error(getErrorMessage(error, "Failed to create workout"));
  }
};

/**
 * Update workout
 */
export const updateWorkout = async (date: string, data: Partial<WorkoutData>): Promise<WorkoutResponse> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}${API_ENDPOINTS.WORKOUT.UPDATE}?access_token=${token}&date=${date}`;
    console.log("Updating workout:", url);

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = "Failed to update workout";
      
      try {
        const errorData = await response.json();
        console.error("Update workout error response:", errorData);
        
        // Handle different error response formats
        if (Array.isArray(errorData.detail)) {
          // Validation errors - array of error objects
          errorMessage = errorData.detail
            .map((err: FastApiValidationError | string) => {
              if (typeof err === "string") return err;
              if (err.msg) return err.msg;
              if (err.message) return err.message;
              if (err.loc && err.msg) return `${err.loc.join(".")}: ${err.msg}`;
              return JSON.stringify(err);
            })
            .join(", ");
        } else if (errorData.detail) {
          // Single detail string or object
          if (typeof errorData.detail === "string") {
            errorMessage = errorData.detail;
          } else if (errorData.detail.msg) {
            errorMessage = errorData.detail.msg;
          } else {
            errorMessage = JSON.stringify(errorData.detail);
          }
        } else if (errorData.message) {
          errorMessage = typeof errorData.message === "string" 
            ? errorData.message 
            : JSON.stringify(errorData.message);
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === "string"
            ? errorData.error
            : JSON.stringify(errorData.error);
        }
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error("Unauthorized - Please login again");
      }

      if (response.status === 422) {
        // Validation error - use the parsed error message
        throw new Error(errorMessage || "Validation error: Please check your input");
      }

      throw new Error(`${errorMessage} (Status: ${response.status})`);
    }

    const result = await response.json();
    console.log("Workout updated successfully:", result);
    return result;
  } catch (error: unknown) {
    console.error("Error in updateWorkout:", error);
    throw new Error(getErrorMessage(error, "Failed to update workout"));
  }
};

/**
 * Delete workout by date
 */
export const deleteWorkout = async (date: string): Promise<void> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}${API_ENDPOINTS.WORKOUT.DELETE}?access_token=${token}&date=${date}`;
    console.log("Deleting workout:", url);

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = "Failed to delete workout";
      
      try {
        const errorData = await response.json();
        console.error("Delete workout error response:", errorData);
        
        // Handle different error response formats
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail
            .map((err: FastApiValidationError | string) => {
              if (typeof err === "string") return err;
              if (err.msg) return err.msg;
              if (err.message) return err.message;
              if (err.loc && err.msg) return `${err.loc.join(".")}: ${err.msg}`;
              return JSON.stringify(err);
            })
            .join(", ");
        } else if (errorData.detail) {
          if (typeof errorData.detail === "string") {
            errorMessage = errorData.detail;
          } else if (errorData.detail.msg) {
            errorMessage = errorData.detail.msg;
          } else {
            errorMessage = JSON.stringify(errorData.detail);
          }
        } else if (errorData.message) {
          errorMessage = typeof errorData.message === "string" 
            ? errorData.message 
            : JSON.stringify(errorData.message);
        }
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error("Unauthorized - Please login again");
      }

      if (response.status === 404) {
        throw new Error("Workout not found");
      }

      throw new Error(`${errorMessage} (Status: ${response.status})`);
    }

    // 204 No Content means success
    console.log("Workout deleted successfully");
  } catch (error: unknown) {
    console.error("Error in deleteWorkout:", error);
    throw new Error(getErrorMessage(error, "Failed to delete workout"));
  }
};

