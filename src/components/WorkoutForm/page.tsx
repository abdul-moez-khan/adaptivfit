"use client";

import { useState, useEffect } from "react";
import { WorkoutData, WorkoutExercise, WorkoutSet, createWorkout, updateWorkout, getWorkoutByDate } from "@/lib/api/workout";

interface WorkoutFormProps {
  selectedDate: string;
  onSuccess: () => void;
  editWorkoutDate?: string | null; // Date of workout to edit (null = new workout)
}

const intensityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function WorkoutForm({ selectedDate, onSuccess, editWorkoutDate }: WorkoutFormProps) {
  const [workoutDate, setWorkoutDate] = useState(selectedDate);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([
    {
      exercise_name: "",
      sets: [{ reps: 0, intensity: "medium" }],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [existingWorkout, setExistingWorkout] = useState<WorkoutData | null>(null);

  // Only fetch workout when explicitly editing (editWorkoutDate is provided)
  useEffect(() => {
    const fetchWorkout = async () => {
      if (editWorkoutDate) {
        setFetching(true);
        setError("");
        try {
          const workout = await getWorkoutByDate(editWorkoutDate);
          if (workout) {
            setExistingWorkout(workout);
            setWorkoutDate(workout.date);
            setTotalDuration(workout.total_duration);
            setExercises(workout.exercises.length > 0 ? workout.exercises : [
              {
                exercise_name: "",
                sets: [{ reps: 0, intensity: "medium" }],
              },
            ]);
          } else {
            // Workout not found, reset to new workout mode
            setExistingWorkout(null);
            setTotalDuration(0);
            setExercises([
              {
                exercise_name: "",
                sets: [{ reps: 0, intensity: "medium" }],
              },
            ]);
          }
        } catch (err: unknown) {
          console.error("Error fetching workout:", err);
          setExistingWorkout(null);
        } finally {
          setFetching(false);
        }
      } else {
        // New workout mode - ensure form is empty
        setExistingWorkout(null);
        setTotalDuration(0);
        setExercises([
          {
            exercise_name: "",
            sets: [{ reps: 0, intensity: "medium" }],
          },
        ]);
      }
    };

    fetchWorkout();
  }, [editWorkoutDate]);

  // Update workoutDate when selectedDate prop changes (but don't fetch workout)
  useEffect(() => {
    // Only update date if we're not in edit mode
    if (!editWorkoutDate) {
      setWorkoutDate(selectedDate);
    }
  }, [selectedDate, editWorkoutDate]);

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        exercise_name: "",
        sets: [{ reps: 0, intensity: "medium" }],
      },
    ]);
  };

  const removeExercise = (index: number) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((_, i) => i !== index));
    }
  };

  const updateExerciseName = (index: number, name: string) => {
    const updated = [...exercises];
    updated[index].exercise_name = name;
    setExercises(updated);
  };

  const addSet = (exerciseIndex: number) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets.push({ reps: 0, intensity: "medium" });
    setExercises(updated);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...exercises];
    if (updated[exerciseIndex].sets.length > 1) {
      updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter(
        (_, i) => i !== setIndex
      );
      setExercises(updated);
    }
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: "reps" | "intensity",
    value: number | string
  ) => {
    const updated = [...exercises];
    if (field === "reps") {
      updated[exerciseIndex].sets[setIndex].reps = value as number;
    } else {
      updated[exerciseIndex].sets[setIndex].intensity = value as "low" | "medium" | "high";
    }
    setExercises(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate form
      if (!workoutDate) {
        setError("Please select a date");
        setLoading(false);
        return;
      }

      if (totalDuration <= 0) {
        setError("Please enter total duration");
        setLoading(false);
        return;
      }

      const validExercises = exercises.filter(
        (ex) => ex.exercise_name.trim() !== ""
      );

      if (validExercises.length === 0) {
        setError("Please add at least one exercise");
        setLoading(false);
        return;
      }

      // Validate all exercises have at least one set with reps > 0
      for (const exercise of validExercises) {
        const validSets = exercise.sets.filter((set) => set.reps > 0);
        if (validSets.length === 0) {
          setError(`Exercise "${exercise.exercise_name}" must have at least one set with reps > 0`);
          setLoading(false);
          return;
        }
      }

      const workoutData: WorkoutData = {
        date: workoutDate,
        total_duration: totalDuration,
        exercises: validExercises.map((ex) => ({
          exercise_name: ex.exercise_name.trim(),
          sets: ex.sets.filter((set) => set.reps > 0),
        })),
      };

      if (existingWorkout) {
        // Update existing workout
        await updateWorkout(workoutDate, workoutData);
        setSuccess("Workout updated successfully!");
      } else {
        // Create new workout
        await createWorkout(workoutData);
        setSuccess("Workout saved successfully!");
      }

      // Reset form for next workout
      setTotalDuration(0);
      setExercises([
        {
          exercise_name: "",
          sets: [{ reps: 0, intensity: "medium" }],
        },
      ]);
      setExistingWorkout(null);
      
      // Reset to today's date for next workout (only if not in edit mode)
      if (!editWorkoutDate) {
        const today = new Date().toISOString().split("T")[0];
        setWorkoutDate(today);
      }

      setTimeout(() => {
        onSuccess();
        setSuccess(""); // Clear success message
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save workout");
      console.error("Workout save error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workout-form-container">
      <div className="workout-form-header">
        <h3 className="workout-form-title">
          <i className="ri-run-line"></i> Enter Your Workout
        </h3>
        <p className="workout-form-subtitle">
          Fill in the required fields to track your workout
        </p>
      </div>

      {fetching && (
        <div className="workout-form-loading">
          <i className="ri-loader-4-line profile-spinner"></i>
          <p>Loading workout data...</p>
        </div>
      )}

      {error && (
        <div className="workout-form-error">
          <i className="ri-error-warning-line"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="workout-form-success">
          <i className="ri-checkbox-circle-line"></i>
          {success}
        </div>
      )}

      {!fetching && (
        <form onSubmit={handleSubmit} className="workout-form">
          <div className="workout-form-row">
            <div className="workout-form-group">
              <label htmlFor="workout-date" className="workout-form-label">
                Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="workout-date"
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
                className="workout-form-input"
                required
              />
            </div>

            <div className="workout-form-group">
              <label htmlFor="total-duration" className="workout-form-label">
                Total Duration (minutes) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="total-duration"
                value={totalDuration || ""}
                onChange={(e) => setTotalDuration(Number(e.target.value))}
                className="workout-form-input"
                min="1"
                placeholder="e.g., 60"
                required
              />
            </div>
          </div>

          <div className="workout-exercises-section">
            <div className="workout-exercises-header">
              <h4 className="workout-exercises-title">
                <i className="ri-list-check"></i> Exercises
              </h4>
              <button
                type="button"
                className="workout-add-exercise-btn"
                onClick={addExercise}
              >
                <i className="ri-add-line"></i> Add Exercise
              </button>
            </div>

            {exercises.map((exercise, exerciseIndex) => (
              <div key={exerciseIndex} className="workout-exercise-card">
                <div className="workout-exercise-header">
                  <div className="workout-exercise-number">
                    Exercise {exerciseIndex + 1}
                  </div>
                  {exercises.length > 1 && (
                    <button
                      type="button"
                      className="workout-remove-btn"
                      onClick={() => removeExercise(exerciseIndex)}
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  )}
                </div>

                <div className="workout-form-group">
                  <label
                    htmlFor={`exercise-${exerciseIndex}`}
                    className="workout-form-label"
                  >
                    Exercise Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id={`exercise-${exerciseIndex}`}
                    value={exercise.exercise_name}
                    onChange={(e) =>
                      updateExerciseName(exerciseIndex, e.target.value)
                    }
                    className="workout-form-input"
                    placeholder="e.g., Bench Press"
                    required
                  />
                </div>

                <div className="workout-sets-section">
                  <div className="workout-sets-header">
                    <span className="workout-sets-title">Sets</span>
                    <button
                      type="button"
                      className="workout-add-set-btn"
                      onClick={() => addSet(exerciseIndex)}
                    >
                      <i className="ri-add-line"></i> Add Set
                    </button>
                  </div>

                  <div className="workout-sets-grid">
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="workout-set-card">
                        <div className="workout-set-header">
                          <span className="workout-set-number">Set {setIndex + 1}</span>
                          {exercise.sets.length > 1 && (
                            <button
                              type="button"
                              className="workout-remove-set-btn"
                              onClick={() => removeSet(exerciseIndex, setIndex)}
                            >
                              <i className="ri-close-line"></i>
                            </button>
                          )}
                        </div>
                        <div className="workout-set-fields">
                          <div className="workout-form-group">
                            <label
                              htmlFor={`reps-${exerciseIndex}-${setIndex}`}
                              className="workout-form-label-small"
                            >
                              Reps
                            </label>
                            <input
                              type="number"
                              id={`reps-${exerciseIndex}-${setIndex}`}
                              value={set.reps || ""}
                              onChange={(e) =>
                                updateSet(
                                  exerciseIndex,
                                  setIndex,
                                  "reps",
                                  Number(e.target.value)
                                )
                              }
                              className="workout-form-input-small"
                              min="0"
                              placeholder="0"
                            />
                          </div>
                          <div className="workout-form-group">
                            <label
                              htmlFor={`intensity-${exerciseIndex}-${setIndex}`}
                              className="workout-form-label-small"
                            >
                              Intensity
                            </label>
                            <select
                              id={`intensity-${exerciseIndex}-${setIndex}`}
                              value={set.intensity}
                              onChange={(e) =>
                                updateSet(
                                  exerciseIndex,
                                  setIndex,
                                  "intensity",
                                  e.target.value
                                )
                              }
                              className="workout-form-input-small"
                            >
                              {intensityOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="workout-form-actions">
            <button
              type="submit"
              className="workout-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line profile-spinner"></i> Saving...
                </>
              ) : existingWorkout ? (
                <>
                  <i className="ri-save-line"></i> Update Workout
                </>
              ) : (
                <>
                  <i className="ri-check-line"></i> Save Workout
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

