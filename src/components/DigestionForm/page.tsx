"use client";

import { useState, useEffect } from "react";
import { DigestionData, createDigestion, updateDigestion, getDigestionByDate, deleteDigestion } from "@/lib/api/digestion";

interface DigestionFormProps {
  selectedDate: string;
  onSuccess: () => void;
  editDigestionDate?: string | null;
  onDelete?: () => void;
}

export default function DigestionForm({ selectedDate, onSuccess, editDigestionDate, onDelete }: DigestionFormProps) {
  const [digestionDate, setDigestionDate] = useState(selectedDate);
  const [bowelMovementTime, setBowelMovementTime] = useState("");
  const [stoolForm, setStoolForm] = useState<"well_formed" | "loose" | "hard" | "watery" | "constipated">("well_formed");
  const [stoolFrequency, setStoolFrequency] = useState<number>(0);
  const [digestionComfort, setDigestionComfort] = useState<"excellent" | "good" | "fair" | "poor">("good");
  const [bloating, setBloating] = useState<"none" | "mild" | "moderate" | "severe">("none");
  const [gas, setGas] = useState<"none" | "mild" | "moderate" | "severe">("none");
  const [appetite, setAppetite] = useState<"excellent" | "good" | "fair" | "poor">("good");
  const [hydrationLevel, setHydrationLevel] = useState<"excellent" | "good" | "fair" | "poor">("good");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [existingDigestion, setExistingDigestion] = useState<DigestionData | null>(null);

  useEffect(() => {
    const fetchDigestion = async () => {
      if (editDigestionDate) {
        setFetching(true);
        setError("");
        try {
          const digestion = await getDigestionByDate(editDigestionDate);
          if (digestion) {
            setExistingDigestion(digestion);
            setDigestionDate(digestion.date);
            setBowelMovementTime(digestion.bowel_movement_time || "");
            setStoolForm(digestion.stool_form || "well_formed");
            setStoolFrequency(digestion.stool_frequency || 0);
            setDigestionComfort(digestion.digestion_comfort || "good");
            setBloating(digestion.bloating || "none");
            setGas(digestion.gas || "none");
            setAppetite(digestion.appetite || "good");
            setHydrationLevel(digestion.hydration_level || "good");
            setNotes(digestion.notes || "");
          } else {
            setExistingDigestion(null);
            resetForm();
          }
        } catch (err: any) {
          console.error("Error fetching digestion:", err);
          setExistingDigestion(null);
        } finally {
          setFetching(false);
        }
      } else {
        setExistingDigestion(null);
        resetForm();
      }
    };

    fetchDigestion();
  }, [editDigestionDate]);

  useEffect(() => {
    if (!editDigestionDate) {
      setDigestionDate(selectedDate);
    }
  }, [selectedDate, editDigestionDate]);

  const resetForm = () => {
    setBowelMovementTime("");
    setStoolForm("well_formed");
    setStoolFrequency(0);
    setDigestionComfort("good");
    setBloating("none");
    setGas("none");
    setAppetite("good");
    setHydrationLevel("good");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const digestionData: DigestionData = {
        date: digestionDate,
        bowel_movement_time: bowelMovementTime.trim() || undefined,
        stool_form: stoolForm,
        stool_frequency: stoolFrequency,
        digestion_comfort: digestionComfort,
        bloating: bloating,
        gas: gas,
        appetite: appetite,
        hydration_level: hydrationLevel,
        notes: notes.trim() || undefined,
      };

      if (existingDigestion) {
        await updateDigestion(digestionDate, digestionData);
        setSuccess("Digestion entry updated successfully!");
      } else {
        await createDigestion(digestionData);
        setSuccess("Digestion entry created successfully!");
      }

      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: any) {
      console.error("Error saving digestion:", err);
      setError(err.message || "Failed to save digestion entry");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingDigestion || !editDigestionDate) {
      return;
    }

    const date = new Date(editDigestionDate);
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!confirm(`Are you sure you want to delete the digestion entry for ${formattedDate}?`)) {
      return;
    }

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      await deleteDigestion(editDigestionDate);
      setSuccess("Digestion entry deleted successfully!");
      
      if (onDelete) {
        setTimeout(() => {
          onDelete();
        }, 500);
      } else {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    } catch (err: any) {
      console.error("Error deleting digestion:", err);
      setError(err.message || "Failed to delete digestion entry");
      setDeleting(false);
    }
  };

  if (fetching) {
    return (
      <div className="form-loading">
        <i className="ri-loader-4-line profile-spinner"></i>
        <p>Loading digestion data...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="nutrition-form">
      <div className="form-group">
        <label htmlFor="digestion-date">Date</label>
        <input
          id="digestion-date"
          type="date"
          value={digestionDate}
          onChange={(e) => setDigestionDate(e.target.value)}
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="bowel-movement-time">Bowel Movement Time (Optional)</label>
        <input
          id="bowel-movement-time"
          type="time"
          value={bowelMovementTime}
          onChange={(e) => setBowelMovementTime(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="stool-form">Stool Form</label>
        <select
          id="stool-form"
          value={stoolForm}
          onChange={(e) => setStoolForm(e.target.value as "well_formed" | "loose" | "hard" | "watery" | "constipated")}
          className="form-input"
        >
          <option value="well_formed">Well Formed</option>
          <option value="loose">Loose</option>
          <option value="hard">Hard</option>
          <option value="watery">Watery</option>
          <option value="constipated">Constipated</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="stool-frequency">Stool Frequency</label>
        <input
          id="stool-frequency"
          type="number"
          min="0"
          value={stoolFrequency}
          onChange={(e) => setStoolFrequency(parseInt(e.target.value) || 0)}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="digestion-comfort">Digestion Comfort</label>
        <select
          id="digestion-comfort"
          value={digestionComfort}
          onChange={(e) => setDigestionComfort(e.target.value as "excellent" | "good" | "fair" | "poor")}
          className="form-input"
        >
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="bloating">Bloating</label>
        <select
          id="bloating"
          value={bloating}
          onChange={(e) => setBloating(e.target.value as "none" | "mild" | "moderate" | "severe")}
          className="form-input"
        >
          <option value="none">None</option>
          <option value="mild">Mild</option>
          <option value="moderate">Moderate</option>
          <option value="severe">Severe</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="gas">Gas</label>
        <select
          id="gas"
          value={gas}
          onChange={(e) => setGas(e.target.value as "none" | "mild" | "moderate" | "severe")}
          className="form-input"
        >
          <option value="none">None</option>
          <option value="mild">Mild</option>
          <option value="moderate">Moderate</option>
          <option value="severe">Severe</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="appetite">Appetite</label>
        <select
          id="appetite"
          value={appetite}
          onChange={(e) => setAppetite(e.target.value as "excellent" | "good" | "fair" | "poor")}
          className="form-input"
        >
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="hydration-level">Hydration Level</label>
        <select
          id="hydration-level"
          value={hydrationLevel}
          onChange={(e) => setHydrationLevel(e.target.value as "excellent" | "good" | "fair" | "poor")}
          className="form-input"
        >
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes (Optional)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="form-input"
          rows={4}
          placeholder="Add any additional notes about your digestion..."
        />
      </div>

      {error && (
        <div className="form-error">
          <i className="ri-error-warning-line"></i>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="form-success">
          <i className="ri-checkbox-circle-line"></i>
          <span>{success}</span>
        </div>
      )}

      <div className="form-actions">
        {existingDigestion && (
          <button 
            type="button" 
            onClick={handleDelete} 
            disabled={deleting || loading} 
            className="btn-delete"
          >
            {deleting ? (
              <>
                <i className="ri-loader-4-line profile-spinner"></i>
                Deleting...
              </>
            ) : (
              <>
                <i className="ri-delete-bin-line"></i>
                Delete Entry
              </>
            )}
          </button>
        )}
        <button type="submit" disabled={loading || deleting} className="btn-submit">
          {loading ? (
            <>
              <i className="ri-loader-4-line profile-spinner"></i>
              {existingDigestion ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <i className={existingDigestion ? "ri-save-line" : "ri-add-circle-line"}></i>
              {existingDigestion ? "Update Entry" : "Create Entry"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

