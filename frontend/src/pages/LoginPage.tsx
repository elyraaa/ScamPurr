import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cat, Loader2, Shield, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { user, loading, login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await login();
      navigate('/dashboard');
    } catch (e: any) {
      setError(e.message || 'Sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    setError(null);
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch (e: any) {
      setError(e.message || 'Demo login failed.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Orbs */}
      <div className="orb w-96 h-96 bg-violet-600/20 -top-20 -left-20" />
      <div className="orb w-80 h-80 bg-indigo-600/15 bottom-0 right-0" style={{ animationDelay: '3s' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div className="glass-card rounded-3xl p-10 border border-white/10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-2xl shadow-violet-500/30 mb-5 glow-violet">
              <Cat className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">ScamPurr AI</h1>
            <p className="text-slate-400 text-sm mt-1.5">
              Sign in to start protecting yourself from cat adoption scams
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Auth buttons */}
          <div className="space-y-3">
            {/* Google */}
            <button
              id="btn-google-login"
              onClick={handleGoogleLogin}
              disabled={isLoading || isDemoLoading}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border border-white/12 bg-white/5 hover:bg-white/10 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/8" />
              </div>
              <div className="relative flex justify-center text-xs text-slate-500">
                <span className="bg-[#0f1629] px-3">or</span>
              </div>
            </div>

            {/* Demo mode */}
            <button
              id="btn-demo-login"
              onClick={handleDemoLogin}
              disabled={isLoading || isDemoLoading}
              className="w-full flex items-center justify-center gap-3 btn-primary px-5 py-3.5 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDemoLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="text-lg">🐾</span>
              )}
              Try Demo Mode — no sign up
            </button>
          </div>

          {/* Features teaser */}
          <div className="mt-8 space-y-2.5">
            {[
              { icon: Shield, text: 'AI-powered listing text analysis' },
              { icon: Zap, text: 'Real-time URL trust scoring' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-sm text-slate-500">
                <Icon className="w-4 h-4 text-violet-500 flex-shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          ScamPurr AI • Coding.Kitty Hackathon 2026
        </p>
      </motion.div>
    </div>
  );
}
