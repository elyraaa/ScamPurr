import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Globe, ChevronRight, TrendingUp } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { HistoryTable } from '../components/HistoryTable';
import { CatTreeScene, SleepingCat } from '../components/pixel';
import { useAuth } from '../context/useAuth';
import { api } from '../lib/axios';
import type { HistoryItem } from '../types';

const QUICK_ACTIONS = [
  {
    id: 'analyze-listing',
    to: '/analyze/listing',
    icon: Search,
    title: 'Analyze Listing',
    description: 'Paste adoption listing text to detect scam signals',
  },
  {
    id: 'analyze-url',
    to: '/analyze/url',
    icon: Globe,
    title: 'Check Shelter URL',
    description: 'Verify a shelter or listing website for trust signals',
  },
];

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    api.get<HistoryItem[]>('/analyses/history?limit=5')
      .then(res => setHistory(res.data))
      .catch(console.error)
      .finally(() => setLoadingHistory(false));
  }, []);

  const totalAnalyses = history.length;
  const criticalCount = history.filter(h => h.risk_label === 'CRITICAL' || h.risk_label === 'HIGH').length;

  return (
    <div className="page-shell">
      <Navbar />

      <div className="page-content relative z-10">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold text-white mb-1.5">
            Welcome back{user?.display_name ? `, ${user.display_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-slate-400">
            Protect your next feline family member from adoption scams.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-10"
        >
          <CatTreeScene />
        </motion.div>

        {/* Stats */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10"
          >
            <div className="glass-card rounded-2xl p-5">
              <div className="text-3xl font-black text-white mb-0.5">{totalAnalyses}</div>
              <div className="text-sm text-slate-500">Total Analyses</div>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <div className="text-3xl font-black text-red-400 mb-0.5">{criticalCount}</div>
              <div className="text-sm text-slate-500">High/Critical Found</div>
            </div>
            <div className="glass-card rounded-2xl p-5 col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-0.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-3xl font-black text-emerald-400">
                  {totalAnalyses - criticalCount}
                </span>
              </div>
              <div className="text-sm text-slate-500">Safe Listings Found</div>
            </div>
          </motion.div>
        )}

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-10"
        >
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                id={action.id}
                onClick={() => navigate(action.to)}
                className="glass-card rounded-2xl p-6 text-left hover:border-violet-500/30 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl border-[3px] border-[#7e2f51] bg-[#ffd6e8] flex items-center justify-center shadow-[3px_3px_0_rgba(126,47,81,0.18)] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform duration-200">
                    <action.icon className="w-6 h-6 text-[#d4537e]" />
                  </div>
                </div>
                <div className="font-semibold text-white text-lg mb-1.5">{action.title}</div>
                <div className="text-sm text-slate-400 leading-relaxed mb-4">{action.description}</div>
                <div className="flex items-center gap-1.5 text-violet-400 text-sm font-medium">
                  Start analysis
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Recent History */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Recent Analyses
            </h2>
            {history.length > 0 && (
              <button
                onClick={() => navigate('/history')}
                className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                View all -&gt;
              </button>
            )}
          </div>
          <HistoryTable items={history} loading={loadingHistory} />

          {!loadingHistory && history.length === 0 && (
            <div className="mt-4 p-6 rounded-2xl border-[3px] border-dashed border-[#f4a0c0] text-center text-slate-500 bg-[#fff9fc]">
              <SleepingCat />
              <p className="text-sm">Run your first analysis to see results here.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
