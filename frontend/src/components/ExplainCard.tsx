import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import type { Explanation } from '../types';


const CATEGORY_LABELS: Record<string, string> = {
  payment: 'Payment',
  language: 'Language',
  verification: 'Verification',
  price: 'Pricing',
  domain: 'Domain',
  ssl: 'Security',
  reputation: 'Reputation',
};

const CATEGORY_COLORS: Record<string, string> = {
  payment: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  language: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  verification: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  price: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  domain: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  ssl: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  reputation: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

interface ExplainCardProps {
  explanation: Explanation;
  index: number;
}

export function ExplainCard({ explanation, index }: ExplainCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isRedFlag = explanation.is_red_flag;
  const categoryLabel = CATEGORY_LABELS[explanation.category] || explanation.category;
  const categoryColor = CATEGORY_COLORS[explanation.category] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={cn(
        'rounded-xl border p-4 cursor-pointer transition-all duration-200',
        isRedFlag
          ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10'
          : 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/10'
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5',
          isRedFlag ? 'bg-red-500/20' : 'bg-emerald-500/20'
        )}>
          {isRedFlag
            ? <AlertTriangle className="w-4 h-4 text-red-400" />
            : <CheckCircle className="w-4 h-4 text-emerald-400" />
          }
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              'font-semibold text-sm',
              isRedFlag ? 'text-red-300' : 'text-emerald-300'
            )}>
              {explanation.factor}
            </span>
            <span className={cn('text-xs px-2 py-0.5 rounded-full border', categoryColor)}>
              {categoryLabel}
            </span>
          </div>

          {/* Weight bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  isRedFlag ? 'bg-red-400' : 'bg-emerald-400'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${explanation.weight * 100}%` }}
                transition={{ duration: 0.8, delay: index * 0.06 + 0.3 }}
              />
            </div>
            <span className="text-xs text-slate-500 tabular-nums w-10 text-right">
              {(explanation.weight * 100).toFixed(0)}%
            </span>
          </div>

          {/* Expandable description */}
          {expanded && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 text-sm text-slate-400 leading-relaxed"
            >
              {explanation.description}
            </motion.p>
          )}
        </div>

        {/* Expand toggle */}
        <button
          className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
    </motion.div>
  );
}
