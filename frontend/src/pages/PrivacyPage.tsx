import React from 'react';
import { Link } from 'react-router-dom';
import { Cat, Shield } from 'lucide-react';

const sections = [
  {
    title: 'What ScamPurr Uses',
    body: 'ScamPurr uses your Firebase Google sign-in identity, submitted listing text, submitted URLs, and saved analysis results so the app can authenticate you and show your history.',
  },
  {
    title: 'How Analysis Data Is Stored',
    body: 'Listing text, URLs, scores, explanations, and timestamps may be stored in the application database for your account history. Do not submit private passwords, financial details, or other sensitive personal information.',
  },
  {
    title: 'External Checks',
    body: 'URL analysis can use reputation and safety services such as Google Safe Browsing and VirusTotal when those API keys are configured by the backend.',
  },
  {
    title: 'Authentication',
    body: 'Google sign-in is handled by Firebase Authentication. The backend verifies Firebase ID tokens before creating or updating your app user record.',
  },
];

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-200">
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Cat className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">
            Scam<span className="text-violet-400">Purr</span>
            <span className="text-slate-500 font-normal text-base"> AI</span>
          </span>
        </Link>
        <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
          Sign in
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-8">
          <Shield className="w-3.5 h-3.5" />
          Privacy and data use
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-5">Privacy Notice</h1>
        <p className="text-slate-400 leading-relaxed mb-10">
          ScamPurr AI is designed to help review cat adoption listings and URLs for scam signals.
          This page summarizes the data the app needs to operate.
        </p>

        <div className="space-y-5">
          {sections.map((section) => (
            <section key={section.title} className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-2">{section.title}</h2>
              <p className="text-sm leading-relaxed text-slate-400">{section.body}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
