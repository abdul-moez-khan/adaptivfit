"use client";

import { useState, useEffect } from "react";
import SleepForm from "@/components/SleepForm/page";

interface SleepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate?: string;
  editSleepDate?: string | null;
  onDelete?: () => void;
}

export default function SleepModal({ isOpen, onClose, onSuccess, selectedDate, editSleepDate, onDelete }: SleepModalProps) {
  const [date, setDate] = useState(selectedDate || new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (editSleepDate) {
      setDate(editSleepDate);
    } else if (selectedDate) {
      setDate(selectedDate);
    }
  }, [editSleepDate, selectedDate]);

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
            <i className="ri-moon-line"></i> {editSleepDate ? "Edit Sleep & Recovery" : "Log Sleep & Recovery"}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <i className="ri-close-line"></i>
          </button>
        </div>
        <div className="modal-body">
          <SleepForm
            selectedDate={date}
            onSuccess={handleSuccess}
            editSleepDate={editSleepDate}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}

