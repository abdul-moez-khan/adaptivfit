"use client";

import { useState, useEffect } from "react";
import { NutritionResponse, NutritionData, Meal, DietItem, deleteNutrition, updateNutrition } from "@/lib/api/nutrition";

interface NutritionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  nutrition: NutritionResponse | null;
  onUpdate?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export default function NutritionDetailModal({
  isOpen,
  onClose,
  nutrition,
  onUpdate,
  onDelete,
  onEdit,
}: NutritionDetailModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !nutrition) return null;

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete the nutrition entry for ${formatDate(nutrition.date)}?`)) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await deleteNutrition(nutrition.date);
      if (onDelete) {
        onDelete();
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete nutrition entry");
      console.error("Delete error:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    }
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="workout-detail-overlay" onClick={onClose}>
      <div className="workout-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="workout-detail-header">
          <div>
            <h2 className="workout-detail-title">
              <i className="ri-restaurant-line"></i> Nutrition Details
            </h2>
            <p className="workout-detail-date">{formatDate(nutrition.date)}</p>
          </div>
          <button className="workout-detail-close" onClick={onClose}>
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="workout-detail-content">
          {error && (
            <div className="workout-detail-error">
              <i className="ri-error-warning-line"></i>
              {error}
            </div>
          )}

          <div className="workout-detail-stats">
            <div className="workout-stat-card">
              <i className="ri-restaurant-line"></i>
              <div className="workout-stat-content">
                <span className="workout-stat-value">{nutrition.meals.length}</span>
                <span className="workout-stat-label">{nutrition.meals.length === 1 ? "Meal" : "Meals"}</span>
              </div>
            </div>
            <div className="workout-stat-card">
              <i className="ri-cup-line"></i>
              <div className="workout-stat-content">
                <span className="workout-stat-value">{nutrition.water_glasses || 0}</span>
                <span className="workout-stat-label">{nutrition.water_glasses === 1 ? "Glass" : "Glasses"} of Water</span>
              </div>
            </div>
            <div className="workout-stat-card">
              <i className="ri-calendar-check-line"></i>
              <div className="workout-stat-content">
                <span className="workout-stat-value">
                  {nutrition.meals.reduce((total, meal) => total + meal.diet_items.length, 0)}
                </span>
                <span className="workout-stat-label">Total Items</span>
              </div>
            </div>
          </div>

          <div className="workout-exercises-list">
            <h3 className="workout-exercises-list-title">
              <i className="ri-restaurant-2-line"></i> Meals
            </h3>

            {nutrition.meals.length > 0 ? (
              nutrition.meals.map((meal, mealIndex) => (
                <div key={mealIndex} className="workout-detail-exercise-card">
                  <div className="workout-detail-exercise-header">
                    <h4 className="workout-detail-exercise-name">
                      {mealIndex + 1}. {meal.meal_name || "Unnamed Meal"}
                    </h4>
                    <span className="workout-detail-exercise-sets-count">
                      {meal.diet_items.length} {meal.diet_items.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <div className="workout-detail-sets-list">
                    {meal.diet_items.map((item, itemIndex) => (
                      <div key={itemIndex} className="workout-detail-set-item">
                        <span className="workout-detail-set-number">Item {itemIndex + 1}</span>
                        <div className="workout-detail-set-details">
                          <span className="workout-detail-set-reps">
                            <i className="ri-restaurant-line"></i> {item.food_name}
                          </span>
                          {(item.weight || item.quantity) && (
                            <span className="workout-detail-set-intensity">
                              <i className="ri-scales-line"></i>{" "}
                              {item.weight ? `${item.weight}g` : item.quantity}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="history-empty">
                <i className="ri-inbox-line"></i>
                <p>No meals logged</p>
              </div>
            )}
          </div>

          {(nutrition.created_at || nutrition.updated_at) && (
            <div className="workout-detail-meta">
              {nutrition.created_at && (
                <div className="workout-detail-meta-item">
                  <i className="ri-calendar-line"></i>
                  <span>Created: {formatDateTime(nutrition.created_at)}</span>
                </div>
              )}
              {nutrition.updated_at && nutrition.updated_at !== nutrition.created_at && (
                <div className="workout-detail-meta-item">
                  <i className="ri-edit-line"></i>
                  <span>Updated: {formatDateTime(nutrition.updated_at)}</span>
                </div>
              )}
            </div>
          )}

          <div className="workout-detail-actions">
            <button
              className="workout-detail-edit-btn"
              onClick={handleEdit}
              type="button"
            >
              <i className="ri-edit-line"></i> Edit Entry
            </button>
            <button
              className="workout-detail-delete-btn"
              onClick={handleDelete}
              disabled={deleting}
              type="button"
            >
              {deleting ? (
                <>
                  <i className="ri-loader-4-line profile-spinner"></i> Deleting...
                </>
              ) : (
                <>
                  <i className="ri-delete-bin-line"></i> Delete Entry
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

