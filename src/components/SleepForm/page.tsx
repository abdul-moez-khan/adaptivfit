"use client";

import { useState, useEffect } from "react";
import { SleepData, createSleep, updateSleep, getSleepByDate, deleteSleep } from "@/lib/api/sleep";

interface SleepFormProps {
  selectedDate: string;
  onSuccess: () => void;
  editSleepDate?: string | null;
  onDelete?: () => void;
}

export default function SleepForm({ selectedDate, onSuccess, editSleepDate, onDelete }: SleepFormProps) {
  const [sleepDate, setSleepDate] = useState(selectedDate);
  const [sleepStart, setSleepStart] = useState("");
  const [sleepEnd, setSleepEnd] = useState("");
  const [totalSleepHours, setTotalSleepHours] = useState<number>(0);
  const [sleepQuality, setSleepQuality] = useState<"excellent" | "good" | "fair" | "poor">("good");
  const [energyLevelMorning, setEnergyLevelMorning] = useState<"low" | "medium" | "high">("medium");
  const [muscleSoreness, setMuscleSoreness] = useState<"none" | "mild" | "moderate" | "severe">("none");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [existingSleep, setExistingSleep] = useState<SleepData | null>(null);

  useEffect(() => {
    const fetchSleep = async () => {
      if (editSleepDate) {
        setFetching(true);
        setError("");
        try {
          const sleep = await getSleepByDate(editSleepDate);
          if (sleep) {
            setExistingSleep(sleep);
            setSleepDate(sleep.date);
            setSleepStart(sleep.sleep_start || "");
            setSleepEnd(sleep.sleep_end || "");
            setTotalSleepHours(sleep.total_sleep_hours || 0);
            setSleepQuality(sleep.sleep_quality || "good");
            setEnergyLevelMorning(sleep.energy_level_morning || "medium");
            setMuscleSoreness(sleep.muscle_soreness || "none");
            setNotes(sleep.notes || "");
          } else {
            setExistingSleep(null);
            resetForm();
          }
        } catch (err: any) {
          console.error("Error fetching sleep:", err);
          setExistingSleep(null);
        } finally {
          setFetching(false);
        }
      } else {
        setExistingSleep(null);
        resetForm();
      }
    };

    fetchSleep();
  }, [editSleepDate]);

  useEffect(() => {
    if (!editSleepDate) {
      setSleepDate(selectedDate);
    }
  }, [selectedDate, editSleepDate]);

  const resetForm = () => {
    setSleepStart("");
    setSleepEnd("");
    setTotalSleepHours(0);
    setSleepQuality("good");
    setEnergyLevelMorning("medium");
    setMuscleSoreness("none");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!sleepStart || !sleepEnd) {
        throw new Error("Please provide both sleep start and end times");
      }

      if (totalSleepHours <= 0) {
        throw new Error("Total sleep hours must be greater than 0");
      }

      const sleepData: SleepData = {
        date: sleepDate,
        sleep_start: sleepStart,
        sleep_end: sleepEnd,
        total_sleep_hours: totalSleepHours,
        sleep_quality: sleepQuality,
        energy_level_morning: energyLevelMorning,
        muscle_soreness: muscleSoreness,
        notes: notes.trim() || undefined,
      };

      if (existingSleep) {
        await updateSleep(sleepDate, sleepData);
        setSuccess("Sleep entry updated successfully!");
      } else {
        await createSleep(sleepData);
        setSuccess("Sleep entry created successfully!");
      }

      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: any) {
      console.error("Error saving sleep:", err);
      setError(err.message || "Failed to save sleep entry");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingSleep || !editSleepDate) {
      return;
    }

    const date = new Date(editSleepDate);
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!confirm(`Are you sure you want to delete the sleep entry for ${formattedDate}?`)) {
      return;
    }

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      await deleteSleep(editSleepDate);
      setSuccess("Sleep entry deleted successfully!");
      
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
      console.error("Error deleting sleep:", err);
      setError(err.message || "Failed to delete sleep entry");
      setDeleting(false);
    }
  };

  if (fetching) {
    return (
      <div className="form-loading">
        <i className="ri-loader-4-line profile-spinner"></i>
        <p>Loading sleep data...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="nutrition-form">
      <div className="form-group">
        <label htmlFor="sleep-date">Date</label>
        <input
          id="sleep-date"
          type="date"
          value={sleepDate}
          onChange={(e) => setSleepDate(e.target.value)}
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="sleep-start">Sleep Start Time</label>
        <input
          id="sleep-start"
          type="time"
          value={sleepStart}
          onChange={(e) => setSleepStart(e.target.value)}
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="sleep-end">Sleep End Time</label>
        <input
          id="sleep-end"
          type="time"
          value={sleepEnd}
          onChange={(e) => setSleepEnd(e.target.value)}
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="total-sleep-hours">Total Sleep Hours</label>
        <input
          id="total-sleep-hours"
          type="number"
          min="0"
          step="0.5"
          value={totalSleepHours}
          onChange={(e) => setTotalSleepHours(parseFloat(e.target.value) || 0)}
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="sleep-quality">Sleep Quality</label>
        <select
          id="sleep-quality"
          value={sleepQuality}
          onChange={(e) => setSleepQuality(e.target.value as "excellent" | "good" | "fair" | "poor")}
          className="form-input"
          required
        >
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="energy-level">Energy Level (Morning)</label>
        <select
          id="energy-level"
          value={energyLevelMorning}
          onChange={(e) => setEnergyLevelMorning(e.target.value as "low" | "medium" | "high")}
          className="form-input"
          required
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="muscle-soreness">Muscle Soreness</label>
        <select
          id="muscle-soreness"
          value={muscleSoreness}
          onChange={(e) => setMuscleSoreness(e.target.value as "none" | "mild" | "moderate" | "severe")}
          className="form-input"
          required
        >
          <option value="none">None</option>
          <option value="mild">Mild</option>
          <option value="moderate">Moderate</option>
          <option value="severe">Severe</option>
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
          placeholder="Add any additional notes about your sleep..."
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
        {existingSleep && (
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
                Delete Sleep
              </>
            )}
          </button>
        )}
        <button type="submit" disabled={loading || deleting} className="btn-submit">
          {loading ? (
            <>
              <i className="ri-loader-4-line profile-spinner"></i>
              {existingSleep ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <i className={existingSleep ? "ri-save-line" : "ri-add-circle-line"}></i>
              {existingSleep ? "Update Sleep" : "Create Sleep"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

