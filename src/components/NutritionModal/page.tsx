"use client";

import { useState, useEffect } from "react";
import NutritionForm from "@/components/NutritionForm/page";

interface NutritionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate?: string;
  editNutritionDate?: string | null;
  onDelete?: () => void;
}

export default function NutritionModal({ isOpen, onClose, onSuccess, selectedDate, editNutritionDate, onDelete }: NutritionModalProps) {
  const [date, setDate] = useState(selectedDate || new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (editNutritionDate) {
      setDate(editNutritionDate);
    } else if (selectedDate) {
      setDate(selectedDate);
    }
  }, [editNutritionDate, selectedDate]);

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
            <i className="ri-restaurant-line"></i> {editNutritionDate ? "Edit Nutrition" : "Log Nutrition"}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <i className="ri-close-line"></i>
          </button>
        </div>
        <div className="modal-body">
          <NutritionForm
            selectedDate={date}
            onSuccess={handleSuccess}
            editNutritionDate={editNutritionDate}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}

