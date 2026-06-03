"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { SleepResponse } from "@/lib/api/sleep";

interface SleepProgressProps {
  sleepEntries: SleepResponse[];
  period: "weekly" | "monthly" | "yearly";
}

export default function SleepProgress({ sleepEntries, period }: SleepProgressProps) {
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

    // Group sleep entries by period
    const grouped: { [key: string]: { sleepHours: number; quality: number; count: number } } = {};

    sleepEntries.forEach((entry) => {
      const entryDate = new Date(entry.date);
      if (entryDate >= startDate && entryDate <= now) {
        const key = dateFormat(entryDate);
        if (!grouped[key]) {
          grouped[key] = { sleepHours: 0, quality: 0, count: 0 };
        }
        grouped[key].sleepHours += entry.total_sleep_hours || 0;
        // Convert quality to numeric: excellent=4, good=3, fair=2, poor=1
        const qualityMap: { [key: string]: number } = {
          excellent: 4,
          good: 3,
          fair: 2,
          poor: 1,
        };
        grouped[key].quality += qualityMap[entry.sleep_quality] || 0;
        grouped[key].count += 1;
      }
    });

    // Create data array sorted by date
    const data = Object.entries(grouped)
      .map(([name, values]) => ({
        name,
        sleepHours: values.count > 0 ? Number((values.sleepHours / values.count).toFixed(1)) : 0,
        quality: values.count > 0 ? Number((values.quality / values.count).toFixed(1)) : 0,
        entries: values.count,
      }))
      .sort((a, b) => {
        return a.name.localeCompare(b.name);
      });

    return data;
  }, [sleepEntries, period]);

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
            dataKey="sleepHours" 
            stroke="#60a5fa" 
            strokeWidth={2}
            name="Avg Sleep Hours"
            dot={{ fill: "#60a5fa", r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="quality" 
            stroke="#a78bfa" 
            strokeWidth={2}
            name="Avg Quality (1-4)"
            dot={{ fill: "#a78bfa", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

