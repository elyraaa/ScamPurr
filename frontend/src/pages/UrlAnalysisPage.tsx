import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, AlertCircle, Shield, ExternalLink } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { ScanningCatLoader } from '../components/pixel';
import { useAuth } from '../context/useAuth';
import { api } from '../lib/axios';
import { getErrorMessage } from '../lib/errors';
import type { FullAnalysisResponse } from '../types';

const schema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .url('Must be a valid URL starting with http:// or https://'),
});

type FormData = z.infer<typeof schema>;

const SAMPLE_URLS = [
  { label: 'Risky URL', url: 'http://free-persian-kittens.tk/adopt-now' },
  { label: 'Safe URL', url: 'https://www.aspca.org/adopt-pet' },
  { label: 'Suspicious', url: 'http://cutekittens4u.xyz/adopt' },
];

const CHECKS = [
  { icon: Shield, label: 'SSL Certificate', description: 'Valid HTTPS encryption' },
  { icon: Globe, label: 'Domain Age', description: 'WHOIS registration date' },
  { icon: ExternalLink, label: 'Safe Browsing', description: 'Google phishing check' },
  { icon: Shield, label: 'Reputation', description: 'VirusTotal scan' },
];

export function UrlAnalysisPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError(null);
    try {
      const endpoint = user ? '/analyses/url' : '/analyses/guest/url';
      const res = await api.post<FullAnalysisResponse>(endpoint, { url: data.url });
      sessionStorage.setItem(`scampurr_result_${res.data.analysis_id}`, JSON.stringify(res.data));
      navigate(`/result/${res.data.analysis_id}`);
    } catch (error) {
      setError(getErrorMessage(error, 'URL analysis failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />

      <div className="page-content max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">URL Trust Analysis</h1>
              <p className="text-sm text-slate-400">Check a shelter or listing website for trust signals</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-5"
        >
          {/* What we check */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              What we analyze
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {CHECKS.map(({ icon: Icon, label, description }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/8">
                  <Icon className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-slate-300">{label}</div>
                    <div className="text-xs text-slate-500">{description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="glass-card rounded-2xl p-6">
              <label className="text-sm font-semibold text-slate-300 block mb-3" htmlFor="shelter-url">
                Shelter or Listing URL *
              </label>

              {/* Sample URLs */}
              <div className="flex flex-wrap gap-2 mb-3">
                {SAMPLE_URLS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setValue('url', s.url, { shouldValidate: true })}
                    className="text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <input
                id="shelter-url"
                {...register('url')}
                type="url"
                placeholder="https://shelter-website.com"
                className="input-dark w-full rounded-xl px-4 py-3.5 text-sm"
              />
              {errors.url && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.url.message}
                </p>
              )}
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              id="btn-analyze-url"
              type="submit"
              disabled={submitting}
              className="btn-primary w-full flex items-center justify-center gap-3 text-white font-semibold py-4 rounded-xl text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <ScanningCatLoader compact />
              ) : (
                <>
                  <Globe className="w-5 h-5" />
                  Check URL Trust Score
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
