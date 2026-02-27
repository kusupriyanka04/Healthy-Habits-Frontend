import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff } from 'lucide-react';

const ReminderPicker = ({ reminderEnabled, reminderTime, onChange }) => {

  const handleToggle = () => {
    onChange({
      reminder_enabled: !reminderEnabled,
      reminder_time:    reminderTime || '08:00',
    });
  };

  const handleTimeChange = (e) => {
    onChange({
      reminder_enabled: reminderEnabled,
      reminder_time:    e.target.value,
    });
  };

  // Quick time presets
  const presets = [
    { label: 'Morning',   time: '07:00' },
    { label: 'Noon',      time: '12:00' },
    { label: 'Evening',   time: '18:00' },
    { label: 'Night',     time: '21:00' },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Toggle */}
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all"
        style={{
          background: reminderEnabled ? 'rgba(34,197,94,0.08)' : 'var(--bg-muted)',
          border:     `1px solid ${reminderEnabled ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
        }}>
        <div className="flex items-center gap-2.5">
          {reminderEnabled
            ? <Bell size={16} color="#22c55e" />
            : <BellOff size={16} style={{ color: 'var(--text-faint)' }} />
          }
          <span className="text-sm font-semibold"
            style={{ color: reminderEnabled ? '#22c55e' : 'var(--text-muted)' }}>
            {reminderEnabled ? 'Reminder On' : 'Set Reminder'}
          </span>
        </div>
        {/* Toggle pill */}
        <div className="w-10 h-5 rounded-full relative transition-all"
          style={{ background: reminderEnabled ? '#22c55e' : 'var(--border)' }}>
          <motion.div
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
            animate={{ left: reminderEnabled ? '22px' : '2px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
        </div>
      </button>

      {/* Time picker — shown when enabled */}
      <AnimatePresence>
        {reminderEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}>

            <div className="flex flex-col gap-3 pt-1">
              {/* Time input */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold w-20 shrink-0"
                  style={{ color: 'var(--text-muted)' }}>
                  Time
                </label>
                <input
                  type="time"
                  value={reminderTime || '08:00'}
                  onChange={handleTimeChange}
                  className="flex-1 px-3 py-2 rounded-xl text-sm font-syne font-bold"
                  style={{
                    background:  'var(--bg-muted)',
                    border:      '1px solid var(--border)',
                    color:       'var(--text)',
                    colorScheme: 'dark',
                  }}
                />
              </div>

              {/* Quick presets */}
              <div className="flex gap-2">
                {presets.map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => onChange({ reminder_enabled: true, reminder_time: p.time })}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold font-syne transition-all"
                    style={{
                      background: reminderTime === p.time
                        ? 'rgba(34,197,94,0.15)'
                        : 'var(--bg-muted)',
                      border: `1px solid ${reminderTime === p.time
                        ? 'rgba(34,197,94,0.4)'
                        : 'var(--border)'}`,
                      color: reminderTime === p.time ? '#22c55e' : 'var(--text-faint)',
                    }}>
                    {p.label}
                    <span className="block text-xs font-normal opacity-70">{p.time}</span>
                  </button>
                ))}
              </div>

              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                🔔 You'll get a browser notification at this time if the habit isn't completed
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReminderPicker;