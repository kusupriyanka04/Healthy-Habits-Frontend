import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const CATEGORY_CONFIG = {
  fitness: {
    color: "#f97316",
    bg: "rgba(249,115,22,0.1)",
    border: "rgba(249,115,22,0.2)",
    icon: "🏋️",
    label: "Fitness",
  },
  nutrition: {
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.2)",
    icon: "🥗",
    label: "Nutrition",
  },
  sleep: {
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.2)",
    icon: "😴",
    label: "Sleep",
  },
  mindfulness: {
    color: "#a855f7",
    bg: "rgba(168,85,247,0.1)",
    border: "rgba(168,85,247,0.2)",
    icon: "🧘",
    label: "Mindfulness",
  },
  mental_health: {
    color: "#ec4899",
    bg: "rgba(236,72,153,0.1)",
    border: "rgba(236,72,153,0.2)",
    icon: "💆",
    label: "Mental Health",
  },
  productivity: {
    color: "#eab308",
    bg: "rgba(234,179,8,0.1)",
    border: "rgba(234,179,8,0.2)",
    icon: "⚡",
    label: "Productivity",
  },
  hydration: {
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.1)",
    border: "rgba(6,182,212,0.2)",
    icon: "💧",
    label: "Hydration",
  },
  social: {
    color: "#f43f5e",
    bg: "rgba(244,63,94,0.1)",
    border: "rgba(244,63,94,0.2)",
    icon: "👥",
    label: "Social",
  },
  finance: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.2)",
    icon: "💰",
    label: "Finance",
  },
  reading: {
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
    border: "rgba(139,92,246,0.2)",
    icon: "📚",
    label: "Reading",
  },
};
export const UNIT_CONFIG = {
  fitness: { units: ["mins", "km", "reps", "sets"], default: "mins" },
  nutrition: { units: ["meals", "calories", "servings"], default: "meals" },
  sleep: { units: ["hours", "mins"], default: "hours" },
  mindfulness: { units: ["mins", "sessions"], default: "mins" },
  mental_health: { units: ["mins", "sessions"], default: "sessions" },
  productivity: { units: ["tasks", "mins", "hours"], default: "tasks" },
  hydration: { units: ["glasses", "liters", "ml"], default: "glasses" },
  social: { units: ["mins", "sessions"], default: "mins" },
  finance: { units: ["days", "sessions"], default: "days" },
  reading: { units: ["pages", "mins", "chapters"], default: "pages" },
};
