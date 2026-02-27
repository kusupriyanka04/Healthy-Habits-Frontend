import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Users,
  Plus,
  Crown,
  ChevronRight,
  Clock,
  Copy,
  Check,
  Link2,
  Flame,
  Target,
  Hash,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios.jsx";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";
import PageWrapper from "../components/pageWrapper.jsx";
import { CATEGORY_CONFIG } from "../lib/utils.jsx";

const medalEmoji = ["🥇", "🥈", "🥉"];
const medalColors = ["#f59e0b", "#94a3b8", "#d97706"];

const CATEGORIES = Object.keys(CATEGORY_CONFIG);
const UNITS = ["times", "mins", "glasses", "pages", "steps", "sets", "km"];

// ─── Invite Code Box ──────────────────────────────────────
const InviteCodeBox = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Invite code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="flex items-center gap-2 p-2.5 rounded-xl mt-2"
      style={{
        background: "rgba(34,197,94,0.06)",
        border: "1px solid rgba(34,197,94,0.15)",
      }}
    >
      <Hash size={13} color="#22c55e" />
      <span
        className="font-syne font-bold text-sm tracking-widest flex-1"
        style={{ color: "#22c55e" }}
      >
        {code}
      </span>
      <motion.button
        onClick={handleCopy}
        className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ background: "rgba(34,197,94,0.1)" }}
        whileTap={{ scale: 0.9 }}
      >
        {copied ? (
          <Check size={13} color="#22c55e" />
        ) : (
          <Copy size={13} color="#22c55e" />
        )}
      </motion.button>
    </div>
  );
};

// ─── Main Challenges Page ─────────────────────────────────
const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lbLoading, setLbLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoinCode, setShowJoinCode] = useState(false);
  const [joiningId, setJoiningId] = useState(null);
  const [inviteCode, setInviteCode] = useState("");
  const [joiningCode, setJoiningCode] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // all | mine

  const [form, setForm] = useState({
    name: "",
    description: "",
    duration_days: 30,
    target_value: 1,
    unit: "times",
    category: "fitness",
  });

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/challenges");
      setChallenges(data);
    } catch {
      toast.error("Failed to load challenges");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (id) => {
    setSelected(id);
    setLbLoading(true);
    try {
      const { data } = await api.get(`/challenges/${id}/leaderboard`);
      setLeaderboard(data);
    } catch {
      toast.error("Failed to load leaderboard");
    } finally {
      setLbLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await api.post("/challenges", form);
      setChallenges((p) => [data, ...p]);
      setShowCreate(false);
      setForm({
        name: "",
        description: "",
        duration_days: 30,
        target_value: 1,
        unit: "times",
        category: "fitness",
      });
      toast.success("Challenge created! 🏆");
      // Auto-show leaderboard for new challenge
      fetchLeaderboard(data.id);
    } catch (err) {
      toast.error(err.response?.data?.error || "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (id) => {
    setJoiningId(id);
    try {
      await api.post(`/challenges/${id}/join`);
      toast.success("Joined challenge! 🎉");
      fetchLeaderboard(id);
      fetchChallenges();
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not join");
    } finally {
      setJoiningId(null);
    }
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    setJoiningCode(true);
    try {
      const { data } = await api.post("/challenges/join-by-code", {
        inviteCode,
      });
      toast.success(`Joined "${data.challenge.name}"! 🎉`);
      setShowJoinCode(false);
      setInviteCode("");
      fetchChallenges();
      fetchLeaderboard(data.challenge.id);
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid invite code");
    } finally {
      setJoiningCode(false);
    }
  };

  const selectedChallenge = challenges.find((c) => c.id === selected);

  return (
    <PageWrapper>
      <div
        className="min-h-screen pt-16 pb-24 sm:pb-10"
        style={{ background: "var(--bg)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* ─── Header ───────────────────────────────── */}
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <h1
                className="font-syne font-extrabold text-3xl sm:text-4xl"
                style={{ color: "var(--text)", letterSpacing: "-0.03em" }}
              >
                Challenges
              </h1>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                Compete, collaborate, and grow together
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                variant="ghost"
                onClick={() => setShowJoinCode(true)}
                className="gap-2 text-sm"
              >
                <Link2 size={14} /> Join by Code
              </Button>
              <Button
                onClick={() => setShowCreate(true)}
                className="gap-2 text-sm"
              >
                <Plus size={15} /> New Challenge
              </Button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* ─── Challenges List ───────────────────── */}
            <div className="lg:col-span-2">
              <p
                className="text-xs font-bold tracking-widest uppercase mb-4"
                style={{
                  color: "var(--text-faint)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {activeTab === "all" ? "My Challenges" : "Joined Challenges"}
              </p>

              {loading ? (
                <div className="flex flex-col gap-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="card p-5 h-36 animate-pulse">
                      <div
                        className="h-5 rounded-lg w-3/4 mb-3"
                        style={{ background: "var(--bg-muted)" }}
                      />
                      <div
                        className="h-3 rounded-lg w-1/2 mb-4"
                        style={{ background: "var(--bg-muted)" }}
                      />
                      <div
                        className="h-8 rounded-xl"
                        style={{ background: "var(--bg-muted)" }}
                      />
                    </div>
                  ))}
                </div>
              ) : challenges.length === 0 ? (
                <div className="card p-10 text-center">
                  <Trophy
                    size={40}
                    className="mx-auto mb-3"
                    style={{ color: "var(--text-faint)" }}
                  />
                  <p
                    className="font-syne font-bold mb-1"
                    style={{ color: "var(--text)" }}
                  >
                    No challenges yet
                  </p>
                  <p
                    className="text-sm mb-4"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Create one or join with an invite code!
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => setShowCreate(true)}
                      className="gap-2"
                      size="sm"
                    >
                      <Plus size={13} /> Create
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setShowJoinCode(true)}
                      className="gap-2"
                      size="sm"
                    >
                      <Link2 size={13} /> Join
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {challenges.map((c, i) => {
                    const cfg =
                      CATEGORY_CONFIG[c.category] || CATEGORY_CONFIG.fitness;
                    return (
                      <motion.div
                        key={c.id}
                        className="card p-5 cursor-pointer"
                        style={
                          selected === c.id
                            ? {
                                borderColor: "rgba(34,197,94,0.35)",
                                background: "rgba(34,197,94,0.03)",
                              }
                            : {}
                        }
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        whileHover={{ y: -1 }}
                        onClick={() => fetchLeaderboard(c.id)}
                      >
                        {/* Top row */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base"
                              style={{
                                background: cfg.bg,
                                border: `1px solid ${cfg.border}`,
                              }}
                            >
                              {cfg.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3
                                  className="font-syne font-bold text-sm truncate"
                                  style={{ color: "var(--text)" }}
                                >
                                  {c.name}
                                </h3>
                                {/* ← Owner badge */}
                                {c.is_owner && (
                                  <span
                                    className="badge shrink-0"
                                    style={{
                                      background: "rgba(168,85,247,0.1)",
                                      color: "#a855f7",
                                      border: "1px solid rgba(168,85,247,0.2)",
                                      fontSize: "9px",
                                    }}
                                  >
                                    yours
                                  </span>
                                )}
                              </div>
                              {c.description && (
                                <p
                                  className="text-xs truncate mt-0.5"
                                  style={{ color: "var(--text-faint)" }}
                                >
                                  {c.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <ChevronRight
                            size={15}
                            style={{
                              color: "var(--text-faint)",
                              flexShrink: 0,
                            }}
                          />
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <span
                            className="flex items-center gap-1 text-xs"
                            style={{ color: "var(--text-faint)" }}
                          >
                            <Clock size={11} /> {c.duration_days}d
                          </span>
                          <span
                            className="flex items-center gap-1 text-xs"
                            style={{ color: "var(--text-faint)" }}
                          >
                            <Users size={11} /> {c.participant_count || 0}
                          </span>
                          <span
                            className="flex items-center gap-1 text-xs"
                            style={{ color: "var(--text-faint)" }}
                          >
                            <Target size={11} /> {c.target_value} {c.unit}/day
                          </span>
                          <span
                            className="badge"
                            style={
                              c.is_active
                                ? {
                                    background: "rgba(34,197,94,0.1)",
                                    color: "#22c55e",
                                    border: "1px solid rgba(34,197,94,0.2)",
                                  }
                                : {
                                    background: "var(--bg-muted)",
                                    color: "var(--text-faint)",
                                    border: "1px solid var(--border)",
                                  }
                            }
                          >
                            {c.is_active ? "Active" : "Ended"}
                          </span>
                        </div>

                        {/* Invite code — only show to owner */}
                        {c.is_owner && c.invite_code && (
                          <InviteCodeBox code={c.invite_code} />
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 gap-1.5 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchLeaderboard(c.id);
                            }}
                          >
                            <Trophy size={12} /> Leaderboard
                          </Button>
                          {/* ← Only show Join if not owner */}
                          {!c.is_owner && (
                            <Button
                              size="sm"
                              loading={joiningId === c.id}
                              className="text-xs px-4"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoin(c.id);
                              }}
                            >
                              Join
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* ─── Leaderboard ──────────────────────── */}
            <div className="lg:col-span-3">
              <p
                className="text-xs font-bold tracking-widest uppercase mb-4"
                style={{
                  color: "var(--text-faint)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {selectedChallenge
                  ? `Leaderboard — ${selectedChallenge.name}`
                  : "Leaderboard"}
              </p>

              <div className="card p-6 min-h-[320px] flex flex-col">
                {/* Selected challenge info */}
                {selectedChallenge && (
                  <div
                    className="flex items-center gap-3 mb-4 pb-4"
                    style={{ borderBottom: "1px solid var(--border-muted)" }}
                  >
                    <div className="flex items-center gap-2 flex-1 flex-wrap">
                      <span
                        className="flex items-center gap-1.5 text-xs font-semibold"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <Clock size={12} />
                        {selectedChallenge.duration_days} days
                      </span>
                      <span
                        className="flex items-center gap-1.5 text-xs font-semibold"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <Target size={12} />
                        {selectedChallenge.target_value}{" "}
                        {selectedChallenge.unit}/day
                      </span>
                      <span
                        className="flex items-center gap-1.5 text-xs font-semibold"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <Users size={12} />
                        {selectedChallenge.participant_count} participants
                      </span>
                      <span
                        className="flex items-center gap-1.5 text-xs font-semibold"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <Flame size={12} />
                        {CATEGORY_CONFIG[selectedChallenge.category]?.label ||
                          selectedChallenge.category}
                      </span>
                    </div>
                  </div>
                )}

                {!selected ? (
                  <div
                    className="flex-1 flex flex-col items-center justify-center gap-3"
                    style={{ color: "var(--text-faint)" }}
                  >
                    <Crown size={44} />
                    <div className="text-center">
                      <p
                        className="text-sm font-syne font-bold"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Select a challenge
                      </p>
                      <p className="text-xs mt-1">to view rankings</p>
                    </div>
                  </div>
                ) : lbLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div
                    className="flex-1 flex flex-col items-center justify-center gap-2"
                    style={{ color: "var(--text-faint)" }}
                  >
                    <Users size={36} />
                    <p className="text-sm font-syne font-bold">
                      No participants yet
                    </p>
                    <p className="text-xs">Be the first to join!</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    <div className="flex flex-col gap-3">
                      {leaderboard.map((entry, i) => (
                        <motion.div
                          key={entry.userId}
                          className="flex items-center gap-3 p-4 rounded-xl"
                          style={
                            i === 0
                              ? {
                                  background: "rgba(245,158,11,0.06)",
                                  border: "1px solid rgba(245,158,11,0.18)",
                                }
                              : {
                                  background: "var(--bg-muted)",
                                  border: "1px solid var(--border-muted)",
                                }
                          }
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07 }}
                        >
                          {/* Rank */}
                          <div className="w-8 text-center shrink-0">
                            {i < 3 ? (
                              <span className="text-xl">{medalEmoji[i]}</span>
                            ) : (
                              <span
                                className="font-syne font-bold text-sm"
                                style={{ color: "var(--text-faint)" }}
                              >
                                #{i + 1}
                              </span>
                            )}
                          </div>

                          {/* Avatar */}
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-syne font-bold text-sm shrink-0"
                            style={{
                              background:
                                i < 3
                                  ? `${medalColors[i]}18`
                                  : "var(--bg-card)",
                              border: `1.5px solid ${i < 3 ? `${medalColors[i]}40` : "var(--border)"}`,
                              color:
                                i < 3 ? medalColors[i] : "var(--text-muted)",
                            }}
                          >
                            {entry.name?.[0]?.toUpperCase() || "U"}
                          </div>

                          {/* Name + progress */}
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-syne font-bold text-sm truncate"
                              style={{ color: "var(--text)" }}
                            >
                              {entry.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div
                                className="flex-1 h-1.5 rounded-full overflow-hidden"
                                style={{
                                  background: "var(--border)",
                                  maxWidth: "100px",
                                }}
                              >
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{
                                    background:
                                      i < 3 ? medalColors[i] : "#22c55e",
                                  }}
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${Math.min(entry.completionRate, 100)}%`,
                                  }}
                                  transition={{
                                    duration: 0.8,
                                    delay: i * 0.07 + 0.2,
                                  }}
                                />
                              </div>
                              <span
                                className="text-xs tabular-nums"
                                style={{ color: "var(--text-faint)" }}
                              >
                                {entry.completionRate}%
                              </span>
                            </div>
                            <p
                              className="text-xs mt-0.5"
                              style={{ color: "var(--text-faint)" }}
                            >
                              {entry.completedDays} days completed
                            </p>
                          </div>

                          {/* Score */}
                          <div className="text-right shrink-0">
                            <p
                              className="font-syne font-extrabold text-xl tabular-nums"
                              style={{
                                color: i < 3 ? medalColors[i] : "var(--text)",
                              }}
                            >
                              {entry.score}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: "var(--text-faint)" }}
                            >
                              pts
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Create Challenge Modal ──────────────── */}
        <Modal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          title="Create Challenge"
        >
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div>
              <label className="label">Challenge Name</label>
              <input
                className="input-base"
                placeholder="e.g. 30 Day Fitness Challenge"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Description (optional)</label>
              <input
                className="input-base"
                placeholder="e.g. Let's get fit together!"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
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
                      onClick={() => setForm({ ...form, category: cat })}
                      className="flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs font-semibold"
                      style={{
                        background: active ? c.bg : "var(--bg-muted)",
                        border: `1.5px solid ${active ? c.border : "var(--border)"}`,
                        color: active ? c.color : "var(--text-muted)",
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-base">{c.icon}</span>
                      <span className="leading-tight text-center">
                        {c.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Target + Unit + Duration */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Target/day</label>
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
              <div>
                <label className="label">Unit</label>
                <select
                  className="input-base"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Days</label>
                <input
                  type="number"
                  className="input-base"
                  min={1}
                  max={365}
                  value={form.duration_days}
                  onChange={(e) =>
                    setForm({ ...form, duration_days: Number(e.target.value) })
                  }
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setShowCreate(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={creating}
                className="flex-1 gap-1.5"
              >
                <Trophy size={14} /> Create
              </Button>
            </div>
          </form>
        </Modal>

        {/* ─── Join by Code Modal ───────────────────── */}
        <Modal
          open={showJoinCode}
          onClose={() => setShowJoinCode(false)}
          title="Join by Invite Code"
        >
          <form onSubmit={handleJoinByCode} className="flex flex-col gap-4">
            <div>
              <label className="label">Invite Code</label>
              <input
                className="input-base text-center font-syne font-bold text-lg tracking-widest uppercase"
                placeholder="e.g. AB12CD34"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={8}
                required
              />
              <p
                className="text-xs mt-2"
                style={{ color: "var(--text-faint)" }}
              >
                Ask your friend to share their challenge invite code
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setShowJoinCode(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={joiningCode}
                className="flex-1 gap-1.5"
              >
                <Link2 size={14} /> Join Challenge
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PageWrapper>
  );
};

export default Challenges;
