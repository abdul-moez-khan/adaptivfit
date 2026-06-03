"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DigestionResponse } from "@/lib/api/digestion";

interface DigestionProgressProps {
  digestionEntries: DigestionResponse[];
  period: "weekly" | "monthly" | "yearly";
}

export default function DigestionProgress({ digestionEntries, period }: DigestionProgressProps) {
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

    // Convert quality strings to numeric values
    const qualityToNumber = (quality: string | undefined): number => {
      const qualityMap: { [key: string]: number } = {
        excellent: 4,
        good: 3,
        fair: 2,
        poor: 1,
      };
      return qualityMap[quality || "good"] || 0;
    };

    // Group digestion entries by period
    const grouped: { [key: string]: { comfort: number; appetite: number; hydration: number; stoolFreq: number; count: number } } = {};

    digestionEntries.forEach((entry) => {
      const entryDate = new Date(entry.date);
      if (entryDate >= startDate && entryDate <= now) {
        const key = dateFormat(entryDate);
        if (!grouped[key]) {
          grouped[key] = { comfort: 0, appetite: 0, hydration: 0, stoolFreq: 0, count: 0 };
        }
        grouped[key].comfort += qualityToNumber(entry.digestion_comfort);
        grouped[key].appetite += qualityToNumber(entry.appetite);
        grouped[key].hydration += qualityToNumber(entry.hydration_level);
        grouped[key].stoolFreq += entry.stool_frequency || 0;
        grouped[key].count += 1;
      }
    });

    // Create data array sorted by date
    const data = Object.entries(grouped)
      .map(([name, values]) => ({
        name,
        comfort: values.count > 0 ? Number((values.comfort / values.count).toFixed(1)) : 0,
        appetite: values.count > 0 ? Number((values.appetite / values.count).toFixed(1)) : 0,
        hydration: values.count > 0 ? Number((values.hydration / values.count).toFixed(1)) : 0,
        stoolFreq: values.count > 0 ? Number((values.stoolFreq / values.count).toFixed(1)) : 0,
        entries: values.count,
      }))
      .sort((a, b) => {
        return a.name.localeCompare(b.name);
      });

    return data;
  }, [digestionEntries, period]);

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
            dataKey="comfort" 
            stroke="#a78bfa" 
            strokeWidth={2}
            name="Comfort (1-4)"
            dot={{ fill: "#a78bfa", r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="appetite" 
            stroke="#4ade80" 
            strokeWidth={2}
            name="Appetite (1-4)"
            dot={{ fill: "#4ade80", r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="hydration" 
            stroke="#60a5fa" 
            strokeWidth={2}
            name="Hydration (1-4)"
            dot={{ fill: "#60a5fa", r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="stoolFreq" 
            stroke="#f9ac54" 
            strokeWidth={2}
            name="Stool Frequency"
            dot={{ fill: "#f9ac54", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

