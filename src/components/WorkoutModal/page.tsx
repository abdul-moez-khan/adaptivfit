"use client";

import WorkoutForm from "@/components/WorkoutForm/page";

interface WorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate?: string;
  editWorkoutDate?: string | null;
}

export default function WorkoutModal({ isOpen, onClose, onSuccess, selectedDate, editWorkoutDate }: WorkoutModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const date = editWorkoutDate || selectedDate || today;

  if (!isOpen) return null;

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content workout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <i className="ri-run-line"></i> {editWorkoutDate ? "Edit Workout" : "Log Workout"}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <i className="ri-close-line"></i>
          </button>
        </div>
        <div className="modal-body">
          <WorkoutForm
            selectedDate={date}
            onSuccess={handleSuccess}
            editWorkoutDate={editWorkoutDate}
          />
        </div>
      </div>
    </div>
  );
}
