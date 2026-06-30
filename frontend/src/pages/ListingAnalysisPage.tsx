import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertCircle, Globe, Info } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { ScanningCatLoader } from '../components/pixel';
import { useAuth } from '../context/useAuth';
import { api } from '../lib/axios';
import { getErrorMessage } from '../lib/errors';
import type { FullAnalysisResponse } from '../types';

const schema = z.object({
  text: z.string().min(20, 'Listing text must be at least 20 characters'),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

const SAMPLE_TEXTS = [
  {
    label: 'Scam Example',
    text: `Beautiful Persian kittens FREE! I'm going through a divorce and need urgent rehoming. Act now - only 2 left! You only need to pay a $200 shipping fee via Western Union or gift card. Cannot meet in person - will ship nationwide. Contact me at persians4u@gmail.com. God bless you!`,
  },
  {
    label: 'Legit Example',
    text: `Our registered non-profit rescue has 3 kittens ready for adoption. All are vaccinated, microchipped, and spayed/neutered. Adoption application required. Adoption fee $75 covers vet costs. Please visit our shelter to meet them in person on weekends. Full vet records provided.`,
  },
];

export function ListingAnalysisPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const textValue = useWatch({ control, name: 'text', defaultValue: '' });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError(null);
    try {
      const payload: { text: string; url?: string } = { text: data.text };
      if (data.url) payload.url = data.url;
      const endpoint = user ? '/analyses/listing' : '/analyses/guest/listing';
      const res = await api.post<FullAnalysisResponse>(endpoint, payload);
      if (!user) {
        sessionStorage.setItem(`scampurr_guest_result_${res.data.analysis_id}`, JSON.stringify(res.data));
      }
      navigate(`/result/${res.data.analysis_id}`);
    } catch (error) {
      setError(getErrorMessage(error, 'Analysis failed. Please try again.'));
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Listing Analysis</h1>
              <p className="text-sm text-slate-400">Paste an adoption listing to scan for scam signals</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Listing text */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-slate-300" htmlFor="listing-text">
                  Adoption Listing Text *
                </label>
                <span className="text-xs text-slate-600">{textValue.length} chars</span>
              </div>

              {/* Sample buttons */}
              <div className="flex gap-2 mb-3">
                {SAMPLE_TEXTS.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => setValue('text', sample.text, { shouldValidate: true })}
                    className="text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>

              <textarea
                id="listing-text"
                {...register('text')}
                rows={8}
                placeholder="Paste the full adoption listing text here... include everything the seller wrote, including contact info, pricing, and any special conditions."
                className="input-dark w-full rounded-xl px-4 py-3 text-sm resize-none"
              />
              {errors.text && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.text.message}
                </p>
              )}
            </div>

            {/* Optional URL */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-slate-400" />
                <label className="text-sm font-semibold text-slate-300" htmlFor="listing-url">
                  Shelter / Listing URL{' '}
                  <span className="text-slate-600 font-normal">(optional - runs combined analysis)</span>
                </label>
              </div>
              <input
                id="listing-url"
                {...register('url')}
                type="url"
                placeholder="https://example-shelter.com/adopt"
                className="input-dark w-full rounded-xl px-4 py-3 text-sm"
              />
              {errors.url && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.url.message}
                </p>
              )}
            </div>

            {/* Info box */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-violet-500/8 border border-violet-500/20 text-sm text-violet-300">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                The AI analyzes your listing for <strong>12+ scam signals</strong> including payment methods,
                urgency tactics, emotional manipulation, and verification flags.
              </span>
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

            {/* Submit */}
            <button
              id="btn-analyze-listing"
              type="submit"
              disabled={submitting}
              className="btn-primary w-full flex items-center justify-center gap-3 text-white font-semibold py-4 rounded-xl text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <ScanningCatLoader compact />
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Analyze for Scam Signals
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
