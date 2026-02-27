import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Save, LogOut, Shield, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import PageWrapper from "../components/pageWrapper.jsx";

const Settings = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]         = useState({ name: user?.name || '', email: user?.email || '' });
  const [saving, setSaving]     = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name cannot be empty'); return; }
    if (!form.email.trim()) { toast.error('Email cannot be empty'); return; }

    setSaving(true);
    try {
      await updateProfile(form.name.trim(), form.email.trim());
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/login');
  };

  const hasChanges = form.name !== user?.name || form.email !== user?.email;

  return (
    <PageWrapper>
    <div className="min-h-screen pt-16" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <motion.div className="mb-8"
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-syne font-extrabold text-3xl sm:text-4xl" style={{ color: 'var(--text)' }}>
            Settings
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Manage your account and preferences
          </p>
        </motion.div>

        {/* Avatar Card */}
        <motion.div className="card p-6 mb-5 flex items-center gap-5"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-syne font-extrabold text-3xl shrink-0"
            style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="font-syne font-bold text-xl" style={{ color: 'var(--text)' }}>
              {user?.name}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {user?.email}
            </p>
            <span className="badge mt-2"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
              ✅ Active Account
            </span>
          </div>
        </motion.div>

        {/* Edit Profile */}
        <motion.div className="card p-6 mb-5"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.1)' }}>
              <User size={16} style={{ color: '#22c55e' }} />
            </div>
            <h3 className="font-syne font-bold text-base" style={{ color: 'var(--text)' }}>
              Edit Profile
            </h3>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-4">
            {/* Name */}
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-faint)' }} />
                <input type="text" className="input-base pl-10"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-faint)' }} />
                <input type="email" className="input-base pl-10"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required />
              </div>
              {form.email !== user?.email && (
                <p className="text-xs mt-1.5" style={{ color: '#eab308' }}>
                  ⚠️ Changing email will require re-login
                </p>
              )}
            </div>

            <Button
              type="submit"
              loading={saving}
              disabled={!hasChanges}
              className="gap-2 self-start"
              style={{ opacity: hasChanges ? 1 : 0.5 }}>
              <Save size={15} /> Save Changes
            </Button>
          </form>
        </motion.div>

        {/* Security Info */}
        <motion.div className="card p-6 mb-5"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(59,130,246,0.1)' }}>
              <Shield size={16} style={{ color: '#3b82f6' }} />
            </div>
            <h3 className="font-syne font-bold text-base" style={{ color: 'var(--text)' }}>
              Security
            </h3>
          </div>
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            To change your password, sign out and use the forgot password option on the login page.
          </p>
          <div className="flex items-center gap-2 p-3 rounded-xl"
            style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <Shield size={14} style={{ color: '#3b82f6' }} />
            <p className="text-xs font-semibold" style={{ color: '#3b82f6' }}>
              Your account is secured with Supabase Auth
            </p>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div className="card p-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.1)' }}>
              <Trash2 size={16} style={{ color: '#ef4444' }} />
            </div>
            <h3 className="font-syne font-bold text-base" style={{ color: '#ef4444' }}>
              Danger Zone
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl"
            style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)' }}>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Sign Out</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Sign out of your account on this device
              </p>
            </div>
            <motion.button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold font-syne shrink-0"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border:     '1.5px solid rgba(239,68,68,0.25)',
                color:      '#ef4444',
              }}
              whileHover={{ background: 'rgba(239,68,68,0.18)' }}
              whileTap={{ scale: 0.97 }}>
              <LogOut size={15} />
              {loggingOut ? 'Signing out...' : 'Sign Out'}
            </motion.button>
          </div>
        </motion.div>

      </div>
    </div>
    </PageWrapper>
  );
};

export default Settings;