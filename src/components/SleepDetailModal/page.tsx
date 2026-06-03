"use client";

import { useState } from "react";
import { SleepResponse, deleteSleep } from "@/lib/api/sleep";

interface SleepDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sleep: SleepResponse | null;
  onUpdate?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

const qualityLabels: Record<string, string> = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

const energyLabels: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const sorenessLabels: Record<string, string> = {
  none: "None",
  mild: "Mild",
  moderate: "Moderate",
  severe: "Severe",
};

export default function SleepDetailModal({
  isOpen,
  onClose,
  sleep,
  onUpdate,
  onDelete,
  onEdit,
}: SleepDetailModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !sleep) return null;

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete the sleep entry for ${formatDate(sleep.date)}?`)) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await deleteSleep(sleep.date);
      if (onDelete) {
        onDelete();
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to delete sleep entry");
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

  const formatTime = (timeString: string) => {
    const date = new Date(`2000-01-01T${timeString}`);
    return date.toLocaleTimeString("en-US", {
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
              <i className="ri-moon-line"></i> Sleep & Recovery Details
            </h2>
            <p className="workout-detail-date">{formatDate(sleep.date)}</p>
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
              <i className="ri-moon-line"></i>
              <div className="workout-stat-content">
                <span className="workout-stat-value">{sleep.total_sleep_hours}</span>
                <span className="workout-stat-label">Hours</span>
              </div>
            </div>
            <div className="workout-stat-card">
              <i className="ri-star-line"></i>
              <div className="workout-stat-content">
                <span className="workout-stat-value">{qualityLabels[sleep.sleep_quality] || sleep.sleep_quality}</span>
                <span className="workout-stat-label">Quality</span>
              </div>
            </div>
            <div className="workout-stat-card">
              <i className="ri-flashlight-line"></i>
              <div className="workout-stat-content">
                <span className="workout-stat-value">{energyLabels[sleep.energy_level_morning] || sleep.energy_level_morning}</span>
                <span className="workout-stat-label">Morning Energy</span>
              </div>
            </div>
          </div>

          <div className="workout-exercises-list">
            <h3 className="workout-exercises-list-title">
              <i className="ri-time-line"></i> Sleep Schedule
            </h3>

            <div className="workout-detail-exercise-card">
              <div className="workout-detail-exercise-header">
                <h4 className="workout-detail-exercise-name">Sleep Times</h4>
              </div>
              <div className="workout-detail-sets-list">
                <div className="workout-detail-set-item">
                  <span className="workout-detail-set-number">Bedtime</span>
                  <div className="workout-detail-set-details">
                    <span className="workout-detail-set-reps">
                      <i className="ri-moon-fill"></i> {formatTime(sleep.sleep_start)}
                    </span>
                  </div>
                </div>
                <div className="workout-detail-set-item">
                  <span className="workout-detail-set-number">Wake Time</span>
                  <div className="workout-detail-set-details">
                    <span className="workout-detail-set-reps">
                      <i className="ri-sun-line"></i> {formatTime(sleep.sleep_end)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="workout-detail-exercise-card">
              <div className="workout-detail-exercise-header">
                <h4 className="workout-detail-exercise-name">Recovery Metrics</h4>
              </div>
              <div className="workout-detail-sets-list">
                <div className="workout-detail-set-item">
                  <span className="workout-detail-set-number">Muscle Soreness</span>
                  <div className="workout-detail-set-details">
                    <span className={`workout-detail-set-intensity intensity-${sleep.muscle_soreness}`}>
                      <i className="ri-heart-pulse-line"></i> {sorenessLabels[sleep.muscle_soreness] || sleep.muscle_soreness}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {sleep.notes && (
              <div className="workout-detail-exercise-card">
                <div className="workout-detail-exercise-header">
                  <h4 className="workout-detail-exercise-name">Notes</h4>
                </div>
                <div className="workout-detail-sets-list">
                  <div className="workout-detail-set-item">
                    <p style={{ color: "rgba(255, 255, 255, 0.7)", margin: 0, padding: "0.5rem 0" }}>
                      {sleep.notes}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {(sleep.created_at || sleep.updated_at) && (
            <div className="workout-detail-meta">
              {sleep.created_at && (
                <div className="workout-detail-meta-item">
                  <i className="ri-calendar-line"></i>
                  <span>Created: {formatDateTime(sleep.created_at)}</span>
                </div>
              )}
              {sleep.updated_at && sleep.updated_at !== sleep.created_at && (
                <div className="workout-detail-meta-item">
                  <i className="ri-edit-line"></i>
                  <span>Updated: {formatDateTime(sleep.updated_at)}</span>
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

