import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Zap, Eye, ChevronRight, Cat, Star } from 'lucide-react';

const FEATURES = [
  {
    icon: Shield,
    title: 'AI Scam Detection',
    description: 'Advanced TF-IDF + Random Forest model trained on hundreds of real scam patterns.',
    color: 'from-violet-500 to-indigo-500',
  },
  {
    icon: Eye,
    title: 'URL Trust Analysis',
    description: 'WHOIS domain age, SSL validation, Safe Browsing, and VirusTotal reputation checks.',
    color: 'from-teal-500 to-cyan-500',
  },
  {
    icon: Zap,
    title: 'Explainable Results',
    description: 'Every risk score comes with detailed factor breakdown — not just a number.',
    color: 'from-amber-500 to-orange-500',
  },
];

const STATS = [
  { value: '12+', label: 'Scam Signals' },
  { value: '4', label: 'Trust Checks' },
  { value: '0–100', label: 'Risk Score' },
  { value: '100%', label: 'Explainable' },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0f1e] relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb w-96 h-96 bg-violet-600/20 -top-20 -left-20" />
      <div className="orb w-80 h-80 bg-indigo-600/15 top-1/3 -right-20" style={{ animationDelay: '3s' }} />
      <div className="orb w-64 h-64 bg-teal-600/15 bottom-1/4 left-1/4" style={{ animationDelay: '5s' }} />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Cat className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">
            Scam<span className="text-violet-400">Purr</span>
            <span className="text-slate-500 font-normal text-base"> AI</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            to="/login"
            className="btn-primary text-sm text-white font-medium px-5 py-2 rounded-xl"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-8">
            <Star className="w-3.5 h-3.5" />
            Coding.Kitty Hackathon 2026
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] mb-6">
            Don't let scammers{' '}
            <span className="gradient-text">steal your</span>
            <br />
            future furball 🐱
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            ScamPurr AI analyzes cat adoption listings and shelter websites for scam signals
            — and tells you <em>exactly</em> why something looks suspicious.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="btn-primary flex items-center gap-2 text-white font-semibold px-8 py-3.5 rounded-xl text-base w-full sm:w-auto justify-center"
            >
              Start analyzing for free
              <ChevronRight className="w-4 h-4" />
            </button>
            <Link
              to="/login"
              className="flex items-center gap-2 text-slate-400 hover:text-white text-sm px-4 py-3 transition-colors"
            >
              <Cat className="w-4 h-4" />
              Try demo mode — no sign up needed
            </Link>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="glass-card rounded-2xl p-6 text-center">
              <div className="text-3xl font-black gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">How ScamPurr protects you</h2>
          <p className="text-slate-400">Three layers of analysis, all explainable.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              className="glass-card rounded-2xl p-6 hover:border-violet-500/30 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feat.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{feat.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feat.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="glass-card rounded-3xl p-12 border-violet-500/20 relative overflow-hidden">
          <div className="orb w-64 h-64 bg-violet-600/20 -top-10 -right-10" />
          <div className="relative z-10">
            <div className="text-5xl mb-4">🙀</div>
            <h2 className="text-3xl font-bold text-white mb-3">Ready to sniff out scammers?</h2>
            <p className="text-slate-400 mb-8">Join thousands of cat lovers who use ScamPurr to adopt safely.</p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary text-white font-semibold px-8 py-3.5 rounded-xl"
            >
              Analyze a listing now 🐾
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-slate-600 text-sm border-t border-white/5">
        ScamPurr AI • Coding.Kitty Hackathon 2026 • Built with 🐾 and TypeScript
      </footer>
    </div>
  );
}
