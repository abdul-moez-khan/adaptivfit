/**
 * API Configuration
 */

// Backend API Base URL
export const API_BASE_URL = "http://127.0.0.1:8000";

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: "/api/v1/auth/signup",
    LOGIN: "/api/v1/auth/login",
    ME: "/api/v1/auth/me", // Get current user profile
  },
  USER: {
    PROFILE: "/api/v1/auth/me", // Alias for consistency
  },
  PROFILE: {
    GET: "/api/v1/profile/profile", // Get user profile
    CREATE: "/api/v1/profile/profile", // Create user profile
    UPDATE: "/api/v1/profile/profile/update", // Update user profile
  },
  WORKOUT: {
    GET: "/api/v1/workout/workout", // Get workouts (all or by date)
    CREATE: "/api/v1/workout/workout", // Create workout
    UPDATE: "/api/v1/workout/workout/update", // Update workout
    DELETE: "/api/v1/workout/workout/delete", // Delete workout
  },
  NUTRITION: {
    GET: "/api/v1/nutrition/nutrition", // Get nutrition entries (all or by date)
    CREATE: "/api/v1/nutrition/nutrition", // Create nutrition entry
    UPDATE: "/api/v1/nutrition/nutrition/update", // Update nutrition entry
    DELETE: "/api/v1/nutrition/nutrition/delete", // Delete nutrition entry
  },
  SLEEP: {
    GET: "/api/v1/sleep/sleep", // Get sleep entries (all or by date)
    CREATE: "/api/v1/sleep/sleep", // Create sleep entry
    UPDATE: "/api/v1/sleep/sleep/update", // Update sleep entry
    DELETE: "/api/v1/sleep/sleep/delete", // Delete sleep entry
  },
  DIGESTION: {
    GET: "/api/v1/digestion/digestion", // Get digestion entries (all or by date)
    CREATE: "/api/v1/digestion/digestion", // Create digestion entry
    UPDATE: "/api/v1/digestion/digestion/update", // Update digestion entry
    DELETE: "/api/v1/digestion/digestion/delete", // Delete digestion entry
  },
};
