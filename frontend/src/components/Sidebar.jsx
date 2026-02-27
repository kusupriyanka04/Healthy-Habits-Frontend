import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BarChart3, Trophy, Sun, Moon,
  LogOut, Flame, Settings, Menu, X, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const navItems = [
  { to: '/dashboard',  label: 'Habits',     Icon: LayoutDashboard, color: '#22c55e' },
  { to: '/analytics',  label: 'Analytics',  Icon: BarChart3,        color: '#3b82f6' },
  { to: '/challenges', label: 'Challenges', Icon: Trophy,           color: '#f59e0b' },
  { to: '/settings',   label: 'Settings',   Icon: Settings,         color: '#a855f7' },
];

const Sidebar = () => {
  const { user, logout }        = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate                = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = ({ onNavClick }) => (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="px-5 py-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center shrink-0"
            style={{ boxShadow: '0 0 20px rgba(34,197,94,0.35)' }}>
            <Flame size={20} className="text-brand-950" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-syne font-extrabold text-base leading-none"
              style={{ color: 'var(--text)' }}>
              HealthyHabits
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
              Track. Grow. Thrive.
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 mb-4" style={{ height: '1px', background: 'var(--border)' }} />

      {/* Nav Items */}
      <nav className="flex flex-col gap-1 px-3 flex-1">
        <p className="px-3 pb-2 text-xs font-bold tracking-widest uppercase"
          style={{ color: 'var(--text-faint)' }}>
          Menu
        </p>
        {navItems.map(({ to, label, Icon, color }) => (
          <NavLink key={to} to={to} onClick={onNavClick}>
            {({ isActive }) => (
              <motion.div
                className="relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer group"
                style={{
                  background: isActive ? `${color}12` : 'transparent',
                  border:     `1px solid ${isActive ? `${color}25` : 'transparent'}`,
                }}
                whileHover={{
                  background: isActive ? `${color}15` : 'var(--bg-muted)',
                  border:     `1px solid ${isActive ? `${color}30` : 'var(--border)'}`,
                }}
                whileTap={{ scale: 0.98 }}>

                {/* Active left bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-full"
                    style={{ background: color }}
                    transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
                  />
                )}

                {/* Icon */}
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: isActive ? `${color}20` : 'var(--bg-muted)',
                    border:     `1px solid ${isActive ? `${color}30` : 'var(--border)'}`,
                  }}>
                  <Icon size={16}
                    style={{ color: isActive ? color : 'var(--text-faint)' }}
                    strokeWidth={isActive ? 2.5 : 2} />
                </div>

                {/* Label */}
                <span className="font-syne font-semibold text-sm flex-1"
                  style={{ color: isActive ? color : 'var(--text-muted)' }}>
                  {label}
                </span>

                {/* Arrow */}
                {isActive && (
                  <ChevronRight size={14} style={{ color }} />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 pb-5 mt-4 shrink-0">

        {/* Divider */}
        <div className="mx-2 mb-4" style={{ height: '1px', background: 'var(--border)' }} />

        {/* User Profile */}
        <NavLink to="/settings" onClick={onNavClick}>
          <motion.div
            className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2 cursor-pointer"
            style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}
            whileHover={{ border: '1px solid rgba(34,197,94,0.25)' }}
            whileTap={{ scale: 0.98 }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-syne font-extrabold text-sm shrink-0"
              style={{ background: 'rgba(34,197,94,0.15)', border: '1.5px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-syne font-bold text-sm truncate" style={{ color: 'var(--text)' }}>
                {user?.name}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>
                {user?.email}
              </p>
            </div>
          </motion.div>
        </NavLink>

        {/* Theme + Logout */}
        <div className="flex gap-2">
          <motion.button onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold"
            style={{
              background: 'var(--bg-muted)',
              border:     '1px solid var(--border)',
              color:      'var(--text-muted)',
            }}
            whileHover={{ color: 'var(--text)' }}
            whileTap={{ scale: 0.95 }}>
            <motion.div key={isDark ? 'dark' : 'light'}
              initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.25 }}>
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </motion.div>
            {isDark ? 'Light' : 'Dark'}
          </motion.button>

          <motion.button onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold"
            style={{
              background: 'rgba(239,68,68,0.06)',
              border:     '1px solid rgba(239,68,68,0.15)',
              color:      '#ef4444',
            }}
            whileHover={{ background: 'rgba(239,68,68,0.12)' }}
            whileTap={{ scale: 0.95 }}>
            <LogOut size={15} />
            Logout
          </motion.button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── Desktop Sidebar ─────────────────────────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col z-40"
        style={{
          background:   'var(--bg-card)',
          borderRight:  '1px solid var(--border)',
          boxShadow:    '4px 0 24px rgba(0,0,0,0.15)',
        }}>
        <SidebarContent onNavClick={() => {}} />
      </aside>

      {/* ─── Mobile Top Bar ───────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 z-40 flex items-center justify-between px-4"
        style={{
          background:  'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          boxShadow:   'var(--shadow)',
        }}>
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
            <Flame size={16} className="text-brand-950" strokeWidth={2.5} />
          </div>
          <span className="font-syne font-bold text-base" style={{ color: 'var(--text)' }}>
            HealthyHabits
          </span>
        </div>

        {/* Hamburger */}
        <motion.button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          whileTap={{ scale: 0.92 }}>
          <Menu size={18} />
        </motion.button>
      </div>

      {/* ─── Mobile Drawer ────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="lg:hidden fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="lg:hidden fixed left-0 top-0 h-full w-72 z-50 flex flex-col"
              style={{
                background:  'var(--bg-card)',
                borderRight: '1px solid var(--border)',
                boxShadow:   '8px 0 32px rgba(0,0,0,0.3)',
              }}
              initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}>

              {/* Close button */}
              <motion.button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center z-10"
                style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                whileTap={{ scale: 0.92 }}>
                <X size={15} />
              </motion.button>

              <SidebarContent onNavClick={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;