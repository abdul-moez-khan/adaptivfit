"use client";

import { useState } from "react";
import { WorkoutResponse, deleteWorkout } from "@/lib/api/workout";

interface WorkoutDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: WorkoutResponse | null;
  onUpdate?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

const intensityLabels: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export default function WorkoutDetailModal({
  isOpen,
  onClose,
  workout,
  onUpdate,
  onDelete,
  onEdit,
}: WorkoutDetailModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !workout) return null;

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete the workout for ${formatDate(workout.date)}?`)) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await deleteWorkout(workout.date);
      if (onDelete) {
        onDelete();
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete workout");
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
              <i className="ri-run-line"></i> Workout Details
            </h2>
            <p className="workout-detail-date">{formatDate(workout.date)}</p>
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
              <i className="ri-time-line"></i>
              <div className="workout-stat-content">
                <span className="workout-stat-value">{workout.total_duration}</span>
                <span className="workout-stat-label">Minutes</span>
              </div>
            </div>
            <div className="workout-stat-card">
              <i className="ri-list-check"></i>
              <div className="workout-stat-content">
                <span className="workout-stat-value">{workout.exercises.length}</span>
                <span className="workout-stat-label">Exercises</span>
              </div>
            </div>
            <div className="workout-stat-card">
              <i className="ri-repeat-line"></i>
              <div className="workout-stat-content">
                <span className="workout-stat-value">
                  {workout.exercises.reduce(
                    (total, ex) => total + ex.sets.length,
                    0
                  )}
                </span>
                <span className="workout-stat-label">Total Sets</span>
              </div>
            </div>
          </div>

          <div className="workout-exercises-list">
            <h3 className="workout-exercises-list-title">
              <i className="ri-list-check-2"></i> Exercises
            </h3>

            {workout.exercises.length > 0 ? (
              workout.exercises.map((exercise, exerciseIndex) => (
                <div key={exerciseIndex} className="workout-detail-exercise-card">
                  <div className="workout-detail-exercise-header">
                    <h4 className="workout-detail-exercise-name">
                      {exerciseIndex + 1}. {exercise.exercise_name || "Untitled Exercise"}
                    </h4>
                    <span className="workout-detail-exercise-sets-count">
                      {exercise.sets.length} {exercise.sets.length === 1 ? "set" : "sets"}
                    </span>
                  </div>
                  <div className="workout-detail-sets-list">
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="workout-detail-set-item">
                        <span className="workout-detail-set-number">Set {setIndex + 1}</span>
                        <div className="workout-detail-set-details">
                          <span className="workout-detail-set-reps">
                            <i className="ri-repeat-line"></i> {set.reps} reps
                          </span>
                          <span className={`workout-detail-set-intensity intensity-${set.intensity}`}>
                            <i className="ri-fire-line"></i> {intensityLabels[set.intensity] || set.intensity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="history-empty">
                <i className="ri-inbox-line"></i>
                <p>No exercises logged</p>
              </div>
            )}
          </div>

          {(workout.created_at || workout.updated_at) && (
            <div className="workout-detail-meta">
              {workout.created_at && (
                <div className="workout-detail-meta-item">
                  <i className="ri-calendar-line"></i>
                  <span>Created: {formatDateTime(workout.created_at)}</span>
                </div>
              )}
              {workout.updated_at && workout.updated_at !== workout.created_at && (
                <div className="workout-detail-meta-item">
                  <i className="ri-edit-line"></i>
                  <span>Updated: {formatDateTime(workout.updated_at)}</span>
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
              <i className="ri-edit-line"></i> Edit Workout
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
                  <i className="ri-delete-bin-line"></i> Delete Workout
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
