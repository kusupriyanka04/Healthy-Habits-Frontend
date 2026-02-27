import { useEffect, useRef } from 'react';

// Reminder messages per category
const REMINDER_MESSAGES = {
  hydration:   (name) => `💧 Time to ${name}! Stay hydrated.`,
  fitness:     (name) => `🏃 Don't forget your ${name} session!`,
  nutrition:   (name) => `🥗 Time for ${name}. Eat healthy!`,
  mindfulness: (name) => `🧘 Take a moment for ${name}.`,
  sleep:       (name) => `😴 Time to wind down for ${name}.`,
  reading:     (name) => `📚 Time to read! Don't skip ${name}.`,
  productivity:(name) => `⚡ Stay on track — time for ${name}!`,
  social:      (name) => `👥 Don't forget ${name} today!`,
  default:     (name) => `🔔 Reminder: Time for ${name}!`,
};

const getMessage = (habit) => {
  const fn = REMINDER_MESSAGES[habit.category] || REMINDER_MESSAGES.default;
  return fn(habit.name);
};

const requestPermission = async () => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
};

const showNotification = (habit) => {
  if (Notification.permission !== 'granted') return;

  const notification = new Notification('HealthyHabits Reminder 🌿', {
    body:    getMessage(habit),
    icon:    '/favicon.ico',
    badge:   '/favicon.ico',
    tag:     `habit-${habit.id}`,        // prevents duplicate notifications
    requireInteraction: false,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  // Auto close after 8 seconds
  setTimeout(() => notification.close(), 8000);
};

export const useHabitReminders = (habits = []) => {
  const intervalRef   = useRef(null);
  const firedTodayRef = useRef(new Set()); // track which habits fired today

  useEffect(() => {
    // Request permission on mount
    requestPermission();

    // Reset fired set at midnight
    const resetAtMidnight = () => {
      const now     = new Date();
      const msUntilMidnight =
        new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
      setTimeout(() => {
        firedTodayRef.current = new Set();
        resetAtMidnight();
      }, msUntilMidnight);
    };
    resetAtMidnight();

    // Check every 60 seconds
    intervalRef.current = setInterval(() => {
      if (Notification.permission !== 'granted') return;

      const now        = new Date();
      const currentHH  = String(now.getHours()).padStart(2, '0');
      const currentMM  = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHH}:${currentMM}`;

      habits.forEach(habit => {
        if (!habit.reminder_enabled) return;
        if (!habit.reminder_time)    return;

        // reminder_time from DB looks like "08:30:00" — trim to "08:30"
        const reminderHHMM = habit.reminder_time.slice(0, 5);

        if (reminderHHMM !== currentTime) return;
        if (firedTodayRef.current.has(habit.id)) return; // already fired today

        // Don't remind if already completed today
        if (habit.today_done) return;

        firedTodayRef.current.add(habit.id);
        showNotification(habit);
      });
    }, 60000); // every 60 seconds

    return () => clearInterval(intervalRef.current);
  }, [habits]);

  return { requestPermission };
};