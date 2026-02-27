import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import {
  ChevronLeft,
  ChevronRight,
  FileDown,
  TrendingUp,
  Activity,
  Calendar,
} from "lucide-react";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import api from "../api/axios.jsx";
import Button from "../components/ui/Button.jsx";
import { CATEGORY_CONFIG } from "../lib/utils.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import PageWrapper from "../components/pageWrapper.jsx";


// ─── Custom Tooltip ───────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-4 py-3 text-sm" style={{ minWidth: 180 }}>
      <p className="font-syne font-bold mb-2" style={{ color: "var(--text)" }}>
        {label}
      </p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 mt-1">
          <div className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ background: p.fill }}
            />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {p.name}
            </span>
          </div>
          <span
            className="text-xs font-bold font-syne"
            style={{ color: p.fill }}
          >
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Wellness Ring ────────────────────────────────────────
const WellnessRing = ({ score }) => {
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#eab308" : "#ef4444";
  const radius = 58;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const label = score >= 70 ? "Excellent" : score >= 40 ? "Good" : "Needs Work";
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width="150" height="150" className="-rotate-90">
          <circle
            cx="75"
            cy="75"
            r={radius}
            fill="none"
            stroke="#1e2a23"
            strokeWidth="12"
          />
          <motion.circle
            cx="75"
            cy="75"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={circ}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-syne font-extrabold text-4xl"
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--text-faint)" }}
          >
            / 100
          </span>
        </div>
      </div>
      <div
        className="px-4 py-1.5 rounded-full text-xs font-bold font-syne"
        style={{
          background: `${color}18`,
          color,
          border: `1px solid ${color}30`,
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ─── Calendar View ────────────────────────────────────────
// rawHabits = from /habits API (has id, created_at, unit, target_value)
const CalendarView = ({ rawHabits }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState({});
  const [calLoading, setCalLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayDetail, setDayDetail] = useState([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    if (rawHabits.length > 0) fetchMonthLogs();
    else setLogs({});
    setSelectedDay(null);
    setDayDetail([]);
  }, [currentDate, rawHabits]);

  const fetchMonthLogs = async () => {
    setCalLoading(true);
    setLogs({});
    try {
      const mm = String(month + 1).padStart(2, "0");
      const startDate = `${year}-${mm}-01`;
      const endDate = `${year}-${mm}-${String(daysInMonth).padStart(2, "0")}`;

      // ← Use h.id (from raw habits), not h.habitId
      const results = await Promise.all(
        rawHabits.map((h) =>
          api
            .get(`/habits/${h.id}/logs?start=${startDate}&end=${endDate}`)
            .then((r) => ({ habitId: h.id, logs: r.data || [] }))
            .catch(() => ({ habitId: h.id, logs: [] })),
        ),
      );
      console.log(
        "RAW HABITS:",
        rawHabits.map((h) => ({ id: h.id, name: h.name })),
      );
      console.log("LOG RESULTS:", JSON.stringify(results, null, 2));
      // Build: { 'YYYY-MM-DD': { habitId: { value, completed } } }
      const logMap = {};
      results.forEach(({ habitId, logs: habitLogs }) => {
        habitLogs.forEach((log) => {
          if (!logMap[log.log_date]) logMap[log.log_date] = {};
          logMap[log.log_date][habitId] = {
            value: log.value || 0,
            completed: log.completed || false,
          };
        });
      });

      setLogs(logMap);
    } catch {
      toast.error("Failed to load calendar");
    } finally {
      setCalLoading(false);
    }
  };

  // ← Only show habits that existed on that date (using created_at)
  const getHabitsForDate = (dateStr) => {
    return rawHabits.filter((h) => {
      if (!h.created_at) return true;
      const createdDate = h.created_at.split("T")[0];
      return createdDate <= dateStr;
    });
  };

  const getStatus = (day) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const dateStr = `${year}-${mm}-${dd}`;
    const dayLogs = logs[dateStr];
    const dayHabits = getHabitsForDate(dateStr);

    if (!dayHabits.length) return "empty";
    if (!dayLogs || !Object.keys(dayLogs).length) return "empty";

    const completed = dayHabits.filter(
      (h) => dayLogs[h.id]?.completed === true,
    ).length;
    if (completed === 0) return "none";
    if (completed === dayHabits.length) return "full";
    return "partial";
  };

  const handleDayClick = (day) => {
    if (isFuture(day)) return;

    if (selectedDay === day) {
      setSelectedDay(null);
      setDayDetail([]);
      return;
    }

    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const dateStr = `${year}-${mm}-${dd}`;
    const dayLogs = logs[dateStr] || {};

    // ← Only habits that existed on this specific date
    const habitsOnDate = getHabitsForDate(dateStr);

    const detail = habitsOnDate.map((h) => {
      const cfg = CATEGORY_CONFIG[h.category] || CATEGORY_CONFIG.productivity;
      const logEntry = dayLogs[h.id]; // ← h.id correct now
      const value = logEntry?.value || 0;
      const done = logEntry?.completed || false;
      const target = Number(h.target_value) || 1;
      const unit = h.unit || "times";
      const progress = Math.min((value / target) * 100, 100);
      return { ...h, cfg, value, done, target, unit, progress };
    });

    setSelectedDay(day);
    setDayDetail(detail);
  };

  const statusStyle = {
    empty: { bg: "transparent", border: "#1e2a23", text: "#3d5a4d" },
    none: {
      bg: "rgba(239,68,68,0.1)",
      border: "rgba(239,68,68,0.35)",
      text: "#ef4444",
    },
    partial: {
      bg: "rgba(234,179,8,0.1)",
      border: "rgba(234,179,8,0.35)",
      text: "#eab308",
    },
    full: {
      bg: "rgba(34,197,94,0.15)",
      border: "rgba(34,197,94,0.45)",
      text: "#22c55e",
    },
  };

  const isToday = (d) =>
    d === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();
  const isFuture = (d) => new Date(year, month, d) > today;

  const mm = String(month + 1).padStart(2, "0");
  const thisMonthKeys = Object.keys(logs).filter((d) =>
    d.startsWith(`${year}-${mm}`),
  );
  const fullDays = thisMonthKeys.filter(
    (d) => getStatus(parseInt(d.split("-")[2])) === "full",
  ).length;
  const partialDays = thisMonthKeys.filter(
    (d) => getStatus(parseInt(d.split("-")[2])) === "partial",
  ).length;
  const missedDays = thisMonthKeys.filter(
    (d) => getStatus(parseInt(d.split("-")[2])) === "none",
  ).length;
  const canGoNext = !(
    month === today.getMonth() && year === today.getFullYear()
  );

  return (
    <motion.div
      className="card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2
            className="font-syne font-bold text-lg"
            style={{ color: "var(--text)" }}
          >
            Habit Calendar
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Click any past day to see that day's habits
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => {
              setSelectedDay(null);
              setCurrentDate(new Date(year, month - 1, 1));
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "var(--bg-muted)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
            whileTap={{ scale: 0.92 }}
          >
            <ChevronLeft size={15} />
          </motion.button>
          <span
            className="font-syne font-bold text-sm min-w-[140px] text-center"
            style={{ color: "var(--text)" }}
          >
            {monthName}
          </span>
          <motion.button
            onClick={() => {
              setSelectedDay(null);
              setCurrentDate(new Date(year, month + 1, 1));
            }}
            disabled={!canGoNext}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "var(--bg-muted)",
              border: "1px solid var(--border)",
              color: canGoNext ? "var(--text-muted)" : "var(--border)",
              cursor: canGoNext ? "pointer" : "not-allowed",
            }}
            whileTap={canGoNext ? { scale: 0.92 } : {}}
          >
            <ChevronRight size={15} />
          </motion.button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        {[
          { label: "All Done", color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
          { label: "Partial", color: "#eab308", bg: "rgba(234,179,8,0.1)" },
          { label: "Missed", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
          { label: "No Data", color: "#3d5a4d", bg: "transparent" },
        ].map(({ label, color, bg }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ background: bg, border: `1.5px solid ${color}` }}
            />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Month Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Perfect", value: fullDays, color: "#22c55e" },
          { label: "Partial", value: partialDays, color: "#eab308" },
          { label: "Missed", value: missedDays, color: "#ef4444" },
          { label: "Habits", value: rawHabits.length, color: "#3b82f6" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="p-3 rounded-xl text-center"
            style={{ background: `${color}10`, border: `1px solid ${color}20` }}
          >
            <p className="font-syne font-bold text-xl" style={{ color }}>
              {value}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-faint)" }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-bold py-1 font-syne"
            style={{ color: "var(--text-faint)" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      {calLoading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg animate-pulse"
              style={{ background: "var(--bg-muted)" }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const future = isFuture(day);
            const status = future ? "empty" : getStatus(day);
            const s = statusStyle[status];
            const tod = isToday(day);
            const sel = selectedDay === day;

            return (
              <motion.div
                key={day}
                onClick={() => handleDayClick(day)}
                className="aspect-square rounded-lg flex flex-col items-center justify-center relative"
                style={{
                  background: tod ? "rgba(34,197,94,0.2)" : s.bg,
                  border: `1.5px solid ${sel ? "#22c55e" : tod ? "#22c55e" : s.border}`,
                  opacity: future ? 0.3 : 1,
                  cursor: future ? "default" : "pointer",
                  boxShadow: sel ? "0 0 0 2px rgba(34,197,94,0.35)" : "none",
                }}
                whileHover={!future ? { scale: 1.1 } : {}}
                whileTap={!future ? { scale: 0.95 } : {}}
              >
                <span
                  className="text-xs font-bold font-syne"
                  style={{ color: tod ? "#22c55e" : s.text }}
                >
                  {day}
                </span>
                {!future && status !== "empty" && (
                  <div
                    className="w-1 h-1 rounded-full mt-0.5"
                    style={{ background: s.text }}
                  />
                )}
                {tod && (
                  <div
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                    style={{ background: "#22c55e" }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ─── Day Detail Panel ─────────────────────────── */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 20 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="pt-4 border-t"
              style={{ borderColor: "var(--border-muted)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <p
                  className="font-syne font-bold text-sm"
                  style={{ color: "var(--text)" }}
                >
                  {new Date(year, month, selectedDay).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                  style={{
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.2)",
                  }}
                >
                  <span
                    className="text-xs font-bold"
                    style={{ color: "#22c55e" }}
                  >
                    {dayDetail.filter((h) => h.done).length}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-faint)" }}
                  >
                    / {dayDetail.length} habits done
                  </span>
                </div>
              </div>

              {dayDetail.length === 0 ? (
                <p
                  className="text-sm text-center py-6"
                  style={{ color: "var(--text-faint)" }}
                >
                  No habits were tracked on this day
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {dayDetail.map((h, i) => (
                    <motion.div
                      key={h.id}
                      className="p-4 rounded-xl"
                      style={{
                        background: h.done
                          ? "rgba(34,197,94,0.07)"
                          : h.value > 0
                            ? "rgba(234,179,8,0.06)"
                            : "rgba(239,68,68,0.05)",
                        border: `1px solid ${
                          h.done
                            ? "rgba(34,197,94,0.22)"
                            : h.value > 0
                              ? "rgba(234,179,8,0.22)"
                              : "rgba(239,68,68,0.15)"
                        }`,
                      }}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      {/* Top row — icon + name + status */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                            style={{
                              background: h.cfg.bg,
                              border: `1px solid ${h.cfg.border}`,
                            }}
                          >
                            {h.cfg.icon}
                          </div>
                          <div>
                            <p
                              className="font-syne font-bold text-sm"
                              style={{ color: "var(--text)" }}
                            >
                              {h.name}
                            </p>
                            <span
                              className="text-xs"
                              style={{ color: h.cfg.color }}
                            >
                              {h.cfg.label}
                            </span>
                          </div>
                        </div>

                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                          style={{
                            background: h.done
                              ? "rgba(34,197,94,0.12)"
                              : h.value > 0
                                ? "rgba(234,179,8,0.1)"
                                : "rgba(239,68,68,0.08)",
                          }}
                        >
                          <span className="text-sm">
                            {h.done ? "✅" : h.value > 0 ? "⚡" : "❌"}
                          </span>
                          <span
                            className="text-xs font-bold font-syne"
                            style={{
                              color: h.done
                                ? "#22c55e"
                                : h.value > 0
                                  ? "#eab308"
                                  : "#ef4444",
                            }}
                          >
                            {h.done
                              ? "Completed"
                              : h.value > 0
                                ? "Partial"
                                : "Missed"}
                          </span>
                        </div>
                      </div>

                      {/* Progress count */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Progress
                        </span>
                        <span
                          className="text-xs font-bold font-syne"
                          style={{
                            color: h.done
                              ? "#22c55e"
                              : h.value > 0
                                ? "#eab308"
                                : "#ef4444",
                          }}
                        >
                          {h.value} / {h.target} {h.unit}
                          <span className="ml-1 opacity-50 font-normal">
                            ({Math.round(h.progress)}%)
                          </span>
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div
                        className="h-2.5 rounded-full overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.05)" }}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: h.done
                              ? "#22c55e"
                              : h.value > 0
                                ? "#eab308"
                                : "#ef4444",
                            minWidth: h.value > 0 ? "4px" : "0px",
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${h.progress}%` }}
                          transition={{ duration: 0.8, delay: i * 0.06 }}
                        />
                      </div>

                      {h.value === 0 && (
                        <p
                          className="text-xs mt-1.5"
                          style={{ color: "var(--text-faint)" }}
                        >
                          Not logged on this day
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {rawHabits.length === 0 && (
        <div
          className="text-center py-8"
          style={{ color: "var(--text-faint)" }}
        >
          <p className="text-sm">
            No habits yet — create some to see calendar data
          </p>
        </div>
      )}
    </motion.div>
  );
};

// ─── Main Analytics ───────────────────────────────────────
const Analytics = () => {
  const [wellness, setWellness] = useState(null);
  const [habits, setHabits] = useState([]);
  const [rawHabits, setRawHabits] = useState([]); // ← raw habits with id + created_at
  const [weekly, setWeekly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [w, h, wk, raw] = await Promise.all([
        api.get("/analytics/wellness"),
        api.get("/analytics/habits"),
        api.get("/analytics/weekly"),
        api.get("/habits"), // ← fetch raw habits for calendar
      ]);
      setWellness(w.data);
      setHabits(h.data);
      setWeekly(wk.data);
      setRawHabits(raw.data); // ← has id, created_at, unit, target_value
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const W = doc.internal.pageSize.getWidth();
      doc.setFillColor(34, 197, 94);
      doc.rect(0, 0, W, 28, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(5, 46, 22);
      doc.text("HealthyHabits — Wellness Report", 14, 18);
      doc.setFontSize(9);
      doc.text(
        `Generated: ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}`,
        W - 14,
        18,
        { align: "right" },
      );
      let y = 40;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(30, 30, 30);
      doc.text("Wellness Score", 14, y);
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`Score: ${wellness?.score ?? 0} / 100`, 14, y);
      y += 12;
      if (weekly) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(30, 30, 30);
        doc.text("Weekly Summary", 14, y);
        y += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text(`Total Logs: ${weekly.totalLogs}`, 14, y);
        y += 6;
        doc.text(`Completed: ${weekly.completedLogs}`, 14, y);
        y += 6;
        doc.text(`Rate: ${weekly.completionRate}%`, 14, y);
        y += 12;
      }
      habits.forEach((h) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(30, 30, 30);
        doc.text(h.name, 14, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(
          `${h.completionRate}% · Target: ${h.target_value || 1} ${h.unit || "times"}`,
          14,
          y + 5,
        );
        doc.setFillColor(220, 220, 220);
        doc.rect(14, y + 9, 120, 3, "F");
        doc.setFillColor(34, 197, 94);
        doc.rect(14, y + 9, (h.completionRate / 100) * 120, 3, "F");
        y += 20;
      });
      doc.save(`wellness-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF downloaded! 📄");
    } catch {
      toast.error("PDF export failed");
    } finally {
      setExporting(false);
    }
  };

  if (loading)
    return (

      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
        <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  const gridColor = isDark ? "#1a3328" : "#e5e7eb";
  const axisTickColor = isDark ? "#3d7060" : "#9ca3af";

  //   const barData = habits.map((h) => {
  //     const completedCount = Math.round(
  //       ((h.completionRate || 0) / 100) * (h.totalLogs || 0),
  //     );
  //     const remaining = Math.max((h.target_value || 1) - completedCount, 0);
  //     return {
  //       name: h.name.length > 10 ? h.name.slice(0, 10) + "…" : h.name,
  //       Completed: completedCount,
  //       Remaining: remaining,
  //     };
  //   });

  const barData = habits.map((h) => {
    const todayValue = Number(h.today_value) || 0;
    const target = Number(h.target_value) || 1;
    const remaining = Math.max(target - todayValue, 0);

    return {
      name: h.name.length > 10 ? h.name.slice(0, 10) + "…" : h.name,
      Completed: todayValue, // ← actual value logged today
      Remaining: remaining, // ← how much still needed today
    };
  });

  return (
    <PageWrapper>
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1
              className="font-syne font-extrabold text-3xl sm:text-4xl"
              style={{ color: "var(--text)" }}
            >
              Analytics
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Your health & wellness insights
            </p>
          </div>
          <Button
            onClick={exportPDF}
            loading={exporting}
            variant="ghost"
            className="gap-2 self-start sm:self-auto"
          >
            <FileDown size={15} /> Export PDF
          </Button>
        </motion.div>

        {/* Wellness + Weekly */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <motion.div
            className="card p-7 flex flex-col items-center text-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <p
              className="text-xs font-bold tracking-wide uppercase"
              style={{ color: "var(--text-faint)" }}
            >
              Wellness Score
            </p>
            <WellnessRing score={wellness?.score ?? 0} />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Based on last 7 days
            </p>
          </motion.div>

          <motion.div
            className="card p-6 sm:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p
              className="text-xs font-bold tracking-wide uppercase mb-5"
              style={{ color: "var(--text-faint)" }}
            >
              Weekly Summary
            </p>
            {weekly && (
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      label: "Total Logs",
                      value: weekly.totalLogs,
                      icon: <Activity size={16} />,
                      color: "#3b82f6",
                    },
                    {
                      label: "Completed",
                      value: weekly.completedLogs,
                      icon: <TrendingUp size={16} />,
                      color: "#22c55e",
                    },
                    {
                      label: "Rate",
                      value: `${weekly.completionRate}%`,
                      icon: <Calendar size={16} />,
                      color: "#a855f7",
                    },
                  ].map(({ label, value, icon, color }) => (
                    <div
                      key={label}
                      className="p-3 rounded-xl text-center"
                      style={{
                        background: `${color}12`,
                        border: `1px solid ${color}25`,
                      }}
                    >
                      <div
                        className="flex justify-center mb-1"
                        style={{ color }}
                      >
                        {icon}
                      </div>
                      <p
                        className="font-syne font-bold text-lg"
                        style={{ color: "var(--text)" }}
                      >
                        {value}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-faint)" }}
                      >
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
                <div>
                  <div
                    className="flex justify-between text-xs mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <span>Completion Rate</span>
                    <span className="font-semibold">
                      {weekly.completionRate}%
                    </span>
                  </div>
                  <div
                    className="h-2.5 rounded-full overflow-hidden"
                    style={{ background: isDark ? "#0f1f1a" : "#e5e7eb" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "#22c55e" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${weekly.completionRate}%` }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Bar Chart */}
        {barData.length > 0 && (
          <motion.div
            className="card p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="mb-5">
              <p
                className="text-xs font-bold tracking-wide uppercase"
                style={{ color: "var(--text-faint)" }}
              >
                Completed vs Remaining per Habit
              </p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ background: "#22c55e" }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Completed
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ background: isDark ? "#1a3328" : "#d1d5db" }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Remaining
                  </span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={barData}
                barSize={20}
                barGap={4}
                margin={{ top: 4, right: 8, left: -20, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={gridColor}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: axisTickColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: axisTickColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    fill: isDark ? "rgba(34,197,94,0.05)" : "rgba(0,0,0,0.04)",
                    radius: 4,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Bar dataKey="Completed" radius={[5, 5, 0, 0]}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill="#22c55e" />
                  ))}
                </Bar>
                <Bar dataKey="Remaining" radius={[5, 5, 0, 0]}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={isDark ? "#1a3328" : "#d1d5db"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Habit Breakdown */}
        {habits.length > 0 && (
          <motion.div
            className="card p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p
              className="text-xs font-bold tracking-wide uppercase mb-5"
              style={{ color: "var(--text-faint)" }}
            >
              Habit Breakdown
            </p>
            <div className="flex flex-col gap-5">
              {habits.map((habit, i) => {
                const cfg =
                  CATEGORY_CONFIG[habit.category] ||
                  CATEGORY_CONFIG.productivity;
                return (
                  <motion.div
                    key={habit.habitId}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.22 + i * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{cfg.icon}</span>
                        <span
                          className="font-semibold text-sm"
                          style={{ color: "var(--text)" }}
                        >
                          {habit.name}
                        </span>
                        <span
                          className="badge"
                          style={{
                            background: cfg.bg,
                            color: cfg.color,
                            border: `1px solid ${cfg.border}`,
                          }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-3 text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <span>{habit.totalLogs} logs</span>
                        <span
                          className="font-syne font-bold"
                          style={{ color: cfg.color }}
                        >
                          {habit.completionRate}%
                        </span>
                      </div>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: isDark ? "#0f1f1a" : "#e5e7eb" }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: cfg.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${habit.completionRate}%` }}
                        transition={{ duration: 0.9, delay: 0.3 + i * 0.06 }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-faint)" }}
                      >
                        Target: {habit.target_value || 1}{" "}
                        {habit.unit || "times"} / day
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-faint)" }}
                      >
                        {habit.totalLogs} total logs
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Calendar — pass rawHabits not analytics habits */}
        <CalendarView rawHabits={rawHabits} />
      </div>
    </div>
    </PageWrapper>
  );
};

export default Analytics;
