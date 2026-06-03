"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { NutritionResponse } from "@/lib/api/nutrition";

interface NutritionProgressProps {
  nutritionEntries: NutritionResponse[];
  period: "weekly" | "monthly" | "yearly";
}

export default function NutritionProgress({ nutritionEntries, period }: NutritionProgressProps) {
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

    // Group nutrition entries by period
    const grouped: { [key: string]: { meals: number; water: number; count: number } } = {};

    nutritionEntries.forEach((entry) => {
      const entryDate = new Date(entry.date);
      if (entryDate >= startDate && entryDate <= now) {
        const key = dateFormat(entryDate);
        if (!grouped[key]) {
          grouped[key] = { meals: 0, water: 0, count: 0 };
        }
        grouped[key].meals += entry.meals.length;
        grouped[key].water += entry.water_glasses || 0;
        grouped[key].count += 1;
      }
    });

    // Create data array sorted by date
    const data = Object.entries(grouped)
      .map(([name, values]) => ({
        name,
        meals: values.count > 0 ? Math.round(values.meals / values.count) : 0,
        water: values.count > 0 ? Math.round(values.water / values.count) : 0,
        entries: values.count,
      }))
      .sort((a, b) => {
        return a.name.localeCompare(b.name);
      });

    return data;
  }, [nutritionEntries, period]);

  return (
    <div className="nutrition-progress-chart">
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
            dataKey="meals" 
            stroke="#4ade80" 
            strokeWidth={2}
            name="Avg Meals"
            dot={{ fill: "#4ade80", r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="water" 
            stroke="#60a5fa" 
            strokeWidth={2}
            name="Avg Water Glasses"
            dot={{ fill: "#60a5fa", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


