"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer/page";
import { isTokenValid } from "@/lib/utils/token";
import { getErrorMessage } from "@/lib/utils/errorMessage";
import { getUserProfile, UserProfile } from "@/lib/api/user";
import { logout } from "@/lib/api/auth";
import ProfileModal from "@/components/ProfileModal/page";
import WorkoutModal from "@/components/WorkoutModal/page";
import WorkoutDetailModal from "@/components/WorkoutDetailModal/page";
import WorkoutProgress from "@/components/WorkoutProgress/page";
import NutritionModal from "@/components/NutritionModal/page";
import NutritionDetailModal from "@/components/NutritionDetailModal/page";
import NutritionProgress from "@/components/NutritionProgress/page";
import SleepModal from "@/components/SleepModal/page";
import SleepDetailModal from "@/components/SleepDetailModal/page";
import SleepProgress from "@/components/SleepProgress/page";
import DigestionModal from "@/components/DigestionModal/page";
import DigestionDetailModal from "@/components/DigestionDetailModal/page";
import DigestionProgress from "@/components/DigestionProgress/page";
import { getWorkouts, getWorkoutByDate, WorkoutResponse } from "@/lib/api/workout";
import { getNutritionEntries, getNutritionByDate, NutritionResponse } from "@/lib/api/nutrition";
import { getSleepEntries, getSleepByDate, SleepResponse } from "@/lib/api/sleep";
import { getDigestionEntries, getDigestionByDate, DigestionResponse } from "@/lib/api/digestion";

type FeatureType = 
  | "workout" 
  | "nutrition" 
  | "sleep" 
  | "digestive" 
  | "chatbot" 
  | "posture";

export default function DashboardPage() {
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState<FeatureType>("workout");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutResponse[]>([]);
  const [workoutHistoryLoading, setWorkoutHistoryLoading] = useState(false);
  const [selectedWorkoutDate, setSelectedWorkoutDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [workoutDetailModalOpen, setWorkoutDetailModalOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutResponse | null>(null);
  const [workoutModalOpen, setWorkoutModalOpen] = useState(false);
  const [editingWorkoutDate, setEditingWorkoutDate] = useState<string | null>(null);
  const [progressPeriod, setProgressPeriod] = useState<"weekly" | "monthly" | "yearly">("weekly");
  const [nutritionHistory, setNutritionHistory] = useState<NutritionResponse[]>([]);
  const [nutritionHistoryLoading, setNutritionHistoryLoading] = useState(false);
  const [selectedNutritionDate, setSelectedNutritionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [nutritionModalOpen, setNutritionModalOpen] = useState(false);
  const [nutritionDetailModalOpen, setNutritionDetailModalOpen] = useState(false);
  const [selectedNutrition, setSelectedNutrition] = useState<NutritionResponse | null>(null);
  const [nutritionProgressPeriod, setNutritionProgressPeriod] = useState<"weekly" | "monthly" | "yearly">("weekly");
  const [editingNutritionDate, setEditingNutritionDate] = useState<string | null>(null);
  const [sleepHistory, setSleepHistory] = useState<SleepResponse[]>([]);
  const [sleepHistoryLoading, setSleepHistoryLoading] = useState(false);
  const [selectedSleepDate, setSelectedSleepDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [sleepModalOpen, setSleepModalOpen] = useState(false);
  const [sleepDetailModalOpen, setSleepDetailModalOpen] = useState(false);
  const [selectedSleep, setSelectedSleep] = useState<SleepResponse | null>(null);
  const [editingSleepDate, setEditingSleepDate] = useState<string | null>(null);
  const [sleepProgressPeriod, setSleepProgressPeriod] = useState<"weekly" | "monthly" | "yearly">("weekly");
  const [digestionHistory, setDigestionHistory] = useState<DigestionResponse[]>([]);
  const [digestionHistoryLoading, setDigestionHistoryLoading] = useState(false);
  const [selectedDigestionDate, setSelectedDigestionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [digestionModalOpen, setDigestionModalOpen] = useState(false);
  const [digestionDetailModalOpen, setDigestionDetailModalOpen] = useState(false);
  const [selectedDigestion, setSelectedDigestion] = useState<DigestionResponse | null>(null);
  const [editingDigestionDate, setEditingDigestionDate] = useState<string | null>(null);
  const [digestionProgressPeriod, setDigestionProgressPeriod] = useState<"weekly" | "monthly" | "yearly">("weekly");

  const features = [
    { 
      id: "workout" as FeatureType, 
      name: "Workout Tracking", 
      icon: "ri-run-line",
      hasHistory: true,
      color: "#f9ac54"
    },
    { 
      id: "nutrition" as FeatureType, 
      name: "Nutrition Tracking", 
      icon: "ri-restaurant-line",
      hasHistory: true,
      color: "#4ade80"
    },
    { 
      id: "sleep" as FeatureType, 
      name: "Sleep & Recovery", 
      icon: "ri-moon-line",
      hasHistory: true,
      color: "#60a5fa"
    },
    { 
      id: "digestive" as FeatureType, 
      name: "Digestive Health", 
      icon: "ri-heart-pulse-line",
      hasHistory: true,
      color: "#a78bfa"
    },
    { 
      id: "chatbot" as FeatureType, 
      name: "AI Chatbot", 
      icon: "ri-chat-3-line",
      hasHistory: false,
      color: "#f472b6"
    },
    { 
      id: "posture" as FeatureType, 
      name: "Posture Agent", 
      icon: "ri-camera-line",
      hasHistory: false,
      color: "#fb923c"
    },
  ];

  // Fetch workout history when workout tracking is selected
  useEffect(() => {
    const fetchWorkoutHistory = async () => {
      if (activeFeature === "workout") {
        setWorkoutHistoryLoading(true);
        try {
          const workouts = await getWorkouts();
          const sorted = workouts.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setWorkoutHistory(sorted);
        } catch (err: unknown) {
          console.error("Error fetching workout history:", err);
          setWorkoutHistory([]);
        } finally {
          setWorkoutHistoryLoading(false);
        }
      }
    };

    fetchWorkoutHistory();
  }, [activeFeature]);

  // Fetch nutrition history when nutrition tracking is selected
  useEffect(() => {
    const fetchNutritionHistory = async () => {
      if (activeFeature === "nutrition") {
        setNutritionHistoryLoading(true);
        try {
          const entries = await getNutritionEntries();
          const sorted = entries.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setNutritionHistory(sorted);
        } catch (err: unknown) {
          console.error("Error fetching nutrition history:", err);
          setNutritionHistory([]);
        } finally {
          setNutritionHistoryLoading(false);
        }
      }
    };

    fetchNutritionHistory();
  }, [activeFeature]);

  // Fetch sleep history when sleep tracking is selected
  useEffect(() => {
    const fetchSleepHistory = async () => {
      if (activeFeature === "sleep") {
        setSleepHistoryLoading(true);
        try {
          const entries = await getSleepEntries();
          const sorted = entries.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setSleepHistory(sorted);
        } catch (err: unknown) {
          console.error("Error fetching sleep history:", err);
          setSleepHistory([]);
        } finally {
          setSleepHistoryLoading(false);
        }
      }
    };

    fetchSleepHistory();
  }, [activeFeature]);

  // Fetch digestion history when digestive health is selected
  useEffect(() => {
    const fetchDigestionHistory = async () => {
      if (activeFeature === "digestive") {
        setDigestionHistoryLoading(true);
        try {
          const entries = await getDigestionEntries();
          const sorted = entries.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setDigestionHistory(sorted);
        } catch (err: unknown) {
          console.error("Error fetching digestion history:", err);
          setDigestionHistory([]);
        } finally {
          setDigestionHistoryLoading(false);
        }
      }
    };

    fetchDigestionHistory();
  }, [activeFeature]);

  const handleWorkoutDateClick = async (date: string) => {
    try {
      const workout = await getWorkoutByDate(date);
      if (workout) {
        setSelectedWorkout(workout);
        setWorkoutDetailModalOpen(true);
      }
    } catch (err: unknown) {
      console.error("Error fetching workout:", err);
    }
  };

  const handleWorkoutSuccess = async () => {
    try {
      const workouts = await getWorkouts();
      const sorted = workouts.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setWorkoutHistory(sorted);
      // Refresh selected workout if it exists
      if (selectedWorkout) {
        try {
          const updated = await getWorkoutByDate(selectedWorkout.date);
          if (updated) {
            setSelectedWorkout(updated);
          }
        } catch (err: unknown) {
          console.error("Error refreshing workout:", err);
        }
      }
    } catch (err: unknown) {
      console.error("Error fetching workout history:", err);
    }
  };

  const handleWorkoutUpdate = async () => {
    await handleWorkoutSuccess();
  };

  const handleWorkoutDelete = async () => {
    await handleWorkoutSuccess();
    setSelectedWorkout(null);
  };

  const handleWorkoutEdit = () => {
    if (selectedWorkout) {
      setSelectedWorkoutDate(selectedWorkout.date);
      setEditingWorkoutDate(selectedWorkout.date);
      setWorkoutModalOpen(true);
    }
  };

  const handleNutritionSuccess = async () => {
    try {
      const entries = await getNutritionEntries();
      const sorted = entries.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setNutritionHistory(sorted);
      // Refresh selected nutrition if it exists
      if (selectedNutrition) {
        try {
          const updated = await getNutritionByDate(selectedNutrition.date);
          if (updated) {
            setSelectedNutrition(updated);
          }
        } catch (err: unknown) {
          console.error("Error refreshing nutrition:", err);
        }
      }
    } catch (err: unknown) {
      console.error("Error fetching nutrition history:", err);
    }
  };

  const handleNutritionDelete = async () => {
    await handleNutritionSuccess();
    setSelectedNutrition(null);
  };

  const handleNutritionDateClick = async (date: string) => {
    try {
      const nutrition = await getNutritionByDate(date);
      if (nutrition) {
        setSelectedNutrition(nutrition);
        setNutritionDetailModalOpen(true);
      }
    } catch (err: unknown) {
      console.error("Error fetching nutrition:", err);
    }
  };

  const handleNutritionEdit = () => {
    if (selectedNutrition) {
      setSelectedNutritionDate(selectedNutrition.date);
      setEditingNutritionDate(selectedNutrition.date);
      setNutritionModalOpen(true);
    }
  };

  const handleSleepSuccess = async () => {
    try {
      const entries = await getSleepEntries();
      const sorted = entries.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setSleepHistory(sorted);
      // Refresh selected sleep if it exists
      if (selectedSleep) {
        try {
          const updated = await getSleepByDate(selectedSleep.date);
          if (updated) {
            setSelectedSleep(updated);
          }
        } catch (err: unknown) {
          console.error("Error refreshing sleep:", err);
        }
      }
    } catch (err: unknown) {
      console.error("Error fetching sleep history:", err);
    }
  };

  const handleSleepDelete = async () => {
    await handleSleepSuccess();
    setSelectedSleep(null);
  };

  const handleSleepDateClick = async (date: string) => {
    try {
      const sleep = await getSleepByDate(date);
      if (sleep) {
        setSelectedSleep(sleep);
        setSleepDetailModalOpen(true);
      }
    } catch (err: unknown) {
      console.error("Error fetching sleep:", err);
    }
  };

  const handleSleepEdit = () => {
    if (selectedSleep) {
      setSelectedSleepDate(selectedSleep.date);
      setEditingSleepDate(selectedSleep.date);
      setSleepModalOpen(true);
    }
  };

  const handleDigestionSuccess = async () => {
    try {
      const entries = await getDigestionEntries();
      const sorted = entries.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setDigestionHistory(sorted);
      // Refresh selected digestion if it exists
      if (selectedDigestion) {
        try {
          const updated = await getDigestionByDate(selectedDigestion.date);
          if (updated) {
            setSelectedDigestion(updated);
          }
        } catch (err: unknown) {
          console.error("Error refreshing digestion:", err);
        }
      }
    } catch (err: unknown) {
      console.error("Error fetching digestion history:", err);
    }
  };

  const handleDigestionDelete = async () => {
    await handleDigestionSuccess();
    setSelectedDigestion(null);
  };

  const handleDigestionDateClick = async (date: string) => {
    try {
      const digestion = await getDigestionByDate(date);
      if (digestion) {
        setSelectedDigestion(digestion);
        setDigestionDetailModalOpen(true);
      }
    } catch (err: unknown) {
      console.error("Error fetching digestion:", err);
    }
  };

  const handleDigestionEdit = () => {
    if (selectedDigestion) {
      setSelectedDigestionDate(selectedDigestion.date);
      setEditingDigestionDate(selectedDigestion.date);
      setDigestionModalOpen(true);
    }
  };

  // Authentication check and user profile fetch
  useEffect(() => {
    const checkAuthAndFetchUser = async () => {
      try {
        if (!isTokenValid()) {
          router.push("/login");
          return;
        }

        try {
          const userData = await getUserProfile();
          setUser(userData);
          setError("");
        } catch (err: unknown) {
          const message = getErrorMessage(err, "");
          if (message.includes("Unauthorized") || message.includes("401") || message.includes("403")) {
            router.push("/login");
            return;
          }
          
          if (message.includes("404") || message.includes("not found") || message.includes("Not Found")) {
            console.warn("User profile endpoint not found. Dashboard will work without personalized name.");
            setError("Note: User profile endpoint not configured.");
            setUser({
              id: 0,
              email: "",
              username: "User",
              full_name: "User"
            });
          } else {
            setError(`Failed to load user profile: ${message}`);
            setUser({
              id: 0,
              email: "",
              username: "User",
              full_name: "User"
            });
          }
          console.error("Error fetching user profile:", err);
        }
      } catch (err: unknown) {
        console.error("Authentication error:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchUser();
  }, [router]);

  // Show loading state
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading your dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = user.full_name || user.username || "User";
  const activeFeatureData = features.find(f => f.id === activeFeature);

  return (
    <div className="dashboard-container">
      {/* Navigation Bar */}
      <nav className="dashboard-nav">
        <div className="dashboard-nav__logo">
          <Link href="/">
            <Image src="/logo.png" alt="logo" width={200} height={70} />
          </Link>
        </div>
        <div className="dashboard-nav__actions">
          <button className="nav-btn nav-btn--profile" onClick={() => setProfileModalOpen(true)}>
            <i className="ri-user-line"></i>
            <span>Profile</span>
          </button>
          <button className="nav-btn nav-btn--logout" onClick={() => logout()}>
            <i className="ri-logout-box-line"></i>
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <div className="dashboard-wrapper">
        {/* Sidebar Navigation */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">
                <i className="ri-user-fill"></i>
              </div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{displayName.split(' ')[0]}</div>
                <div className="sidebar-user-status">Active</div>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {features.map((feature) => (
              <button
                key={feature.id}
                className={`sidebar-nav-item ${activeFeature === feature.id ? "active" : ""}`}
                onClick={() => setActiveFeature(feature.id)}
                style={{ 
                  "--feature-color": feature.color 
                } as React.CSSProperties}
              >
                <div className="sidebar-nav-icon">
                  <i className={feature.icon}></i>
                </div>
                <span className="sidebar-nav-label">{feature.name}</span>
                {feature.hasHistory && (
                  <div className="sidebar-nav-badge">
                    <i className="ri-history-line"></i>
                  </div>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="dashboard-main">
          {/* Feature Header */}
          <div className="feature-header">
            <div className="feature-header-content">
              <div 
                className="feature-header-icon"
                style={{ 
                  backgroundColor: `${activeFeatureData?.color}20`,
                  color: activeFeatureData?.color 
                }}
              >
                <i className={activeFeatureData?.icon}></i>
              </div>
              <div>
                <h1 className="feature-header-title">{activeFeatureData?.name}</h1>
                <p className="feature-header-subtitle">
                  {activeFeature === "workout" && "Track your exercises, sets, reps, and progress"}
                  {activeFeature === "nutrition" && "Log meals, track macros, and monitor nutrition"}
                  {activeFeature === "sleep" && "Monitor sleep quality, duration, and recovery metrics"}
                  {activeFeature === "digestive" && "Track digestive patterns and gut health indicators"}
                  {activeFeature === "chatbot" && "Get personalized fitness advice from AI"}
                  {activeFeature === "posture" && "Real-time posture correction during exercises"}
                </p>
              </div>
            </div>
            {error && (
              <div className="dashboard-error-banner">
                <i className="ri-error-warning-line"></i>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Feature Content */}
          <div className="feature-content">
            {/* Workout Tracking */}
            {activeFeature === "workout" && (
              <div className="workout-dashboard">
                {/* Summary Stats */}
                <div className="dashboard-stats-grid">
                  <div className="stat-card">
                    <div className="stat-card-icon" style={{ backgroundColor: "rgba(249, 172, 84, 0.15)", color: "#f9ac54" }}>
                      <i className="ri-calendar-check-line"></i>
                    </div>
                    <div className="stat-card-content">
                      <div className="stat-card-value">{workoutHistory.length}</div>
                      <div className="stat-card-label">Total Workouts</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon" style={{ backgroundColor: "rgba(74, 222, 128, 0.15)", color: "#4ade80" }}>
                      <i className="ri-time-line"></i>
                    </div>
                    <div className="stat-card-content">
                      <div className="stat-card-value">
                        {workoutHistory.length > 0 
                          ? Math.round(workoutHistory.reduce((sum, w) => sum + w.total_duration, 0) / workoutHistory.length)
                          : 0}m
                      </div>
                      <div className="stat-card-label">Avg Duration</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon" style={{ backgroundColor: "rgba(96, 165, 250, 0.15)", color: "#60a5fa" }}>
                      <i className="ri-run-line"></i>
                    </div>
                    <div className="stat-card-content">
                      <div className="stat-card-value">
                        {workoutHistory.length > 0
                          ? Math.round(workoutHistory.reduce((sum, w) => sum + w.exercises.length, 0) / workoutHistory.length)
                          : 0}
                      </div>
                      <div className="stat-card-label">Avg Exercises</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon" style={{ backgroundColor: "rgba(167, 139, 250, 0.15)", color: "#a78bfa" }}>
                      <i className="ri-fire-line"></i>
                    </div>
                    <div className="stat-card-content">
                      <div className="stat-card-value">
                        {workoutHistory.filter(w => {
                          const workoutDate = new Date(w.date);
                          const today = new Date();
                          const weekAgo = new Date(today);
                          weekAgo.setDate(today.getDate() - 7);
                          return workoutDate >= weekAgo;
                        }).length}
                      </div>
                      <div className="stat-card-label">This Week</div>
                    </div>
                  </div>
                </div>

                {/* Horizontal Layout: History | Enter Workout | Progress Graph */}
                <div className="workout-horizontal-layout">
                  {/* Workout History */}
                  <div className="workout-section-card workout-history-section">
                    <div className="section-card-header">
                      <h3 className="section-card-title">
                        <i className="ri-history-line"></i> History
                      </h3>
                    </div>
                    <div className="section-card-body">
                      {workoutHistoryLoading ? (
                        <div className="history-loading">
                          <i className="ri-loader-4-line profile-spinner"></i>
                          <p>Loading...</p>
                        </div>
                      ) : workoutHistory.length > 0 ? (
                        <div className="history-list">
                          {workoutHistory.slice(0, 5).map((workout) => {
                            const date = new Date(workout.date);
                            const formattedDate = date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            });
                            const dayName = date.toLocaleDateString("en-US", {
                              weekday: "short",
                            });

                            return (
                              <div
                                key={workout.date}
                                className="history-item"
                                onClick={() => handleWorkoutDateClick(workout.date)}
                              >
                                <div className="history-item-date">
                                  <span className="history-item-day">{dayName}</span>
                                  <span className="history-item-full">{formattedDate}</span>
                                </div>
                                <div className="history-item-stats">
                                  <span className="history-stat">
                                    <i className="ri-time-line"></i> {workout.total_duration}m
                                  </span>
                                </div>
                                <i className="ri-arrow-right-s-line history-item-arrow"></i>
                              </div>
                            );
                          })}
                          {workoutHistory.length > 5 && (
                            <div className="history-more">
                              <span>+{workoutHistory.length - 5} more</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="history-empty">
                          <i className="ri-inbox-line"></i>
                          <p>No history yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enter Workout */}
                  <div className="workout-section-card workout-action-section">
                    <div className="section-card-header">
                      <h3 className="section-card-title">
                        <i className="ri-add-circle-line"></i> Enter Workout
                      </h3>
                    </div>
                    <div className="section-card-body">
                      <div className="action-card-content">
                        <p className="action-description">Log your completed workout session</p>
                        <button 
                          className="action-card-btn action-card-btn--primary"
                          onClick={() => setWorkoutModalOpen(true)}
                        >
                          <i className="ri-add-line"></i>
                          <span>Log Workout</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Progress Graph */}
                  <div className="workout-section-card workout-progress-section">
                    <div className="section-card-header">
                      <h3 className="section-card-title">
                        <i className="ri-line-chart-line"></i> Progress
                      </h3>
                      <div className="progress-period-selector">
                        <button
                          className={`period-btn ${progressPeriod === "weekly" ? "active" : ""}`}
                          onClick={() => setProgressPeriod("weekly")}
                        >
                          W
                        </button>
                        <button
                          className={`period-btn ${progressPeriod === "monthly" ? "active" : ""}`}
                          onClick={() => setProgressPeriod("monthly")}
                        >
                          M
                        </button>
                        <button
                          className={`period-btn ${progressPeriod === "yearly" ? "active" : ""}`}
                          onClick={() => setProgressPeriod("yearly")}
                        >
                          Y
                        </button>
                      </div>
                    </div>
                    <div className="section-card-body">
                      {workoutHistoryLoading ? (
                        <div className="history-loading">
                          <i className="ri-loader-4-line profile-spinner"></i>
                          <p>Loading...</p>
                        </div>
                      ) : workoutHistory.length > 0 ? (
                        <WorkoutProgress workouts={workoutHistory} period={progressPeriod} />
                      ) : (
                        <div className="history-empty">
                          <i className="ri-line-chart-line"></i>
                          <p>No data yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Nutrition Tracking */}
            {activeFeature === "nutrition" && (
              <div className="nutrition-dashboard">
                {/* Summary Stats */}
                <div className="dashboard-stats-grid">
                  <div className="stat-card">
                    <div className="stat-card-icon" style={{ backgroundColor: "rgba(74, 222, 128, 0.15)", color: "#4ade80" }}>
                      <i className="ri-calendar-check-line"></i>
                    </div>
                    <div className="stat-card-content">
                      <div className="stat-card-value">{nutritionHistory.length}</div>
                      <div className="stat-card-label">Total Entries</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon" style={{ backgroundColor: "rgba(96, 165, 250, 0.15)", color: "#60a5fa" }}>
                      <i className="ri-restaurant-line"></i>
                    </div>
                    <div className="stat-card-content">
                      <div className="stat-card-value">
                        {nutritionHistory.length > 0
                          ? Math.round(nutritionHistory.reduce((sum, n) => sum + n.meals.length, 0) / nutritionHistory.length)
                          : 0}
                      </div>
                      <div className="stat-card-label">Avg Meals/Day</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon" style={{ backgroundColor: "rgba(249, 172, 84, 0.15)", color: "#f9ac54" }}>
                      <i className="ri-cup-line"></i>
                    </div>
                    <div className="stat-card-content">
                      <div className="stat-card-value">
                        {nutritionHistory.length > 0
                          ? Math.round(nutritionHistory.reduce((sum, n) => sum + (n.water_glasses || 0), 0) / nutritionHistory.length)
                          : 0}
                      </div>
                      <div className="stat-card-label">Avg Water Glasses</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon" style={{ backgroundColor: "rgba(167, 139, 250, 0.15)", color: "#a78bfa" }}>
                      <i className="ri-fire-line"></i>
                    </div>
                    <div className="stat-card-content">
                      <div className="stat-card-value">
                        {nutritionHistory.filter(n => {
                          const entryDate = new Date(n.date);
                          const today = new Date();
                          const weekAgo = new Date(today);
                          weekAgo.setDate(today.getDate() - 7);
                          return entryDate >= weekAgo;
                        }).length}
                      </div>
                      <div className="stat-card-label">This Week</div>
                    </div>
                  </div>
                </div>

                {/* Horizontal Layout: History | Enter Nutrition | Progress Graph */}
                <div className="nutrition-horizontal-layout">
                  {/* Nutrition History */}
                  <div className="nutrition-section-card nutrition-history-section">
                    <div className="section-card-header">
                      <h3 className="section-card-title">
                        <i className="ri-history-line"></i> History
                      </h3>
                    </div>
                    <div className="section-card-body">
                      {nutritionHistoryLoading ? (
                        <div className="history-loading">
                          <i className="ri-loader-4-line profile-spinner"></i>
                          <p>Loading...</p>
                        </div>
                      ) : nutritionHistory.length > 0 ? (
                        <div className="history-list">
                          {nutritionHistory.slice(0, 5).map((entry) => {
                            const date = new Date(entry.date);
                            const formattedDate = date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            });
                            const dayName = date.toLocaleDateString("en-US", {
                              weekday: "short",
                            });

                            return (
                              <div
                                key={entry.date}
                                className="history-item"
                                onClick={() => handleNutritionDateClick(entry.date)}
                              >
                                <div className="history-item-date">
                                  <span className="history-item-day">{dayName}</span>
                                  <span className="history-item-full">{formattedDate}</span>
                                </div>
                                <div className="history-item-stats">
                                  <span className="history-stat">
                                    <i className="ri-restaurant-line"></i> {entry.meals.length} meals
                                  </span>
                                </div>
                                <i className="ri-arrow-right-s-line history-item-arrow"></i>
                              </div>
                            );
                          })}
                          {nutritionHistory.length > 5 && (
                            <div className="history-more">
                              <span>+{nutritionHistory.length - 5} more</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="history-empty">
                          <i className="ri-inbox-line"></i>
                          <p>No history yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enter Nutrition */}
                  <div className="nutrition-section-card nutrition-action-section">
                    <div className="section-card-header">
                      <h3 className="section-card-title">
                        <i className="ri-add-circle-line"></i> Enter Nutrition
                      </h3>
                    </div>
                    <div className="section-card-body">
                      <div className="action-card-content">
                        <p className="action-description">Log your meals and water intake</p>
                        <button 
                          className="action-card-btn action-card-btn--primary"
                          onClick={() => {
                            setEditingNutritionDate(null);
                            setSelectedNutritionDate(new Date().toISOString().split("T")[0]);
                            setNutritionModalOpen(true);
                          }}
                        >
                          <i className="ri-add-line"></i>
                          <span>Log Nutrition</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Progress Graph */}
                  <div className="nutrition-section-card nutrition-progress-section">
                    <div className="section-card-header">
                      <h3 className="section-card-title">
                        <i className="ri-line-chart-line"></i> Progress
                      </h3>
                      <div className="progress-period-selector">
                        <button
                          className={`period-btn ${nutritionProgressPeriod === "weekly" ? "active" : ""}`}
                          onClick={() => setNutritionProgressPeriod("weekly")}
                        >
                          W
                        </button>
                        <button
                          className={`period-btn ${nutritionProgressPeriod === "monthly" ? "active" : ""}`}
                          onClick={() => setNutritionProgressPeriod("monthly")}
                        >
                          M
                        </button>
                        <button
                          className={`period-btn ${nutritionProgressPeriod === "yearly" ? "active" : ""}`}
                          onClick={() => setNutritionProgressPeriod("yearly")}
                        >
                          Y
                        </button>
                      </div>
                    </div>
                    <div className="section-card-body">
                      {nutritionHistoryLoading ? (
                        <div className="history-loading">
                          <i className="ri-loader-4-line profile-spinner"></i>
                          <p>Loading...</p>
                        </div>
                      ) : nutritionHistory.length > 0 ? (
                        <NutritionProgress nutritionEntries={nutritionHistory} period={nutritionProgressPeriod} />
                      ) : (
                        <div className="history-empty">
                          <i className="ri-line-chart-line"></i>
                          <p>No data yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sleep & Recovery */}
            {activeFeature === "sleep" && (
              <div className="nutrition-dashboard">
                {/* Summary Stats */}
                <div className="dashboard-stats-grid">
                  <div className="stat-card">
                    <div className="stat-card-icon" style={{ backgroundColor: "rgba(96, 165, 250, 0.15)", color: "#60a5fa" }}>
                      <i className="ri-calendar-check-line"></i>
                    </div>
                    <div className="stat-card-content">
                      <div className="stat-card-value">{sleepHistory.length}</div>
                      <div className="stat-card-label">Total Entries</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon" style={{ backgroundColor: "rgba(74, 222, 128, 0.15)", color: "#4ade80" }}>
                      <i className="ri-moon-line"></i>
                    </div>
                    <div className="stat-card-content">
                      <div className="stat-card-value">
                        {sleepHistory.length > 0
                          ? (sleepHistory.reduce((sum, s) => sum + s.total_sleep_hours, 0) / sleepHistory.length).toFixed(1)
                          : 0}
                      </div>
                      <div className="stat-card-label">Avg Sleep Hours</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon" style={{ backgroundColor: "rgba(249, 172, 84, 0.15)", color: "#f9ac54" }}>
                      <i className="ri-star-line"></i>
                    </div>
                    <div className="stat-card-content">
                      <div className="stat-card-value">
                        {sleepHistory.filter(s => s.sleep_quality === "excellent" || s.sleep_quality === "good").length}
                      </div>
                      <div className="stat-card-label">Good Sleep Days</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon" style={{ backgroundColor: "rgba(167, 139, 250, 0.15)", color: "#a78bfa" }}>
                      <i className="ri-fire-line"></i>
                    </div>
                    <div className="stat-card-content">
                      <div className="stat-card-value">
                        {sleepHistory.filter(s => {
                          const entryDate = new Date(s.date);
                          const today = new Date();
                          const weekAgo = new Date(today);
                          weekAgo.setDate(today.getDate() - 7);
                          return entryDate >= weekAgo;
                        }).length}
                      </div>
                      <div className="stat-card-label">This Week</div>
                    </div>
                  </div>
                </div>

                {/* Horizontal Layout: History | Enter Sleep | Progress Graph */}
                <div className="nutrition-horizontal-layout">
                  {/* Sleep History */}
                  <div className="nutrition-section-card nutrition-history-section">
                    <div className="section-card-header">
                      <h3 className="section-card-title">
                        <i className="ri-history-line"></i> History
                      </h3>
                    </div>
                    <div className="section-card-body">
                      {sleepHistoryLoading ? (
                        <div className="history-loading">
                          <i className="ri-loader-4-line profile-spinner"></i>
                          <p>Loading...</p>
                        </div>
                      ) : sleepHistory.length > 0 ? (
                        <div className="history-list">
                          {sleepHistory.slice(0, 5).map((entry) => {
                            const date = new Date(entry.date);
                            const formattedDate = date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            });
                            const dayName = date.toLocaleDateString("en-US", {
                              weekday: "short",
                            });

                            return (
                              <div
                                key={entry.date}
                                className="history-item"
                                onClick={() => handleSleepDateClick(entry.date)}
                              >
                                <div className="history-item-date">
                                  <span className="history-item-day">{dayName}</span>
                                  <span className="history-item-full">{formattedDate}</span>
                                </div>
                                <div className="history-item-stats">
                                  <span className="history-stat">
                                    <i className="ri-moon-line"></i> {entry.total_sleep_hours}h
                                  </span>
                                  <span className="history-stat">
                                    <i className="ri-star-line"></i> {entry.sleep_quality}
                                  </span>
                                </div>
                                <i className="ri-arrow-right-s-line history-item-arrow"></i>
                              </div>
                            );
                          })}
                          {sleepHistory.length > 5 && (
                            <div className="history-more">
                              <span>+{sleepHistory.length - 5} more</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="history-empty">
                          <i className="ri-inbox-line"></i>
                          <p>No history yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enter Sleep */}
                  <div className="nutrition-section-card nutrition-action-section">
                    <div className="section-card-header">
                      <h3 className="section-card-title">
                        <i className="ri-add-circle-line"></i> Enter Sleep
                      </h3>
                    </div>
                    <div className="section-card-body">
                      <div className="action-card-content">
                        <p className="action-description">Log your sleep and recovery data</p>
                        <button 
                          className="action-card-btn action-card-btn--primary"
                          onClick={() => {
                            setEditingSleepDate(null);
                            setSelectedSleepDate(new Date().toISOString().split("T")[0]);
                            setSleepModalOpen(true);
                          }}
                        >
                          <i className="ri-add-line"></i>
                          <span>Log Sleep</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Progress Graph */}
                  <div className="nutrition-section-card nutrition-progress-section">
                    <div className="section-card-header">
                      <h3 className="section-card-title">
                        <i className="ri-line-chart-line"></i> Progress
                      </h3>
                      <div className="progress-period-selector">
                        <button
                          className={`period-btn ${sleepProgressPeriod === "weekly" ? "active" : ""}`}
                          onClick={() => setSleepProgressPeriod("weekly")}
                        >
                          W
                        </button>
                        <button
                          className={`period-btn ${sleepProgressPeriod === "monthly" ? "active" : ""}`}
                          onClick={() => setSleepProgressPeriod("monthly")}
                        >
                          M
                        </button>
                        <button
                          className={`period-btn ${sleepProgressPeriod === "yearly" ? "active" : ""}`}
                          onClick={() => setSleepProgressPeriod("yearly")}
                        >
                          Y
                        </button>
                      </div>
                    </div>
                    <div className="section-card-body">
                      {sleepHistoryLoading ? (
                        <div className="history-loading">
                          <i className="ri-loader-4-line profile-spinner"></i>
                          <p>Loading...</p>
                        </div>
                      ) : sleepHistory.length > 0 ? (
                        <SleepProgress sleepEntries={sleepHistory} period={sleepProgressPeriod} />
                      ) : (
                        <div className="history-empty">
                          <i className="ri-line-chart-line"></i>
                          <p>No data yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Digestive Health */}
            {activeFeature === "digestive" && (
              <div className="nutrition-dashboard">
                {/* Summary Stats */}
                <div className="dashboard-stats-grid">
                  <div className="stat-card">
                    <div className="stat-card-icon" style={{ backgroundColor: "rgba(167, 139, 250, 0.15)", color: "#a78bfa" }}>
                      <i className="ri-calendar-check-line"></i>
                    </div>
                    <div className="stat-card-content">
                      <div className="stat-card-value">{digestionHistory.length}</div>
                      <div className="stat-card-label">Total Entries</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon" style={{ backgroundColor: "rgba(74, 222, 128, 0.15)", color: "#4ade80" }}>
                      <i className="ri-heart-pulse-line"></i>
                    </div>
                    <div className="stat-card-content">
                      <div className="stat-card-value">
                        {digestionHistory.filter(d => d.digestion_comfort === "excellent" || d.digestion_comfort === "good").length}
                      </div>
                      <div className="stat-card-label">Good Days</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon" style={{ backgroundColor: "rgba(96, 165, 250, 0.15)", color: "#60a5fa" }}>
                      <i className="ri-restaurant-line"></i>
                    </div>
                    <div className="stat-card-content">
                      <div className="stat-card-value">
                        {digestionHistory.filter(d => d.appetite === "excellent" || d.appetite === "good").length}
                      </div>
                      <div className="stat-card-label">Good Appetite Days</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon" style={{ backgroundColor: "rgba(249, 172, 84, 0.15)", color: "#f9ac54" }}>
                      <i className="ri-fire-line"></i>
                    </div>
                    <div className="stat-card-content">
                      <div className="stat-card-value">
                        {digestionHistory.filter(d => {
                          const entryDate = new Date(d.date);
                          const today = new Date();
                          const weekAgo = new Date(today);
                          weekAgo.setDate(today.getDate() - 7);
                          return entryDate >= weekAgo;
                        }).length}
                      </div>
                      <div className="stat-card-label">This Week</div>
                    </div>
                  </div>
                </div>

                {/* Horizontal Layout: History | Enter Digestion | Progress Graph */}
                <div className="nutrition-horizontal-layout">
                  {/* Digestion History */}
                  <div className="nutrition-section-card nutrition-history-section">
                    <div className="section-card-header">
                      <h3 className="section-card-title">
                        <i className="ri-history-line"></i> History
                      </h3>
                    </div>
                    <div className="section-card-body">
                      {digestionHistoryLoading ? (
                        <div className="history-loading">
                          <i className="ri-loader-4-line profile-spinner"></i>
                          <p>Loading...</p>
                        </div>
                      ) : digestionHistory.length > 0 ? (
                        <div className="history-list">
                          {digestionHistory.slice(0, 5).map((entry) => {
                            const date = new Date(entry.date);
                            const formattedDate = date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            });
                            const dayName = date.toLocaleDateString("en-US", {
                              weekday: "short",
                            });

                            return (
                              <div
                                key={entry.date}
                                className="history-item"
                                onClick={() => handleDigestionDateClick(entry.date)}
                              >
                                <div className="history-item-date">
                                  <span className="history-item-day">{dayName}</span>
                                  <span className="history-item-full">{formattedDate}</span>
                                </div>
                                <div className="history-item-stats">
                                  <span className="history-stat">
                                    <i className="ri-heart-pulse-line"></i> {entry.digestion_comfort || "N/A"}
                                  </span>
                                </div>
                                <i className="ri-arrow-right-s-line history-item-arrow"></i>
                              </div>
                            );
                          })}
                          {digestionHistory.length > 5 && (
                            <div className="history-more">
                              <span>+{digestionHistory.length - 5} more</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="history-empty">
                          <i className="ri-inbox-line"></i>
                          <p>No history yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enter Digestion */}
                  <div className="nutrition-section-card nutrition-action-section">
                    <div className="section-card-header">
                      <h3 className="section-card-title">
                        <i className="ri-add-circle-line"></i> Enter Digestion
                      </h3>
                    </div>
                    <div className="section-card-body">
                      <div className="action-card-content">
                        <p className="action-description">Log your digestive health and bathroom data</p>
                        <button 
                          className="action-card-btn action-card-btn--primary"
                          onClick={() => {
                            setEditingDigestionDate(null);
                            setSelectedDigestionDate(new Date().toISOString().split("T")[0]);
                            setDigestionModalOpen(true);
                          }}
                        >
                          <i className="ri-add-line"></i>
                          <span>Log Digestion</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Progress Graph */}
                  <div className="nutrition-section-card nutrition-progress-section">
                    <div className="section-card-header">
                      <h3 className="section-card-title">
                        <i className="ri-line-chart-line"></i> Progress
                      </h3>
                      <div className="progress-period-selector">
                        <button
                          className={`period-btn ${digestionProgressPeriod === "weekly" ? "active" : ""}`}
                          onClick={() => setDigestionProgressPeriod("weekly")}
                        >
                          W
                        </button>
                        <button
                          className={`period-btn ${digestionProgressPeriod === "monthly" ? "active" : ""}`}
                          onClick={() => setDigestionProgressPeriod("monthly")}
                        >
                          M
                        </button>
                        <button
                          className={`period-btn ${digestionProgressPeriod === "yearly" ? "active" : ""}`}
                          onClick={() => setDigestionProgressPeriod("yearly")}
                        >
                          Y
                        </button>
                      </div>
                    </div>
                    <div className="section-card-body">
                      {digestionHistoryLoading ? (
                        <div className="history-loading">
                          <i className="ri-loader-4-line profile-spinner"></i>
                          <p>Loading...</p>
                        </div>
                      ) : digestionHistory.length > 0 ? (
                        <DigestionProgress digestionEntries={digestionHistory} period={digestionProgressPeriod} />
                      ) : (
                        <div className="history-empty">
                          <i className="ri-line-chart-line"></i>
                          <p>No data yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Chatbot */}
            {activeFeature === "chatbot" && (
              <div className="feature-card feature-card--chatbot">
                <div className="chatbot-container">
                  <div className="chatbot-header">
                    <div className="chatbot-avatar">
                      <i className="ri-robot-line"></i>
                    </div>
                    <div className="chatbot-info">
                      <h3>AI Fitness Assistant</h3>
                      <p>Ask me anything about fitness, nutrition, or health</p>
                    </div>
                  </div>
                  <div className="chatbot-messages">
                    <div className="chatbot-message chatbot-message--bot">
                      <div className="message-avatar">
                        <i className="ri-robot-line"></i>
                      </div>
                      <div className="message-content">
                        <p>Hello! I&apos;m your AI fitness assistant. How can I help you today?</p>
                      </div>
                    </div>
                  </div>
                  <div className="chatbot-input-area">
                    <input 
                      type="text" 
                      className="chatbot-input" 
                      placeholder="Type your message here..."
                    />
                    <button className="chatbot-send-btn">
                      <i className="ri-send-plane-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Posture Correction Agent */}
            {activeFeature === "posture" && (
              <div className="feature-card feature-card--posture">
                <div className="posture-container">
                  <div className="posture-header">
                    <div className="posture-header-content">
                      <div className="posture-icon">
                        <i className="ri-camera-line"></i>
                      </div>
                      <div>
                        <h3>Posture Correction Agent</h3>
                        <p>Real-time posture analysis during exercises</p>
                      </div>
                    </div>
                    <button className="posture-start-btn">
                      <i className="ri-play-circle-line"></i>
                      Start Exercise Session
                    </button>
                  </div>
                  <div className="posture-camera-area">
                    <div className="posture-camera-placeholder">
                      <i className="ri-camera-off-line"></i>
                      <p>Camera feed will appear here</p>
                      <span>Start an exercise session to begin posture monitoring</span>
                    </div>
                  </div>
                  <div className="posture-instructions">
                    <h4>How it works:</h4>
                    <ul>
                      <li>Start an exercise session to activate the camera</li>
                      <li>The AI agent will analyze your posture in real-time</li>
                      <li>Receive instant feedback and corrections</li>
                      <li>Improve your form and prevent injuries</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSuccess={() => {}}
      />

      {/* Workout Detail Modal */}
      <WorkoutDetailModal
        isOpen={workoutDetailModalOpen}
        onClose={() => {
          setWorkoutDetailModalOpen(false);
          setSelectedWorkout(null);
        }}
        workout={selectedWorkout}
        onUpdate={handleWorkoutUpdate}
        onDelete={handleWorkoutDelete}
        onEdit={handleWorkoutEdit}
      />

      <WorkoutModal
        isOpen={workoutModalOpen}
        onClose={() => {
          setWorkoutModalOpen(false);
          setSelectedWorkoutDate(new Date().toISOString().split("T")[0]);
          setEditingWorkoutDate(null);
        }}
        onSuccess={handleWorkoutSuccess}
        selectedDate={selectedWorkoutDate}
        editWorkoutDate={editingWorkoutDate}
      />

      <NutritionDetailModal
        isOpen={nutritionDetailModalOpen}
        onClose={() => {
          setNutritionDetailModalOpen(false);
          setSelectedNutrition(null);
        }}
        nutrition={selectedNutrition}
        onUpdate={handleNutritionSuccess}
        onDelete={handleNutritionDelete}
        onEdit={handleNutritionEdit}
      />

      <NutritionModal
        isOpen={nutritionModalOpen}
        onClose={() => {
          setNutritionModalOpen(false);
          setSelectedNutritionDate(new Date().toISOString().split("T")[0]);
          setEditingNutritionDate(null);
        }}
        onSuccess={handleNutritionSuccess}
        selectedDate={selectedNutritionDate}
        editNutritionDate={editingNutritionDate}
        onDelete={handleNutritionDelete}
      />

      <SleepDetailModal
        isOpen={sleepDetailModalOpen}
        onClose={() => {
          setSleepDetailModalOpen(false);
          setSelectedSleep(null);
        }}
        sleep={selectedSleep}
        onUpdate={handleSleepSuccess}
        onDelete={handleSleepDelete}
        onEdit={handleSleepEdit}
      />

      <SleepModal
        isOpen={sleepModalOpen}
        onClose={() => {
          setSleepModalOpen(false);
          setSelectedSleepDate(new Date().toISOString().split("T")[0]);
          setEditingSleepDate(null);
        }}
        onSuccess={handleSleepSuccess}
        selectedDate={selectedSleepDate}
        editSleepDate={editingSleepDate}
        onDelete={handleSleepDelete}
      />

      <DigestionDetailModal
        isOpen={digestionDetailModalOpen}
        onClose={() => {
          setDigestionDetailModalOpen(false);
          setSelectedDigestion(null);
        }}
        digestion={selectedDigestion}
        onUpdate={handleDigestionSuccess}
        onDelete={handleDigestionDelete}
        onEdit={handleDigestionEdit}
      />

      <DigestionModal
        isOpen={digestionModalOpen}
        onClose={() => {
          setDigestionModalOpen(false);
          setSelectedDigestionDate(new Date().toISOString().split("T")[0]);
          setEditingDigestionDate(null);
        }}
        onSuccess={handleDigestionSuccess}
        selectedDate={selectedDigestionDate}
        editDigestionDate={editingDigestionDate}
        onDelete={handleDigestionDelete}
      />
    </div>
  );
}
