"use client";

import { useMemo } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { WorkoutResponse } from "@/lib/api/workout";

interface WorkoutProgressProps {
  workouts: WorkoutResponse[];
  period: "weekly" | "monthly" | "yearly";
}

export default function WorkoutProgress({ workouts, period }: WorkoutProgressProps) {
  const chartData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let dateFormat: (date: Date) => string;

    switch (period) {
      case "weekly":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        dateFormat = (d) => {
          const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          return days[d.getDay()];
        };
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFormat = (d) => {
          const week = Math.floor((d.getDate() - 1) / 7) + 1;
          return `Week ${week}`;
        };
        break;
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1);
        dateFormat = (d) => {
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          return months[d.getMonth()];
        };
        break;
    }

    // Group workouts by period
    const grouped: { [key: string]: { duration: number; exercises: number; count: number } } = {};

    workouts.forEach((workout) => {
      const workoutDate = new Date(workout.date);
      if (workoutDate >= startDate && workoutDate <= now) {
        const key = dateFormat(workoutDate);
        if (!grouped[key]) {
          grouped[key] = { duration: 0, exercises: 0, count: 0 };
        }
        grouped[key].duration += workout.total_duration;
        grouped[key].exercises += workout.exercises.length;
        grouped[key].count += 1;
      }
    });

    // Create data array sorted by date
    const data = Object.entries(grouped)
      .map(([name, values]) => ({
        name,
        duration: values.count > 0 ? Math.round(values.duration / values.count) : 0,
        exercises: values.count > 0 ? Math.round(values.exercises / values.count) : 0,
        workouts: values.count,
      }))
      .sort((a, b) => {
        // Simple sorting - can be improved
        return a.name.localeCompare(b.name);
      });

    // If no data, return empty array to show empty state
    return data;
  }, [workouts, period]);

  return (
    <div className="workout-progress-chart">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey="name" 
            stroke="rgba(255, 255, 255, 0.5)"
            style={{ fontSize: "0.75rem" }}
          />
          <YAxis 
            stroke="rgba(255, 255, 255, 0.5)"
            style={{ fontSize: "0.75rem" }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: "rgba(15, 17, 20, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              color: "#ffffff"
            }}
          />
          <Legend 
            wrapperStyle={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.875rem" }}
          />
          <Line 
            type="monotone" 
            dataKey="duration" 
            stroke="#f9ac54" 
            strokeWidth={2}
            name="Avg Duration (min)"
            dot={{ fill: "#f9ac54", r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="exercises" 
            stroke="#4ade80" 
            strokeWidth={2}
            name="Avg Exercises"
            dot={{ fill: "#4ade80", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

