/**
 * Authentication API functions
 */

import { API_BASE_URL, API_ENDPOINTS } from "../config";
import { setToken, removeToken } from "../utils/token";
import { getErrorMessage } from "../utils/errorMessage";
import type { FastApiValidationError } from "./types";

export interface SignupData {
  email: string;
  username: string;
  password: string;
  full_name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

/**
 * Signup API call
 */
export const signup = async (data: SignupData): Promise<Record<string, unknown>> => {
  try {
    // Ensure all required fields are present
    const signupData = {
      email: data.email?.trim(),
      username: data.username?.trim(),
      password: data.password,
      full_name: data.full_name?.trim(),
    };

    // Validate required fields
    if (!signupData.email || !signupData.username || !signupData.password || !signupData.full_name) {
      throw new Error("All fields are required");
    }

    // Validate username pattern (letters, numbers, underscores, hyphens, and spaces)
    const usernamePattern = /^[a-zA-Z0-9_-\s]+$/;
    if (!usernamePattern.test(signupData.username)) {
      throw new Error("Username can only contain letters, numbers, underscores (_), hyphens (-), and spaces");
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.SIGNUP}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signupData),
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle 422 validation errors
      if (response.status === 422) {
        let errorMessage = "";
        
        // Handle different error formats
        if (result.detail) {
          if (Array.isArray(result.detail)) {
            // FastAPI validation errors format
            const errors = result.detail.map((err: FastApiValidationError) => {
              const field = err.loc ? err.loc.join(".") : "field";
              let msg = err.msg || err.message || "Invalid value";
              
              // User-friendly error messages
              if (msg.includes("String should match pattern")) {
                if (field.includes("username")) {
                  msg = "Username can only contain letters, numbers, underscores (_), hyphens (-), and spaces";
                } else if (field.includes("email")) {
                  msg = "Please enter a valid email address";
                } else if (field.includes("password")) {
                  msg = "Password does not meet requirements";
                }
              }
              
              return msg;
            });
            errorMessage = errors.join(", ");
          } else if (typeof result.detail === "string") {
            // Clean up error messages
            if (result.detail.includes("username") && result.detail.includes("pattern")) {
              errorMessage = "Username can only contain letters, numbers, underscores (_), hyphens (-), and spaces";
            } else {
              errorMessage = result.detail;
            }
          } else if (typeof result.detail === "object") {
            // Handle object with field errors
            const fieldErrors = Object.entries(result.detail as Record<string, string | string[]>)
              .map(([field, messages]) => {
                if (Array.isArray(messages)) {
                  return `${field}: ${messages.join(", ")}`;
                }
                return `${field}: ${messages}`;
              });
            errorMessage = fieldErrors.join(", ");
          }
        } else if (result.message) {
          errorMessage = result.message;
        } else if (result.error) {
          errorMessage = result.error;
        }
        
        if (!errorMessage) {
          errorMessage = "Please check your input and try again.";
        }
        
        throw new Error(errorMessage);
      }
      
      // Handle other errors
      throw new Error(result.detail || result.message || "Signup failed");
    }

    return result;
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Signup failed. Please try again.");
    if (message && message !== "Signup failed") {
      throw error instanceof Error ? error : new Error(message);
    }
    throw new Error(message);
  }
};

/**
 * Login API call
 */
export const login = async (data: LoginData): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || "Login failed");
    }

    // Store token
    if (result.access_token) {
      setToken(result.access_token);
    }

    return result;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Login failed"));
  }
};

/**
 * Logout - remove token
 */
export const logout = (): void => {
  removeToken();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

