"use client";

import { useState, useEffect } from "react";
import { ProfileData, ProfileResponse, createProfile, updateProfile, getProfile } from "@/lib/api/profile";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const goalOptions = [
  { value: "muscle_building", label: "Muscle Building" },
  { value: "weight_loss", label: "Weight Loss" },
  { value: "weight_gain", label: "Weight Gain" },
  { value: "maintenance", label: "Maintenance" },
  { value: "endurance", label: "Endurance" },
  { value: "flexibility", label: "Flexibility" },
];

export default function ProfileModal({
  isOpen,
  onClose,
  onSuccess,
}: ProfileModalProps) {
  const [formData, setFormData] = useState<ProfileData>({
    age: undefined,
    height: undefined,
    body_weight: undefined,
    goal: "",
    lifestyle_routine: "",
    medical_condition: "",
  });
  const [existingProfile, setExistingProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch profile data when modal opens
  useEffect(() => {
    const fetchProfileData = async () => {
      if (isOpen) {
        setFetching(true);
        setError("");
        setSuccess("");
        
        try {
          const profile = await getProfile();
          
          if (profile) {
            // Profile exists - load it for editing
            setExistingProfile(profile);
            setFormData({
              age: profile.age,
              height: profile.height,
              body_weight: profile.body_weight,
              goal: profile.goal || "",
              lifestyle_routine: profile.lifestyle_routine || "",
              medical_condition: profile.medical_condition || "",
            });
          } else {
            // No profile exists - show empty form for creation
            setExistingProfile(null);
            setFormData({
              age: undefined,
              height: undefined,
              body_weight: undefined,
              goal: "",
              lifestyle_routine: "",
              medical_condition: "",
            });
          }
        } catch (err: unknown) {
          console.error("Error fetching profile:", err);
          // If error fetching, assume no profile exists
          setExistingProfile(null);
          setFormData({
            age: undefined,
            height: undefined,
            body_weight: undefined,
            goal: "",
            lifestyle_routine: "",
            medical_condition: "",
          });
        } finally {
          setFetching(false);
        }
      }
    };

    fetchProfileData();
  }, [isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "age" || name === "height" || name === "body_weight"
          ? value === ""
            ? undefined
            : Number(value)
          : value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate required fields for new profile
      if (!existingProfile) {
        if (!formData.age || !formData.height || !formData.body_weight || !formData.goal) {
          setError("Please fill in all required fields (Age, Height, Weight, Goal)");
          setLoading(false);
          return;
        }
      }

      if (existingProfile) {
        // Update existing profile - only send changed fields
        const updatedData: Partial<ProfileData> = {};
        
        // Check which fields have changed
        if (formData.age !== existingProfile.age) updatedData.age = formData.age;
        if (formData.height !== existingProfile.height) updatedData.height = formData.height;
        if (formData.body_weight !== existingProfile.body_weight) updatedData.body_weight = formData.body_weight;
        if (formData.goal !== existingProfile.goal) updatedData.goal = formData.goal;
        if (formData.lifestyle_routine !== (existingProfile.lifestyle_routine || "")) {
          updatedData.lifestyle_routine = formData.lifestyle_routine;
        }
        if (formData.medical_condition !== (existingProfile.medical_condition || "")) {
          updatedData.medical_condition = formData.medical_condition;
        }

        // Only update if there are changes
        if (Object.keys(updatedData).length > 0) {
          await updateProfile(updatedData);
          setSuccess("Profile updated successfully!");
        } else {
          setSuccess("No changes detected.");
        }
      } else {
        // Create new profile
        const createdProfile = await createProfile(formData);
        setSuccess("Profile created successfully!");
        // Update existingProfile state with the created profile
        setExistingProfile(createdProfile);
      }

      // Call success callback and close modal after a short delay
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
      console.error("Profile save error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h2 className="profile-modal-title">
            {existingProfile ? "Edit Profile" : "Create Your Profile"}
          </h2>
          <button className="profile-modal-close" onClick={onClose}>
            <i className="ri-close-line"></i>
          </button>
        </div>

        {fetching ? (
          <div className="profile-modal-loading">
            <i className="ri-loader-4-line profile-spinner"></i>
            <p>Loading profile...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="profile-modal-form">
          {error && (
            <div className="profile-modal-error">
              <i className="ri-error-warning-line"></i>
              {error}
            </div>
          )}

          {success && (
            <div className="profile-modal-success">
              <i className="ri-checkbox-circle-line"></i>
              {success}
            </div>
          )}

          <div className="profile-form-grid">
            <div className="profile-form-group">
              <label htmlFor="age" className="profile-form-label">
                Age <span className="required">*</span>
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age || ""}
                onChange={handleInputChange}
                className="profile-form-input"
                placeholder="Enter your age"
                min="1"
                max="120"
                required={!existingProfile}
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="height" className="profile-form-label">
                Height (cm) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height || ""}
                onChange={handleInputChange}
                className="profile-form-input"
                placeholder="Enter height in cm"
                min="1"
                max="300"
                required={!existingProfile}
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="body_weight" className="profile-form-label">
                Weight (kg) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="body_weight"
                name="body_weight"
                value={formData.body_weight || ""}
                onChange={handleInputChange}
                className="profile-form-input"
                placeholder="Enter weight in kg"
                min="1"
                max="500"
                step="0.1"
                required={!existingProfile}
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="goal" className="profile-form-label">
                Fitness Goal <span className="required">*</span>
              </label>
              <select
                id="goal"
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
                className="profile-form-input"
                required={!existingProfile}
              >
                <option value="">Select your goal</option>
                {goalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="profile-form-group">
            <label htmlFor="lifestyle_routine" className="profile-form-label">
              Lifestyle Routine
            </label>
            <textarea
              id="lifestyle_routine"
              name="lifestyle_routine"
              value={formData.lifestyle_routine}
              onChange={handleInputChange}
              className="profile-form-input profile-form-textarea"
              placeholder="Describe your daily routine, activity level, etc."
              rows={3}
            />
          </div>

          <div className="profile-form-group">
            <label htmlFor="medical_condition" className="profile-form-label">
              Medical Conditions
            </label>
            <textarea
              id="medical_condition"
              name="medical_condition"
              value={formData.medical_condition}
              onChange={handleInputChange}
              className="profile-form-input profile-form-textarea"
              placeholder="Any medical conditions or health concerns we should know about"
              rows={3}
            />
          </div>

          <div className="profile-modal-actions">
            <button
              type="button"
              className="profile-modal-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="profile-modal-submit" disabled={loading}>
              {loading ? (
                <>
                  <i className="ri-loader-4-line profile-spinner"></i> Saving...
                </>
              ) : existingProfile ? (
                <>
                  <i className="ri-edit-line"></i> Edit Profile
                </>
              ) : (
                <>
                  <i className="ri-check-line"></i> Submit
                </>
              )}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}

