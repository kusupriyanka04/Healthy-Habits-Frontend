import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle,
  Sun,
  Moon,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import Button from "../components/ui/Button.jsx";
import api from "../api/axios.jsx";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const GoogleButton = ({ text }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/google");
      window.location.href = data.url;
    } catch (err) {
      toast.error("Google login failed");
      setLoading(false);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm transition-all"
      style={{
        background: "var(--bg-muted)",
        border: "1.5px solid var(--border)",
        color: "var(--text)",
        opacity: loading ? 0.7 : 1,
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      {loading ? "Redirecting..." : text}
    </motion.button>
  );
};

const Divider = () => (
  <div className="flex items-center gap-3 my-1">
    <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
    <span
      className="text-xs font-semibold"
      style={{ color: "var(--text-faint)" }}
    >
      or
    </span>
    <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
  </div>
);
const LoginForm = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back! 👋");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <GoogleButton text="Continue with Google" />
      <Divider />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="label">Email Address</label>
          <div className="relative">
            <Mail
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-faint)" }}
            />
            <input
              type="email"
              className="input-base pl-10"
              placeholder="Enter Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-faint)" }}
            />
            <input
              type="password"
              className="input-base pl-10"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full mt-1 py-3 text-base justify-between"
        >
          <span>Sign In</span>
          <ArrowRight size={16} />
        </Button>
      </form>
    </div>
  );
};

const RegisterForm = ({ onSwitchTab }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <motion.div
        className="flex flex-col items-center text-center py-4 gap-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.3 }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.2)",
          }}
        >
          <CheckCircle size={32} style={{ color: "#22c55e" }} />
        </div>
        <div>
          <h3
            className="font-syne font-bold text-xl mb-1.5"
            style={{ color: "var(--text)" }}
          >
            Account Created! 🎉
          </h3>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Welcome{" "}
            <strong style={{ color: "var(--text)" }}>{form.name}</strong>! Sign
            in to get started.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSwitchTab("login")}
          className="btn-primary w-full mt-2"
        >
          Go to Sign In
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <GoogleButton text="Continue with Google" />
      <Divider />

    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="label">Full Name</label>
        <div className="relative">
          <User
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-faint)" }}
          />
          <input
            type="text"
            className="input-base pl-10"
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <label className="label">Email Address</label>
        <div className="relative">
          <Mail
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-faint)" }}
          />
          <input
            type="email"
            className="input-base pl-10"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div>
        <label className="label">Password</label>
        <div className="relative">
          <Lock
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-faint)" }}
          />
          <input
            type="password"
            className="input-base pl-10"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            autoComplete="new-password"
          />
        </div>
      </div>

      <Button
        type="submit"
        loading={loading}
        className="w-full mt-1 py-3 text-base justify-between"
      >
        <span>Create Account</span>
        <ArrowRight size={16} />
      </Button>
    </form>
    </div>
  );
};

const AuthPage = () => {
  const [tab, setTab] = useState("login");
  const { isDark, toggleTheme } = useTheme();

  const tabs = [
    { key: "login", label: "Sign In" },
    { key: "register", label: "Register" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)",
        }}
      />

      <motion.button
        onClick={toggleTheme}
        className="absolute top-5 right-5 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          color: "var(--text-muted)",
        }}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
      >
        <motion.div
          key={isDark ? "dark" : "light"}
          initial={{ rotate: -30, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </motion.div>
      </motion.button>

      <motion.div
        className="w-full max-w-[420px]"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex w-16 h-16 bg-brand-500 rounded-2xl items-center justify-center mb-4 shadow-glow-green"
            whileHover={{
              rotate: [0, -8, 8, 0],
              transition: { duration: 0.4 },
            }}
          >
            <Flame size={28} className="text-brand-950" strokeWidth={2.5} />
          </motion.div>
          <h1
            className="font-syne font-extrabold text-3xl mb-1"
            style={{ color: "var(--text)" }}
          >
            HealthyHabits
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Track. Grow. Thrive.
          </p>
        </div>

        <div className="card p-7">
          <div
            className="flex p-1 rounded-xl mb-6"
            style={{
              background: "var(--bg-muted)",
              border: "1px solid var(--border)",
            }}
          >
            {tabs.map(({ key, label }) => (
              <motion.button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className="relative flex-1 py-2.5 rounded-lg text-sm font-semibold font-syne transition-colors duration-150"
                style={{
                  color: tab === key ? "var(--text)" : "var(--text-faint)",
                }}
                whileTap={{ scale: 0.97 }}
              >
                {tab === key && (
                  <motion.div
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                    }}
                    transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </motion.button>
            ))}
          </div>

          <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
            {tab === "login"
              ? "Welcome back! Sign in to continue your journey."
              : "Create your free account and start building better habits."}
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: tab === "login" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: tab === "login" ? 20 : -20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {tab === "login" ? (
                <LoginForm />
              ) : (
                <RegisterForm onSwitchTab={setTab} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <p
          className="text-center text-sm mt-5"
          style={{ color: "var(--text-faint)" }}
        >
          {tab === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setTab("register")}
                className="font-semibold"
                style={{ color: "#22c55e" }}
              >
                Create one free
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setTab("login")}
                className="font-semibold"
                style={{ color: "#22c55e" }}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
