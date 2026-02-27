import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { CATEGORY_CONFIG, UNIT_CONFIG } from "../lib/utils";
import api from "../api/axios";
import ReminderPicker from "./ReminderPicker";

const CATEGORIES = Object.keys(CATEGORY_CONFIG);
const FREQUENCIES = ["daily", "weekly"];
const WEEK_DAYS = [
  { key: "S", label: "Sun", full: "Sunday" },
  { key: "M", label: "Mon", full: "Monday" },
  { key: "T", label: "Tue", full: "Tuesday" },
  { key: "W", label: "Wed", full: "Wednesday" },
  { key: "T2", label: "Thu", full: "Thursday" },
  { key: "F", label: "Fri", full: "Friday" },
  { key: "S2", label: "Sat", full: "Saturday" },
];

const EditHabitModal = ({ open, onClose, habit, onUpdated }) => {
  const [form, setForm] = useState({
    name: "",
    category: "fitness",
    goal: "",
    frequency: "daily",
    unit: "mins",
    target_value: 1,
    selected_days: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (habit) {
      setForm({
        name: habit.name || "",
        category: habit.category || "fitness",
        goal: habit.goal || "",
        frequency: habit.frequency || "daily",
        unit: habit.unit || UNIT_CONFIG[habit.category]?.default || "times",
        target_value: habit.target_value || 1,
        selected_days: habit.selected_days || [],
        reminder_enabled: habit.reminder_enabled || false,
        reminder_time: habit.reminder_time
           ? habit.reminder_time.slice(0, 5)
           : "08:00"
      });
    }
  }, [habit]);

  const toggleDay = (dayKey) => {
    setForm((f) => ({
      ...f,
      selected_days: f.selected_days.includes(dayKey)
        ? f.selected_days.filter((d) => d !== dayKey)
        : [...f.selected_days, dayKey],
      
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.frequency === "weekly" && form.selected_days.length === 0) {
      toast.error("Please select at least one day");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.put(`/habits/${habit.id}`, form);
      onUpdated(data);
      toast.success("Habit updated! ✅");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const units = UNIT_CONFIG[form.category]?.units || ["times"];

  return (
    <Modal open={open} onClose={onClose} title="Edit Habit">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name */}
        <div>
          <label className="label">Habit Name</label>
          <input
            className="input-base"
            placeholder="e.g. Morning Run"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="label">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => {
              const c = CATEGORY_CONFIG[cat];
              const active = form.category === cat;
              return (
                <motion.button
                  key={cat}
                  type="button"
                  onClick={() => {
                    const defaultUnit = UNIT_CONFIG[cat]?.default || "times";
                    setForm({ ...form, category: cat, unit: defaultUnit });
                  }}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs font-semibold"
                  style={{
                    background: active ? c.bg : "var(--bg-muted)",
                    border: `1.5px solid ${active ? c.border : "var(--border)"}`,
                    color: active ? c.color : "var(--text-muted)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-base">{c.icon}</span>
                  <span className="text-center leading-tight">{c.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Unit + Target */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Unit</label>
            <select
              className="input-base"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            >
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Daily Target</label>
            <input
              type="number"
              className="input-base"
              min={1}
              value={form.target_value}
              onChange={(e) =>
                setForm({ ...form, target_value: Number(e.target.value) })
              }
              required
            />
          </div>
        </div>

        {/* Goal */}
        <div>
          <label className="label">Goal Description</label>
          <input
            className="input-base"
            placeholder="e.g. Drink 8 glasses every day"
            value={form.goal}
            onChange={(e) => setForm({ ...form, goal: e.target.value })}
            required
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="label">Frequency</label>
          <div className="flex gap-2">
            {FREQUENCIES.map((f) => (
              <motion.button
                key={f}
                type="button"
                onClick={() =>
                  setForm({ ...form, frequency: f, selected_days: [] })
                }
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize"
                style={{
                  background:
                    form.frequency === f ? "#22c55e" : "var(--bg-muted)",
                  color: form.frequency === f ? "#052e16" : "var(--text-muted)",
                  border: `1.5px solid ${form.frequency === f ? "#22c55e" : "var(--border)"}`,
                }}
                whileTap={{ scale: 0.96 }}
              >
                {f}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Day Selector — only when weekly */}
        <AnimatePresence>
          {form.frequency === "weekly" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <label className="label mb-2">Select Days</label>
              <div className="flex gap-1.5 justify-between">
                {WEEK_DAYS.map((day) => {
                  const selected = form.selected_days.includes(day.key);
                  return (
                    <motion.button
                      key={day.key}
                      type="button"
                      onClick={() => toggleDay(day.key)}
                      className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl"
                      style={{
                        background: selected
                          ? "rgba(34,197,94,0.12)"
                          : "var(--bg-muted)",
                        border: `1.5px solid ${selected ? "rgba(34,197,94,0.4)" : "var(--border)"}`,
                        color: selected ? "#22c55e" : "var(--text-faint)",
                      }}
                      whileTap={{ scale: 0.93 }}
                      title={day.full}
                    >
                      <span className="text-xs font-extrabold font-syne">
                        {day.label[0]}
                      </span>
                      <span style={{ fontSize: "9px" }}>
                        {day.label.slice(1)}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
              {form.selected_days.length === 0 && (
                <p className="text-xs mt-1.5" style={{ color: "#ef4444" }}>
                  ⚠️ Select at least one day
                </p>
              )}
              {form.selected_days.length > 0 && (
                <p
                  className="text-xs mt-1.5"
                  style={{ color: "var(--text-faint)" }}
                >
                  {form.selected_days.length} day
                  {form.selected_days.length > 1 ? "s" : ""} selected
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-2">
          <label
            className="text-xs font-bold tracking-wide uppercase"
            style={{ color: "var(--text-faint)" }}
          >
            Reminder
          </label>
          <ReminderPicker
            reminderEnabled={form.reminder_enabled}
            reminderTime={form.reminder_time}
            onChange={({ reminder_enabled, reminder_time }) =>
              setForm((f) => ({ ...f, reminder_enabled, reminder_time }))
            }
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-1 pb-1">
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1 gap-1.5">
            <Save size={15} /> Update Habit
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditHabitModal;
