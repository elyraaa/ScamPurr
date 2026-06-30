import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, AlertTriangle, CheckCircle, FileText, Globe } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { RiskMeter } from '../components/RiskMeter';
import { ExplainCard } from '../components/ExplainCard';
import { ChasingCatLoader, RiskCat, SleepingCat } from '../components/pixel';
import { api } from '../lib/axios';
import { cn, getRiskBg, formatDate } from '../lib/utils';
import type { FullAnalysisResponse } from '../types';

export function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<FullAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const guestResult = sessionStorage.getItem(`scampurr_guest_result_${id}`);
    if (guestResult) {
      Promise.resolve().then(() => {
        setData(JSON.parse(guestResult));
        setLoading(false);
      });
      return;
    }

    api.get<FullAnalysisResponse>(`/analyses/${id}`)
      .then(res => setData(res.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <Navbar />
        <ChasingCatLoader label="loading analysis result..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-shell">
        <Navbar />
        <div className="page-content flex items-center justify-center">
          <div className="pixel-card max-w-xl p-8 text-center">
            <SleepingCat />
            <p className="text-red-400 text-lg font-semibold">Failed to load result</p>
            <p className="text-slate-500 text-sm mt-1 mb-6">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary px-6 py-2.5 rounded-xl text-white text-sm font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { risk_score, type, input_text, input_url, created_at } = data;
  const redFlags = risk_score.explanations.filter(e => e.is_red_flag);
  const trustSignals = risk_score.explanations.filter(e => !e.is_red_flag);

  const TYPE_LABEL: Record<string, string> = {
    listing: 'Listing Analysis',
    url: 'URL Analysis',
    combined: 'Combined Analysis',
  };

  return (
    <div className="page-shell">
      <Navbar />

      <div className="page-content max-w-4xl mx-auto relative z-10">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {TYPE_LABEL[type]}
            </span>
            <span className="text-slate-700">/</span>
            <span className="text-xs text-slate-500">{formatDate(created_at)}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Risk Analysis Report</h1>
          {input_url && (
            <a
              href={input_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 mt-1 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {input_url}
            </a>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Risk Meter */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="glass-card rounded-2xl p-8 flex flex-col items-center sticky top-24">
              <RiskMeter
                score={risk_score.combined_score}
                label={risk_score.risk_label}
                size="lg"
              />

              {/* Sub-scores */}
              <div className="w-full mt-8 space-y-3">
                {risk_score.listing_score !== null && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <FileText className="w-3.5 h-3.5" />
                      Listing Score
                    </span>
                    <span className={cn('font-semibold px-2 py-0.5 rounded-md border text-xs',
                      getRiskBg(risk_score.listing_score < 30 ? 'LOW' : risk_score.listing_score < 60 ? 'MEDIUM' : risk_score.listing_score < 80 ? 'HIGH' : 'CRITICAL')
                    )}>
                      {Math.round(risk_score.listing_score)}
                    </span>
                  </div>
                )}
                {risk_score.url_score !== null && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Globe className="w-3.5 h-3.5" />
                      URL Score
                    </span>
                    <span className={cn('font-semibold px-2 py-0.5 rounded-md border text-xs',
                      getRiskBg(risk_score.url_score < 30 ? 'LOW' : risk_score.url_score < 60 ? 'MEDIUM' : risk_score.url_score < 80 ? 'HIGH' : 'CRITICAL')
                    )}>
                      {Math.round(risk_score.url_score)}
                    </span>
                  </div>
                )}
              </div>

              {/* Summary stat */}
              <div className="mt-6 w-full p-4 rounded-xl bg-white/4 border border-white/8 text-center">
                <div className="text-2xl font-black text-red-400">{redFlags.length}</div>
                <div className="text-xs text-slate-500 mt-0.5">Red Flags Detected</div>
              </div>
            </div>
          </motion.div>

          {/* Right: Explanations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Input preview */}
            {input_text && (
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Analyzed Text</h3>
                <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">{input_text}</p>
              </div>
            )}

            {/* Red Flags */}
            {redFlags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    Red Flags ({redFlags.length})
                  </h2>
                </div>
                <div className="space-y-2">
                  {redFlags.map((exp, i) => (
                    <ExplainCard key={exp.id} explanation={exp} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Trust Signals */}
            {trustSignals.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    Trust Signals ({trustSignals.length})
                  </h2>
                </div>
                <div className="space-y-2">
                  {trustSignals.map((exp, i) => (
                    <ExplainCard key={exp.id} explanation={exp} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Advice box */}
            <div className={cn(
              'rounded-2xl p-5 border',
              risk_score.risk_label === 'LOW'
                ? 'bg-emerald-500/8 border-emerald-500/25'
                : risk_score.risk_label === 'MEDIUM'
                ? 'bg-amber-500/8 border-amber-500/25'
                : 'bg-red-500/8 border-red-500/25'
            )}>
              <RiskCat risk={risk_score.risk_label} />
              <div className="text-xl mb-2">
                {risk_score.risk_label === 'LOW' ? 'Looking good!' :
                 risk_score.risk_label === 'MEDIUM' ? 'Proceed with caution' :
                 risk_score.risk_label === 'HIGH' ? 'High risk detected' :
                 'Do NOT proceed!'}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {risk_score.risk_label === 'LOW' &&
                  'This listing shows few or no scam signals. Always meet in person, ask for vet records, and never send money before seeing the cat.'}
                {risk_score.risk_label === 'MEDIUM' &&
                  'Some suspicious signals detected. Verify the shelter independently, request vet records, and arrange an in-person meeting before proceeding.'}
                {risk_score.risk_label === 'HIGH' &&
                  'Multiple serious red flags detected. We strongly recommend not proceeding with this listing. If you do, never send money in advance.'}
                {risk_score.risk_label === 'CRITICAL' &&
                  'This listing matches highly common scam patterns. Do NOT send any money or personal information. Report this listing to the platform immediately.'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/analyze/listing')}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-all"
              >
                New Listing Check
              </button>
              <button
                onClick={() => navigate('/analyze/url')}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-all"
              >
                Check URL Instead
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
