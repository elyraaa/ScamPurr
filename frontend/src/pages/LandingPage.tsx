import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cat, ChevronRight, Eye, Shield, Star, Zap } from 'lucide-react';
import { CatTreeScene } from '../components/pixel';

const FEATURES = [
  {
    icon: Shield,
    title: 'AI scam scan',
    description: 'Detects urgency, payment, identity, and verification patterns in adoption listings.',
  },
  {
    icon: Eye,
    title: 'URL trust check',
    description: 'Reviews shelter websites for domain, SSL, Safe Browsing, and reputation signals.',
  },
  {
    icon: Zap,
    title: 'Explainable score',
    description: 'Turns every risk score into clear reasons you can act on before sending money.',
  },
];

const STATS = [
  { value: '12+', label: 'Scam signals' },
  { value: '4', label: 'URL checks' },
  { value: '0-100', label: 'Risk score' },
  { value: '100%', label: 'Explainable' },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="page-shell overflow-hidden">
      <nav className="relative z-10 flex items-center justify-between gap-3 px-4 sm:px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl border-[3px] border-[#7e2f51] bg-[#ffd6e8] flex items-center justify-center shadow-[4px_4px_0_rgba(126,47,81,0.22)]">
            <Cat className="w-5 h-5 text-[#d4537e]" />
          </div>
          <span className="font-bold text-[#7e2f51] text-[10px] sm:text-sm tracking-tight whitespace-nowrap">
            Scam<span className="text-[#d4537e]">Purr</span> AI
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden sm:inline-flex text-xs text-[#a55275] hover:text-[#7e2f51] transition-colors px-3 py-2">
            Sign in
          </Link>
          <Link to="/login" className="btn-primary text-[10px] sm:text-xs px-3 sm:px-4 py-2 whitespace-nowrap">
            Start
          </Link>
        </div>
      </nav>

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-14 grid lg:grid-cols-[1fr_0.9fr] gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-[3px] border-[#f4a0c0] bg-[#fff9fc] text-[#d4537e] text-[10px] font-medium mb-7 shadow-[4px_4px_0_rgba(126,47,81,0.16)]">
            <Star className="w-3.5 h-3.5" />
            Coding.Kitty Hackathon 2026
          </div>

          <h1 className="pixel-title mb-6 max-w-4xl">
            ScamPurr AI
          </h1>
          <p className="pixel-body max-w-2xl mb-9">
            A pink pixel safety desk for cat adoption. Paste a listing or shelter URL and get
            a clear scam-risk score before you send money, forms, or trust.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="btn-primary flex w-full sm:w-auto items-center justify-center gap-2 px-7 py-3.5 text-xs"
            >
              Start scanning
              <ChevronRight className="w-4 h-4" />
            </button>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-[#a55275] hover:text-[#7e2f51] text-xs px-4 py-3 transition-colors"
            >
              <Cat className="w-4 h-4" />
              Try demo mode
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="min-w-0"
        >
          <CatTreeScene />
        </motion.div>
      </section>

      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="glass-card p-5 text-center">
              <div className="text-xl md:text-2xl font-black text-[#d4537e] mb-2">{stat.value}</div>
              <div className="text-[10px] text-[#a55275]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <p className="pixel-kicker mb-3">How it helps</p>
          <h2 className="text-xl md:text-2xl font-bold text-[#7e2f51]">Three checks, one calm answer</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.08 }}
              className="glass-card p-6"
            >
              <div className="w-12 h-12 rounded-xl border-[3px] border-[#7e2f51] bg-[#ffd6e8] flex items-center justify-center mb-5 shadow-[3px_3px_0_rgba(126,47,81,0.18)]">
                <feat.icon className="w-6 h-6 text-[#d4537e]" />
              </div>
              <h3 className="text-[#7e2f51] font-semibold text-sm mb-3">{feat.title}</h3>
              <p className="text-[#a55275] text-xs leading-relaxed">{feat.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-3xl mx-auto px-6 py-12 text-center">
        <div className="glass-card p-8 md:p-10">
          <Cat className="w-10 h-10 mx-auto mb-5 text-[#d4537e]" />
          <h2 className="text-lg md:text-xl font-bold text-[#7e2f51] mb-4">Ready to check a listing?</h2>
          <p className="pixel-body mb-7">
            ScamPurr keeps the analysis playful, but the risk signals are serious.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary px-7 py-3 text-xs">
            Analyze now
          </button>
        </div>
      </section>

      <footer className="relative z-10 text-center py-8 text-[#a55275] text-[10px] border-t-[3px] border-[#f4a0c0] bg-[#fff9fc]/80">
        ScamPurr AI / Coding.Kitty Hackathon 2026 / Built with TypeScript
      </footer>
    </div>
  );
}
