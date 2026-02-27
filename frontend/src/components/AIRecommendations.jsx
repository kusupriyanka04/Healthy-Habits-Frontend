import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, RefreshCw, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios.jsx';
import { CATEGORY_CONFIG } from '../lib/utils.jsx';

const PRIORITY_STYLE = {
  high:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  label: '🔥 High Priority' },
  medium: { color: '#eab308', bg: 'rgba(234,179,8,0.1)',  label: '⚡ Recommended'   },
  low:    { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  label: '✨ Nice to Have'  },
};

const AIRecommendations = ({ onAddHabit }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [loaded,          setLoaded]          = useState(false);
  const [addingId,        setAddingId]        = useState(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/recommendations');
      setRecommendations(res.data.recommendations || []);
      setLoaded(true);
    } catch {
      toast.error('Failed to get AI recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHabit = async (rec) => {
    setAddingId(rec.title);
    try {
      await api.post('/habits', {
        name:         rec.title,
        category:     rec.category,
        goal:         rec.suggestion,
        frequency:    'daily',
        target_value: rec.target_value || 1,
        unit:         rec.unit         || 'times',
      });
      toast.success(`✅ "${rec.title}" added!`);
      onAddHabit?.();
      setRecommendations(r => r.filter(x => x.title !== rec.title));
    } catch {
      toast.error('Failed to add habit');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <motion.div className="card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)' }}>
            <Sparkles size={18} color="#a855f7" />
          </div>
          <div>
            <h2 className="font-syne font-bold text-base"
              style={{ color: 'var(--text)' }}>
              AI Recommendations
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
              Powered by Groq · Llama 3.3
            </p>
          </div>
        </div>

        {loaded && (
          <motion.button
            onClick={fetchRecommendations}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold font-syne"
            style={{
              background: 'rgba(168,85,247,0.1)',
              border:     '1px solid rgba(168,85,247,0.25)',
              color:      '#a855f7',
              opacity:    loading ? 0.6 : 1,
            }}
            whileTap={{ scale: 0.95 }}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </motion.button>
        )}
      </div>

      {/* Initial state — not loaded yet */}
      {!loaded && !loading && (
        <div className="text-center py-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)' }}>
            <Sparkles size={28} color="#a855f7" />
          </div>
          <p className="font-syne font-bold text-sm mb-1"
            style={{ color: 'var(--text)' }}>
            Get AI-Powered Suggestions
          </p>
          <p className="text-xs mb-5 max-w-xs mx-auto"
            style={{ color: 'var(--text-faint)' }}>
            Groq AI analyses your habit patterns and recommends what to add to balance your wellness
          </p>
          <motion.button
            onClick={fetchRecommendations}
            className="px-6 py-2.5 rounded-xl text-sm font-bold font-syne"
            style={{
              background: 'rgba(168,85,247,0.12)',
              border:     '1px solid rgba(168,85,247,0.3)',
              color:      '#a855f7',
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}>
            ✨ Analyse My Habits
          </motion.button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center py-10 gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles size={16} color="#a855f7" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-syne font-bold"
              style={{ color: 'var(--text)' }}>
              Analysing your habits...
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
              Llama 3.3 is reviewing your patterns
            </p>
          </div>
        </div>
      )}

      {/* Recommendations list */}
      <AnimatePresence>
        {!loading && recommendations.length > 0 && (
          <div className="flex flex-col gap-3">
            {recommendations.map((rec, i) => {
              const cfg      = CATEGORY_CONFIG[rec.category] || CATEGORY_CONFIG.productivity;
              const priority = PRIORITY_STYLE[rec.priority]  || PRIORITY_STYLE.medium;
              const isAdding = addingId === rec.title;

              return (
                <motion.div key={rec.title}
                  className="p-4 rounded-xl"
                  style={{
                    background: 'var(--bg-muted)',
                    border:     '1px solid var(--border)',
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.08 }}>

                  {/* Habit name + priority */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                        {cfg.icon}
                      </div>
                      <div>
                        <p className="font-syne font-bold text-sm"
                          style={{ color: 'var(--text)' }}>
                          {rec.title}
                        </p>
                        <span className="text-xs" style={{ color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg text-xs font-bold shrink-0"
                      style={{ background: priority.bg, color: priority.color }}>
                      {priority.label}
                    </div>
                  </div>

                  {/* AI Insight */}
                  <div className="flex items-start gap-2 p-2.5 rounded-lg mb-3"
                    style={{
                      background: 'rgba(168,85,247,0.06)',
                      border:     '1px solid rgba(168,85,247,0.12)',
                    }}>
                    <TrendingUp size={13} color="#a855f7" className="mt-0.5 shrink-0" />
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {rec.insight}
                    </p>
                  </div>

                  {/* Suggestion */}
                  <p className="text-xs mb-3" style={{ color: 'var(--text-faint)' }}>
                    💡 {rec.suggestion}
                  </p>

                  {/* Target + Add button */}
                  <div className="flex items-center justify-between pt-2 border-t"
                    style={{ borderColor: 'var(--border-muted)' }}>
                    <span className="text-xs font-semibold"
                      style={{ color: 'var(--text-muted)' }}>
                      Target: {rec.target_value} {rec.unit} / day
                    </span>
                    <motion.button
                      onClick={() => handleAddHabit(rec)}
                      disabled={isAdding}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-syne"
                      style={{
                        background: '#22c55e',
                        color:      '#fff',
                        opacity:    isAdding ? 0.7 : 1,
                      }}
                      whileTap={{ scale: 0.95 }}>
                      {isAdding
                        ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        : <Plus size={13} />
                      }
                      {isAdding ? 'Adding...' : 'Add Habit'}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* All recommendations added */}
      {loaded && !loading && recommendations.length === 0 && (
        <div className="text-center py-8">
          <p className="text-3xl mb-3">🎯</p>
          <p className="font-syne font-bold text-sm"
            style={{ color: 'var(--text)' }}>
            All suggestions added!
          </p>
          <p className="text-xs mt-1 mb-4"
            style={{ color: 'var(--text-faint)' }}>
            Keep tracking and click Refresh for new recommendations
          </p>
          <motion.button
            onClick={fetchRecommendations}
            className="px-4 py-2 rounded-xl text-xs font-bold font-syne"
            style={{
              background: 'rgba(168,85,247,0.1)',
              border:     '1px solid rgba(168,85,247,0.25)',
              color:      '#a855f7',
            }}
            whileTap={{ scale: 0.95 }}>
            <RefreshCw size={12} className="inline mr-1.5" />
            Get New Suggestions
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default React.memo(AIRecommendations);