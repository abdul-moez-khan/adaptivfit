"use client";

import { useState, useEffect } from "react";
import DigestionForm from "@/components/DigestionForm/page";

interface DigestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate?: string;
  editDigestionDate?: string | null;
  onDelete?: () => void;
}

export default function DigestionModal({ isOpen, onClose, onSuccess, selectedDate, editDigestionDate, onDelete }: DigestionModalProps) {
  const [date, setDate] = useState(selectedDate || new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (editDigestionDate) {
      setDate(editDigestionDate);
    } else if (selectedDate) {
      setDate(selectedDate);
    }
  }, [editDigestionDate, selectedDate]);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content nutrition-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <i className="ri-heart-pulse-line"></i> {editDigestionDate ? "Edit Digestive Health" : "Log Digestive Health"}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <i className="ri-close-line"></i>
          </button>
        </div>
        <div className="modal-body">
          <DigestionForm
            selectedDate={date}
            onSuccess={handleSuccess}
            editDigestionDate={editDigestionDate}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}

