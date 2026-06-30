import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Search, Globe, Clock, LogOut, Cat } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { cn } from '../../lib/utils';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analyze/listing', label: 'Listing', icon: Search },
  { to: '/analyze/url', label: 'URL Check', icon: Globe },
  { to: '/history', label: 'History', icon: Clock },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b-[3px] border-[#f4a0c0] bg-[#fff9fc]/95">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl border-[3px] border-[#7e2f51] bg-[#ffd6e8] flex items-center justify-center shadow-[3px_3px_0_rgba(126,47,81,0.22)] group-hover:bg-[#f9d0e0] transition-colors">
            <Cat className="w-4 h-4 text-[#d4537e]" />
          </div>
          <span className="font-bold text-[#7e2f51] text-xs sm:text-sm tracking-tight">
            Scam<span className="text-[#d4537e]">Purr</span>{' '}
            <span className="text-[#a55275] font-normal">AI</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.filter(({ to }) => user || !['/dashboard', '/history'].includes(to)).map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  active
                    ? 'text-[#7e2f51]'
                    : 'text-[#a55275] hover:text-[#7e2f51] hover:bg-[#ffd6e8]'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-[#ffd6e8] border-2 border-[#f4a0c0]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{label}</span>
              </Link>
            );
          })}
        </div>

        {/* User + Logout */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#ffd6e8] border-2 border-[#f4a0c0] flex items-center justify-center overflow-hidden">
                {user.photo_url ? (
                  <img src={user.photo_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#d4537e] text-xs font-semibold">
                    {(user.display_name || user.email || 'U')[0].toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-xs text-[#7e2f51] max-w-[120px] truncate">
                {user.display_name || user.email}
              </span>
            </div>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#a55275] hover:text-[#c93f69] hover:bg-[#ffd6e8] transition-all duration-200 border border-transparent hover:border-[#f4a0c0]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#a55275] hover:text-[#7e2f51] hover:bg-[#ffd6e8] transition-all duration-200 border border-transparent hover:border-[#f4a0c0]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
