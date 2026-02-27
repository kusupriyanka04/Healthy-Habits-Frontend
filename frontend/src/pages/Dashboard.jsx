import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Zap, Flame, CheckSquare, FileDown, TrendingUp, Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.jsx";
import HabitCard from "../components/HabitCard.jsx";
import CreateHabitModal from "../components/CreateHabitModal.jsx";
import Button from "../components/ui/Button.jsx";
import EditHabitModal from "../components/EditHabitModal.jsx";
import { useHabitReminders } from "../hooks/useHabitReminders.js";
import AIRecommendations from "../components/AIRecommendations.jsx";
import PageWrapper from "../components/pageWrapper.jsx";

// ─── Stat Card ────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    className="card p-5 flex items-center gap-4"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
      style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
      <Icon size={20} style={{ color }} strokeWidth={2} />
    </div>
    <div>
      <p className="font-syne font-extrabold text-2xl tabular-nums"
        style={{ color: "var(--text)", letterSpacing: "-0.02em" }}>
        {value}
      </p>
      <p className="text-xs font-medium mt-0.5"
        style={{ color: "var(--text-faint)", fontFamily: "var(--font-body)" }}>
        {label}
      </p>
    </div>
  </motion.div>
);

// ─── Wellness Card ────────────────────────────────────────
const WellnessCard = ({ score }) => {
  if (score === null || score === undefined) return null;

  const color  = score >= 70 ? "#22c55e" : score >= 40 ? "#eab308" : "#ef4444";
  const label  = score >= 70 ? "Excellent" : score >= 40 ? "Good" : "Needs Work";
  const emoji  = score >= 70 ? "🌟" : score >= 40 ? "💪" : "🌱";
  const radius = 26;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;

  return (
    <motion.div
      className="card p-5 flex items-center gap-5"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}>

      {/* Ring */}
      <div className="relative shrink-0">
        <svg width="66" height="66" className="-rotate-90">
          <circle cx="33" cy="33" r={radius}
            fill="none" stroke="var(--bg-muted)" strokeWidth="6" />
          <motion.circle cx="33" cy="33" r={radius}
            fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circ} strokeLinecap="round"
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-syne font-extrabold text-sm tabular-nums"
            style={{ color }}>
            {score}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={12} style={{ color }} />
          <p className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "var(--text-faint)", fontFamily: "var(--font-display)" }}>
            Wellness Score
          </p>
        </div>
        <div className="flex items-baseline gap-1.5">
          <p className="font-syne font-extrabold text-3xl"
            style={{ color: "var(--text)", letterSpacing: "-0.03em" }}>
            {score}
          </p>
          <span className="text-sm" style={{ color: "var(--text-faint)" }}>/100</span>
          <span className="text-lg ml-1">{emoji}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span
            className="badge"
            style={{
              background: `${color}12`,
              color,
              border: `1px solid ${color}25`,
            }}>
            {label}
          </span>
          <span className="text-xs" style={{ color: "var(--text-faint)" }}>
            Based on today
          </span>
        </div>
      </div>

      {/* Progress bar — desktop only */}
      <div className="hidden sm:flex flex-col gap-1 w-28 shrink-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs" style={{ color: "var(--text-faint)" }}>Today</span>
          <span className="text-xs font-bold font-syne tabular-nums"
            style={{ color }}>
            {score}%
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden"
          style={{ background: "var(--bg-muted)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} />
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const [habits,    setHabits]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showCreate,setShowCreate]= useState(false);
  const [editHabit, setEditHabit] = useState(null);
  const [loggingId, setLoggingId] = useState(null);
  const [filter,    setFilter]    = useState("all");
  const [exporting, setExporting] = useState(false);
  const [wellness,  setWellness]  = useState(null);

  useHabitReminders(habits);

  useEffect(() => { fetchHabits();  }, []);
  useEffect(() => { fetchWellness();}, []);

  const fetchWellness = async () => {
    try {
      const res = await api.get("/analytics/wellness");
      setWellness(res.data);
    } catch {
      // silently fail — not critical
    }
  };

  const fetchHabits = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/habits");
      setHabits(data);
    } catch {
      toast.error("Failed to load habits");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLog = async (habitId) => {
    setLoggingId(habitId);
    try {
      const { data } = await api.post(`/habits/${habitId}/log`);

      setHabits((prev) =>
        prev.map((h) => {
          if (h.id !== habitId) return h;
          return {
            ...h,
            streak:      data.streak      ?? h.streak,
            today_value: data.today_value ?? h.today_value,
            today_done:  data.completed   ?? h.today_done,
          };
        })
      );

      const streak = data.streak || 1;
      if (streak >= 7)       toast.success(`🏆 ${streak} day streak! Incredible!`);
      else if (streak >= 3)  toast.success(`🔥 ${streak} day streak! Keep it up!`);
      else if (data.completed)
        toast.success(`✅ ${data.today_value}/${data.target_value} — Target reached!`);
      else
        toast.success(`+1 logged! (${data.today_value}/${data.target_value})`);

      fetchWellness();
      return data;
    } catch (err) {
      toast.error(err.response?.data?.error || "Log failed");
      throw err;
    } finally {
      setLoggingId(null);
    }
  };

  const handleDelete = async (habitId) => {
    if (!confirm("Delete this habit permanently?")) return;
    try {
      await api.delete(`/habits/${habitId}`);
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
      toast.success("Habit deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleUpdated = (updatedHabit) => {
    setHabits((prev) =>
      prev.map((h) => h.id === updatedHabit.id ? { ...h, ...updatedHabit } : h)
    );
  };

  const exportPDF = async () => {
    if (habits.length === 0) { toast.error("No habits to export"); return; }
    setExporting(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W   = doc.internal.pageSize.getWidth();

      doc.setFillColor(34, 197, 94);
      doc.rect(0, 0, W, 28, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(5, 46, 22);
      doc.text("HealthyHabits — My Habits Report", 14, 18);
      doc.setFontSize(9);
      doc.text(
        `Generated: ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}`,
        W - 14, 18, { align: "right" }
      );

      let y = 38;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.text("Summary", 14, y); y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Total Habits: ${habits.length}`, 14, y); y += 6;
      doc.text(`Active Streaks: ${habits.filter(h => (h.streak || 0) > 0).length}`, 14, y); y += 6;
      doc.text(`Combined Streak: ${habits.reduce((a, h) => a + (h.streak || 0), 0)} days`, 14, y); y += 12;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.text("All Habits", 14, y); y += 8;

      habits.forEach((h, i) => {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFillColor(34, 197, 94);
        doc.circle(18, y + 1, 3.5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text(String(i + 1), 18, y + 2, { align: "center" });
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(20, 20, 20);
        doc.text(h.name, 26, y + 2); y += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Category: ${h.category}`, 26, y);
        doc.text(`Target: ${h.target_value || 1} ${h.unit || "times"}`, 80, y);
        doc.text(`Streak: ${h.streak || 0} days`, 130, y); y += 6;
        doc.setTextColor(120, 120, 120);
        doc.text(`Goal: ${h.goal || "—"}`, 26, y); y += 4;
        doc.setFillColor(230, 230, 230);
        doc.rect(26, y, 100, 2.5, "F");
        if (h.streak > 0) {
          doc.setFillColor(34, 197, 94);
          doc.rect(26, y, Math.min((h.streak / 30) * 100, 100), 2.5, "F");
        }
        y += 10;
        doc.setDrawColor(220, 220, 220);
        doc.line(14, y, W - 14, y); y += 6;
      });

      doc.save(`habits-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF downloaded! 📄");
    } catch {
      toast.error("PDF export failed");
    } finally {
      setExporting(false);
    }
  };

  const categories  = ["all", ...new Set(habits.map((h) => h.category))];
  const filtered    = filter === "all" ? habits : habits.filter((h) => h.category === filter);
  const totalStreak = habits.reduce((acc, h) => acc + (h.streak || 0), 0);
  // ← correct streak count — only habits with streak > 0
  const activeStreaks = habits.filter((h) => (h.streak || 0) > 0).length;

  return (
    <PageWrapper>
      <div className="min-h-screen pt-16 pb-24 sm:pb-10"
        style={{ background: "var(--bg)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          {/* ─── Header ─────────────────────────────────── */}
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}>
            <div>
              <h1 className="font-syne font-extrabold text-3xl sm:text-4xl"
                style={{ color: "var(--text)", letterSpacing: "-0.03em" }}>
                Hey, {user?.name?.split(" ")[0]} 👋
              </h1>
              <p className="mt-1 text-sm"
                style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button variant="ghost" onClick={exportPDF} loading={exporting} className="gap-2 text-sm">
                <FileDown size={15} /> Export PDF
              </Button>
              <Button onClick={() => setShowCreate(true)} className="gap-2 text-sm">
                <Plus size={15} /> New Habit
              </Button>
            </div>
          </motion.div>

          {/* ─── Wellness Score ──────────────────────────── */}
          <div className="mb-6">
            <WellnessCard score={wellness?.score} />
          </div>

          {/* ─── Stats ──────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard icon={Zap}         label="Total Habits"    value={habits.length} color="#22c55e" delay={0.05} />
            <StatCard icon={Flame}       label="Combined Streak" value={totalStreak}   color="#f97316" delay={0.10} />
            <StatCard icon={CheckSquare} label="Active Streaks"  value={activeStreaks} color="#3b82f6" delay={0.15} />
          </div>

          {/* ─── Category Filters ───────────────────────── */}
          {habits.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-6">
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all"
                  style={{
                    background: filter === cat ? "rgba(34,197,94,0.12)" : "var(--bg-muted)",
                    border:     `1px solid ${filter === cat ? "rgba(34,197,94,0.25)" : "var(--border)"}`,
                    color:      filter === cat ? "#22c55e" : "var(--text-muted)",
                    fontFamily: "var(--font-display)",
                  }}
                  whileTap={{ scale: 0.95 }}>
                  {cat.replace("_", " ")}
                </motion.button>
              ))}
            </div>
          )}

          {/* ─── Habits Grid ────────────────────────────── */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-5 h-44 animate-pulse">
                  <div className="flex gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl"
                      style={{ background: "var(--bg-muted)" }} />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 rounded-lg w-3/4"
                        style={{ background: "var(--bg-muted)" }} />
                      <div className="h-3 rounded-lg w-1/2"
                        style={{ background: "var(--bg-muted)" }} />
                    </div>
                  </div>
                  <div className="h-12 rounded-xl"
                    style={{ background: "var(--bg-muted)" }} />
                </div>
              ))}
            </div>
          ) : habits.length === 0 ? (
            <motion.div
              className="card p-14 text-center mb-8"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}>
              <div className="text-5xl mb-4">🌱</div>
              <h3 className="font-syne font-bold text-xl mb-2"
                style={{ color: "var(--text)" }}>
                No habits yet
              </h3>
              <p className="text-sm mb-6"
                style={{ color: "var(--text-muted)" }}>
                Create your first habit to begin building a healthier routine
              </p>
              {/* ← Fixed: was setShowModal, now setShowCreate */}
              <Button onClick={() => setShowCreate(true)} className="gap-2 mx-auto">
                <Plus size={15} /> Create First Habit
              </Button>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
                layout>
                {filtered.map((habit, i) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onLog={handleLog}
                    onDelete={handleDelete}
                    onEdit={(h) => setEditHabit(h)}
                    isLogging={loggingId === habit.id}
                    index={i}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* ─── AI Recommendations ─────────────────────── */}
          <div className="mt-2 mb-8">
            <AIRecommendations onAddHabit={fetchHabits} />
          </div>

        </div>

        <CreateHabitModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onCreated={(h) => setHabits((prev) => [h, ...prev])}
        />

        <EditHabitModal
          open={!!editHabit}
          onClose={() => setEditHabit(null)}
          habit={editHabit}
          onUpdated={handleUpdated}
        />
      </div>
    </PageWrapper>
  );
};

export default Dashboard;