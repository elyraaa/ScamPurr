import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';
import { cn, getRiskBg, getRiskEmoji, formatDate, truncate } from '../lib/utils';
import type { HistoryItem } from '../types';


interface HistoryTableProps {
  items: HistoryItem[];
  loading?: boolean;
}

const TYPE_LABELS = {
  listing: '📄 Listing',
  url: '🔗 URL',
  combined: '🔍 Combined',
};

export function HistoryTable({ items, loading = false }: HistoryTableProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-base font-medium">No analyses yet</p>
        <p className="text-sm mt-1 opacity-70">Run your first scam check to see results here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <motion.div
          key={item.analysis_id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="flex items-center gap-4 p-4 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/15 cursor-pointer transition-all duration-200 group"
          onClick={() => navigate(`/result/${item.analysis_id}`)}
        >
          {/* Risk emoji */}
          <div className="text-2xl flex-shrink-0 w-10 text-center">
            {getRiskEmoji(item.risk_label)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-slate-500 font-medium">
                {TYPE_LABELS[item.type] || item.type}
              </span>
              <span className="text-slate-700">·</span>
              <span className="text-xs text-slate-500">{formatDate(item.created_at)}</span>
            </div>
            <p className="text-sm text-slate-300 truncate">
              {item.input_url
                ? item.input_url
                : item.input_text
                ? truncate(item.input_text, 80)
                : '—'}
            </p>
          </div>

          {/* Score badge */}
          <div className={cn('flex-shrink-0 px-3 py-1.5 rounded-lg border text-sm font-bold tabular-nums', getRiskBg(item.risk_label))}>
            {Math.round(item.combined_score)}
            <span className="text-xs font-normal opacity-70 ml-0.5">/100</span>
          </div>

          {/* Arrow */}
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
        </motion.div>
      ))}
    </div>
  );
}
