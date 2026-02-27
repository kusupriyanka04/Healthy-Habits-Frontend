import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Flame,
  Trash2,
  Target,
  Repeat,
  Pencil,
  Plus,
  CheckCircle,
} from "lucide-react";
import { CATEGORY_CONFIG, UNIT_CONFIG } from "../lib/utils.jsx";

// ─── Singular unit label for button ──────────────────────
// "glasses" → "glass", "calories" → "calorie", "mins" → "min" etc.
const toSingular = (unit = "") => {
  const map = {
    glasses: "glass",
    liters: "liter",
    calories: "calorie",
    meals: "meal",
    servings: "serving",
    hours: "hour",
    mins: "min",
    sessions: "session",
    tasks: "task",
    pages: "page",
    chapters: "chapter",
    sets: "set",
    reps: "rep",
    km: "km",
    steps: "step",
    days: "day",
    times: "time",
  };
  return map[unit.toLowerCase()] || unit;
};

// ─── Motivational message based on progress ───────────────
const getProgressMessage = (count, target, unit) => {
  if (target <= 0) return null;
  const pct = (count / target) * 100;

  if (count === 0) return null;
  if (pct >= 100) return { text: "🎯 Target reached!", color: "#22c55e" };
  if (pct >= 80) return { text: "🔥 Almost there!", color: "#f97316" };
  if (pct >= 50) return { text: "💪 Halfway through!", color: "#eab308" };
  if (pct >= 25) return { text: "⚡ Good progress!", color: "#3b82f6" };
  return null;
};

// ─── HabitCard ────────────────────────────────────────────
const HabitCard = ({
  habit,
  onLog,
  onDelete,
  onEdit,
  isLogging,
  index = 0,
}) => {
  const cfg = CATEGORY_CONFIG[habit.category] || CATEGORY_CONFIG.productivity;

  // unit → what was saved (e.g. "glasses", "calories", "sets")
  const unit = habit.unit || UNIT_CONFIG[habit.category]?.default || "times";
  const target = Number(habit.target_value) || 1;

  // count starts from today's already logged value
  const [count, setCount] = useState(Number(habit.today_value) || 0);
  const [adding, setAdding] = useState(false);

  // Sync when parent updates today_value (e.g. on page load / refresh)
  useEffect(() => {
    setCount(Number(habit.today_value) || 0);
  }, [habit.today_value]);

  const progress = Math.min((count / target) * 100, 100);
  const isDone = count >= target;
  const singular = toSingular(unit);
  const message = getProgressMessage(count, target, unit);

  // Progress bar color — green when done, orange when close, brand color otherwise
  const barColor = isDone ? "#22c55e" : progress >= 80 ? "#f97316" : cfg.color;

  const handleAdd = async () => {
    if (isLogging || adding) return;

    // Optimistic update
    setAdding(true);
    const optimistic = count + 1;
    setCount(optimistic);

    try {
      const data = await onLog(habit.id);
      // Sync with server value
      if (data?.today_value !== undefined) {
        setCount(Number(data.today_value));
      }
    } catch {
      // Revert on error
      setCount(count);
    } finally {
      setAdding(false);
    }
  };

  return (
    <motion.div
      className="card p-5 flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
      layout
    >
      {/* ─── Top: icon + name + streak ─────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
          >
            {cfg.icon}
          </div>
          <div className="min-w-0">
            <h3
              className="font-syne font-bold text-sm leading-snug truncate"
              style={{ color: "var(--text)" }}
            >
              {habit.name}
            </h3>
            <span
              className="badge mt-0.5"
              style={{
                background: cfg.bg,
                color: cfg.color,
                border: `1px solid ${cfg.border}`,
              }}
            >
              {cfg.label}
            </span>
          </div>
        </div>

        {/* Streak */}
        {(habit.streak || 0) > 0 && (
          <motion.div
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl shrink-0"
            style={{
              background: "rgba(249,115,22,0.1)",
              border: "1px solid rgba(249,115,22,0.2)",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: index * 0.06 + 0.2 }}
          >
            <Flame size={12} style={{ color: "#f97316" }} />
            <span
              className="font-syne font-bold text-xs"
              style={{ color: "#f97316" }}
            >
              {habit.streak}
            </span>
          </motion.div>
        )}
      </div>

      {/* ─── Goal ──────────────────────────────────────── */}
      <div
        className="flex items-start gap-2 p-3 rounded-xl"
        style={{
          background: "var(--bg-muted)",
          border: "1px solid var(--border-muted)",
        }}
      >
        <Target
          size={13}
          className="mt-0.5 shrink-0"
          style={{ color: "var(--text-faint)" }}
        />
        <p
          className="text-xs leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          {habit.goal}
        </p>
      </div>

      {/* ─── Progress ──────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        {/* Count label: "4 / 10 glasses" */}
        <div className="flex justify-between items-center">
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--text-muted)" }}
          >
            Today's Progress
          </span>
          <span
            className="text-xs font-bold font-syne"
            style={{ color: barColor }}
          >
            {count} / {target} {unit}
          </span>
        </div>

        {/* Progress Bar */}
        <div
          className="h-3 rounded-full overflow-hidden relative"
          style={{ background: "var(--bg-muted)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: barColor }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Shimmer effect when in progress */}
          {!isDone && count > 0 && (
            <motion.div
              className="absolute inset-y-0 left-0 w-full rounded-full opacity-30"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${barColor} 50%, transparent 100%)`,
                width: `${progress}%`,
              }}
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          )}
        </div>

        {/* Motivational message */}
        {message && (
          <motion.p
            className="text-xs text-center font-semibold"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            key={message.text}
            style={{ color: message.color }}
          >
            {message.text}
          </motion.p>
        )}
      </div>

      {/* ─── Add Button ────────────────────────────────── */}
      {/*
        Examples:
        Hydration (glasses, 10)   → "+ Add glass"     → "Add more glasses" when done
        Nutrition (calories, 1500)→ "+ Add calorie"   → "Add more calories" when done
        Fitness (sets, 3)         → "+ Add set"       → "Add more sets" when done
        Sleep (hours, 8)          → "+ Add hour"      → "Add more hours" when done
      */}
      <motion.button
        onClick={handleAdd}
        disabled={adding || isLogging}
        className="w-full py-3 rounded-xl text-sm font-bold font-syne flex items-center justify-center gap-2"
        style={{
          background: isDone ? "rgba(34,197,94,0.1)" : cfg.bg,
          border: `1.5px solid ${isDone ? "rgba(34,197,94,0.3)" : cfg.border}`,
          color: isDone ? "#22c55e" : cfg.color,
          opacity: adding || isLogging ? 0.65 : 1,
          cursor: adding || isLogging ? "not-allowed" : "pointer",
        }}
        whileTap={!adding && !isLogging ? { scale: 0.97 } : {}}
      >
        {adding || isLogging ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Plus size={14} />
        )}

        {
          adding || isLogging
            ? `Adding ${singular}...`
            : isDone
              ? ` Add more ${unit}` // "Add more glasses"
              : ` Add ${singular}` // "Add glass"
        }
      </motion.button>

      {/* ─── Weekly Days Display ───────────────────────── */}
      {habit.frequency === "weekly" && (
        <div>
          <p
            className="text-xs font-semibold mb-2"
            style={{ color: "var(--text-faint)" }}
          >
            Scheduled Days
          </p>
          <div className="flex gap-1.5">
            {[
              { key: "S", label: "S", full: "Sun" },
              { key: "M", label: "M", full: "Mon" },
              { key: "T", label: "T", full: "Tue" },
              { key: "W", label: "W", full: "Wed" },
              { key: "T2", label: "T", full: "Thu" },
              { key: "F", label: "F", full: "Fri" },
              { key: "S2", label: "S", full: "Sat" },
            ].map((day) => {
              const isSelected = (habit.selected_days || []).includes(day.key);
              return (
                <div
                  key={day.key}
                  className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg"
                  style={{
                    background: isSelected
                      ? "rgba(34,197,94,0.12)"
                      : "var(--bg-muted)",
                    border: `1px solid ${isSelected ? "rgba(34,197,94,0.35)" : "var(--border-muted)"}`,
                  }}
                  title={day.full}
                >
                  <span
                    className="text-xs font-extrabold font-syne"
                    style={{
                      color: isSelected ? "#22c55e" : "var(--text-faint)",
                    }}
                  >
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* ─── Footer: frequency + edit + delete + log ───── */}
      <div
        className="flex items-center justify-between pt-1 border-t"
        style={{ borderColor: "var(--border-muted)" }}
      >
        <div
          className="flex items-center gap-1.5"
          style={{ color: "var(--text-faint)" }}
        >
          <Repeat size={11} />
          <span className="text-xs capitalize font-medium">
            {habit.frequency}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Edit */}
          <motion.button
            onClick={() => onEdit(habit)}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ color: "var(--text-faint)" }}
            whileHover={{
              color: "#3b82f6",
              background: "rgba(59,130,246,0.1)",
            }}
            whileTap={{ scale: 0.9 }}
            title="Edit"
          >
            <Pencil size={13} />
          </motion.button>

          {/* Delete */}
          <motion.button
            onClick={() => onDelete(habit.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ color: "var(--text-faint)" }}
            whileHover={{ color: "#ef4444", background: "rgba(239,68,68,0.1)" }}
            whileTap={{ scale: 0.9 }}
            title="Delete"
          >
            <Trash2 size={13} />
          </motion.button>

          {/* Log */}
          <motion.button
            onClick={handleAdd}
            disabled={adding || isLogging}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-syne"
            style={{
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.25)",
              color: "#22c55e",
            }}
            whileHover={{ background: "rgba(34,197,94,0.18)" }}
            whileTap={{ scale: 0.95 }}
          >
            <CheckCircle size={13} />
            Log
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default HabitCard;
