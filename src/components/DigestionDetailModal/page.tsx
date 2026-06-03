"use client";

import { useState } from "react";
import { DigestionResponse, deleteDigestion } from "@/lib/api/digestion";

interface DigestionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  digestion: DigestionResponse | null;
  onUpdate?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

const comfortLabels: Record<string, string> = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

const severityLabels: Record<string, string> = {
  none: "None",
  mild: "Mild",
  moderate: "Moderate",
  severe: "Severe",
};

const stoolFormLabels: Record<string, string> = {
  well_formed: "Well Formed",
  loose: "Loose",
  hard: "Hard",
  watery: "Watery",
  constipated: "Constipated",
};

export default function DigestionDetailModal({
  isOpen,
  onClose,
  digestion,
  onUpdate,
  onDelete,
  onEdit,
}: DigestionDetailModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !digestion) return null;

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete the digestion entry for ${formatDate(digestion.date)}?`)) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await deleteDigestion(digestion.date);
      if (onDelete) {
        onDelete();
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to delete digestion entry");
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
    if (!timeString) return "Not specified";
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
              <i className="ri-heart-pulse-line"></i> Digestive Health Details
            </h2>
            <p className="workout-detail-date">{formatDate(digestion.date)}</p>
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
              <i className="ri-heart-pulse-line"></i>
              <div className="workout-stat-content">
                <span className="workout-stat-value">{comfortLabels[digestion.digestion_comfort || "good"] || digestion.digestion_comfort}</span>
                <span className="workout-stat-label">Comfort</span>
              </div>
            </div>
            <div className="workout-stat-card">
              <i className="ri-restaurant-line"></i>
              <div className="workout-stat-content">
                <span className="workout-stat-value">{comfortLabels[digestion.appetite || "good"] || digestion.appetite}</span>
                <span className="workout-stat-label">Appetite</span>
              </div>
            </div>
            <div className="workout-stat-card">
              <i className="ri-cup-line"></i>
              <div className="workout-stat-content">
                <span className="workout-stat-value">{comfortLabels[digestion.hydration_level || "good"] || digestion.hydration_level}</span>
                <span className="workout-stat-label">Hydration</span>
              </div>
            </div>
          </div>

          <div className="workout-exercises-list">
            <h3 className="workout-exercises-list-title">
              <i className="ri-stethoscope-line"></i> Bowel Movement & Stool
            </h3>

            <div className="workout-detail-exercise-card">
              <div className="workout-detail-exercise-header">
                <h4 className="workout-detail-exercise-name">Bowel Movement Details</h4>
              </div>
              <div className="workout-detail-sets-list">
                {digestion.bowel_movement_time && (
                  <div className="workout-detail-set-item">
                    <span className="workout-detail-set-number">Time</span>
                    <div className="workout-detail-set-details">
                      <span className="workout-detail-set-reps">
                        <i className="ri-time-line"></i> {formatTime(digestion.bowel_movement_time)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="workout-detail-set-item">
                  <span className="workout-detail-set-number">Stool Form</span>
                  <div className="workout-detail-set-details">
                    <span className="workout-detail-set-reps">
                      <i className="ri-scales-line"></i> {stoolFormLabels[digestion.stool_form || "well_formed"] || digestion.stool_form}
                    </span>
                  </div>
                </div>
                <div className="workout-detail-set-item">
                  <span className="workout-detail-set-number">Frequency</span>
                  <div className="workout-detail-set-details">
                    <span className="workout-detail-set-reps">
                      <i className="ri-repeat-line"></i> {digestion.stool_frequency || 0} times
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="workout-detail-exercise-card">
              <div className="workout-detail-exercise-header">
                <h4 className="workout-detail-exercise-name">Digestive Symptoms</h4>
              </div>
              <div className="workout-detail-sets-list">
                <div className="workout-detail-set-item">
                  <span className="workout-detail-set-number">Bloating</span>
                  <div className="workout-detail-set-details">
                    <span className={`workout-detail-set-intensity intensity-${digestion.bloating || "none"}`}>
                      <i className="ri-windy-line"></i> {severityLabels[digestion.bloating || "none"] || digestion.bloating}
                    </span>
                  </div>
                </div>
                <div className="workout-detail-set-item">
                  <span className="workout-detail-set-number">Gas</span>
                  <div className="workout-detail-set-details">
                    <span className={`workout-detail-set-intensity intensity-${digestion.gas || "none"}`}>
                      <i className="ri-windy-line"></i> {severityLabels[digestion.gas || "none"] || digestion.gas}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {digestion.notes && (
              <div className="workout-detail-exercise-card">
                <div className="workout-detail-exercise-header">
                  <h4 className="workout-detail-exercise-name">Notes</h4>
                </div>
                <div className="workout-detail-sets-list">
                  <div className="workout-detail-set-item">
                    <p style={{ color: "rgba(255, 255, 255, 0.7)", margin: 0, padding: "0.5rem 0" }}>
                      {digestion.notes}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {(digestion.created_at || digestion.updated_at) && (
            <div className="workout-detail-meta">
              {digestion.created_at && (
                <div className="workout-detail-meta-item">
                  <i className="ri-calendar-line"></i>
                  <span>Created: {formatDateTime(digestion.created_at)}</span>
                </div>
              )}
              {digestion.updated_at && digestion.updated_at !== digestion.created_at && (
                <div className="workout-detail-meta-item">
                  <i className="ri-edit-line"></i>
                  <span>Updated: {formatDateTime(digestion.updated_at)}</span>
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

