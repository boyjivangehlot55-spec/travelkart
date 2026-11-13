import React from 'react';

interface NavbarProps {
  variant?: 'transparent' | 'dark';
  onNavigateHome: () => void;
  onOpenComingSoon: (feature: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  variant = 'transparent',
  onNavigateHome,
  onOpenComingSoon,
}) => {
  const isDark = variant === 'dark';

  return (
    <header
      className={`w-full ${
        isDark ? 'bg-[#0B132B] shadow-[0_2px_12px_rgba(0,0,0,0.18)]' : 'relative z-20'
      }`}
      data-purpose="top-navigation-bar"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
        {/* Left: Brand Logo (Always the Airplane Logo Badge) */}
        <div
          onClick={onNavigateHome}
          className="flex items-center gap-3 cursor-pointer group select-none"
          data-purpose="brand-logo"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF7A00] to-[#FFB020] flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform duration-200">
            <svg
              className="w-6 h-6 text-white -rotate-45"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"></path>
            </svg>
          </div>
          <div className="flex items-baseline tracking-tight font-sans">
            <span className="text-2xl font-extrabold text-white">Travel</span>
            <span className="text-2xl font-extrabold text-[#FF8A00]">Kart</span>
          </div>
        </div>

        {/* Right Side Actions & Utilities */}
        <div className="flex items-center gap-4 sm:gap-6 xl:gap-8" data-purpose="header-utilities">
          {/* Utility 1: List Your Property */}
          <button
            onClick={() => onOpenComingSoon('List Your Property')}
            className="hidden md:flex items-center gap-2.5 text-left group hover:opacity-95 transition-opacity cursor-pointer"
            type="button"
          >
            <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-xs flex items-center justify-center text-amber-300 group-hover:bg-white/25 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </div>
            <div className="leading-tight">
              <p className="text-xs font-bold text-white tracking-wide">List Your Property</p>
              <p className="text-[10px] text-white/80 font-medium">Grow your business!</p>
            </div>
          </button>

          {/* Utility 2: My Trips */}
          <button
            onClick={() => onOpenComingSoon('My Trips')}
            className="hidden sm:flex items-center gap-2.5 text-left group hover:opacity-95 transition-opacity cursor-pointer"
            type="button"
          >
            <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-xs flex items-center justify-center text-blue-300 group-hover:bg-white/25 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect height="14" rx="2" ry="2" width="20" x="2" y="7"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <div className="leading-tight">
              <p className="text-xs font-bold text-white tracking-wide">My Trips</p>
              <p className="text-[10px] text-white/80 font-medium">Manage your bookings</p>
            </div>
          </button>

          {/* Utility 3: Wishlist */}
          <button
            onClick={() => onOpenComingSoon('Wishlist')}
            className="hidden sm:flex items-center gap-2.5 text-left group hover:opacity-95 transition-opacity cursor-pointer"
            type="button"
          >
            <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-xs flex items-center justify-center text-rose-400 group-hover:bg-white/25 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
              </svg>
            </div>
            <div className="leading-tight">
              <p className="text-xs font-bold text-white tracking-wide">Wishlist</p>
              <p className="text-[10px] text-white/80 font-medium">Save favourites</p>
            </div>
          </button>

          {/* Login / Create Account Button */}
          <button
            onClick={() => onOpenComingSoon('Account Login')}
            className="flex items-center gap-2 sm:gap-2.5 bg-gradient-to-r from-[#065AF3] to-[#2563EB] hover:from-[#054fda] hover:to-[#1d4ed8] text-white px-3 sm:px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            data-purpose="auth-button"
            type="button"
          >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <span className="tracking-wide hidden xs:inline">Login or Create Account</span>
            <span className="tracking-wide xs:hidden">Login</span>
            <svg className="w-3.5 h-3.5 ml-0.5 text-white/80 hidden xs:inline" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </button>

          {/* Currency and Language Selector */}
          <div
            onClick={() => onOpenComingSoon('Currency / Language Selector')}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-xs cursor-pointer transition-colors"
            data-purpose="locale-selector"
          >
            <svg className="w-5 h-3.5 rounded-[2px] shadow-xs" viewBox="0 0 640 480">
              <path d="M0 0h640v160H0z" fill="#f93"></path>
              <path d="M0 160h640v160H0z" fill="#fff"></path>
              <path d="M0 320h640v160H0z" fill="#128807"></path>
              <circle cx="320" cy="240" fill="#008" r="45"></circle>
              <circle cx="320" cy="240" fill="#fff" r="38"></circle>
              <circle cx="320" cy="240" fill="#008" r="10"></circle>
            </svg>
            <span className="text-xs font-semibold text-white tracking-wide">INR | English</span>
            <svg className="w-3 h-3 text-white/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};
