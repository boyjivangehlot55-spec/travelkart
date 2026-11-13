import React, { useState, useRef, useEffect } from 'react';
import { City, SearchParams } from '../types';
import { CITIES, POPULAR_ROUTES } from '../data/flightData';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LandingPageProps {
  searchParams: SearchParams;
  setSearchParams: React.Dispatch<React.SetStateAction<SearchParams>>;
  onSearch: () => void;
  onOpenComingSoon: (feature: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  searchParams,
  setSearchParams,
  onSearch,
  onOpenComingSoon,
}) => {
  // Dropdown states for search card
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [isTravellersOpen, setIsTravellersOpen] = useState(false);
  const [isDepDateOpen, setIsDepDateOpen] = useState(false);
  const [isRetDateOpen, setIsRetDateOpen] = useState(false);

  // Offers tab state (All Offers, Flights, Hotels, Holidays)
  const [activeOfferTab, setActiveOfferTab] = useState<'All' | 'Flights' | 'Hotels' | 'Holidays'>('All');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const travellersRef = useRef<HTMLDivElement>(null);
  const depDateRef = useRef<HTMLDivElement>(null);
  const retDateRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) {
        setIsFromOpen(false);
      }
      if (toRef.current && !toRef.current.contains(e.target as Node)) {
        setIsToOpen(false);
      }
      if (travellersRef.current && !travellersRef.current.contains(e.target as Node)) {
        setIsTravellersOpen(false);
      }
      if (depDateRef.current && !depDateRef.current.contains(e.target as Node)) {
        setIsDepDateOpen(false);
      }
      if (retDateRef.current && !retDateRef.current.contains(e.target as Node)) {
        setIsRetDateOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Swap
  const handleSwapCities = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchParams((prev) => ({
      ...prev,
      fromCity: prev.toCity,
      toCity: prev.fromCity,
    }));
  };

  // Parse YYYY-MM-DD locally to avoid timezone date shifting
  const parseLocalDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date(dateStr);
  };

  // Copy offer code helper with safe fallback
  const handleCopyCode = (code: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).catch(() => {});
      }
    } catch {
      // safe fallback
    }
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  // Select popular destination
  const handleSelectPopularRoute = (cityName: string) => {
    const foundCity = CITIES.find((c) => c.name.toLowerCase() === cityName.toLowerCase());
    if (foundCity) {
      setSearchParams((prev) => ({
        ...prev,
        toCity: foundCity,
      }));
    } else {
      const popRoute = POPULAR_ROUTES.find((r) => r.city.toLowerCase() === cityName.toLowerCase());
      if (popRoute) {
        setSearchParams((prev) => ({
          ...prev,
          toCity: {
            name: popRoute.city,
            code: popRoute.code,
            airport: `${popRoute.code}, ${popRoute.city} Airport`,
          },
        }));
      }
    }
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#F4F5F8] font-sans antialiased text-slate-800 m-0 p-0 min-h-screen flex flex-col">
      {/* ===================== HERO SECTION ===================== */}
      <section className="relative w-full h-[520px] lg:h-[560px] overflow-visible" data-purpose="hero-container">
        {/* Hero Background Image with sunset and gradient overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden" data-purpose="background-media">
          <img
            alt="Cinematic scenic sunset beach"
            className="w-full h-full object-cover object-center brightness-105 contrast-[1.02]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDiZCIL5AFqntKu4Rhy-5XgC6DW8A0mE2pT59rnrsrahNLjGZLeJZeqir7jhbGJGWYYf-MsMDd0C1Wms6wUDb-LMtFCfeZVmcWflASTfaPT9dh2Mey2zvggEYaUpHs5IHdlrYewq_ZiUnzhRgy3q5hqz-2uJgYdpq4mW09L7tTdfZ3nRA-q0IDCgKxBJI6zZ6uKCI13qKmWeA7XPs6ddE5WN5e9hn79PeBjyRzp-g"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/35"></div>
        </div>

        {/* Top Navigation */}
        <Navbar
          variant="transparent"
          onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          onOpenComingSoon={onOpenComingSoon}
        />
      </section>

      {/* ===================== MAIN SEARCH HUB (OVERLAPS HERO) ===================== */}
      <main className="relative z-30 max-w-[1080px] mx-auto px-4 -mt-[380px] lg:-mt-[410px] pb-16 w-full" data-purpose="main-booking-hub">
        {/* 2. CATEGORY TAB CARD */}
        <div className="bg-white rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.14)] border border-slate-100 px-3 sm:px-6 pt-3 pb-2.5 mb-2 relative z-10" data-purpose="floating-category-strip-wrapper">
          <nav aria-label="Travel Categories" className="flex items-end justify-between overflow-x-auto no-scrollbar gap-2">
            {/* 1. Flights (Active) */}
            <div className="relative group flex flex-col items-center justify-between min-w-[70px] pb-2 text-center shrink-0 cursor-pointer">
              <div className="h-11 flex items-center justify-center mb-1">
                <svg className="w-10 h-10 drop-shadow-xs" fill="none" viewBox="0 0 48 48">
                  <ellipse cx="24" cy="40" fill="#065AF3" fillOpacity="0.12" rx="14" ry="3"></ellipse>
                  <path d="M22 6L28 6L32 20L44 24V28L31 26L30 38L34 41V44L24 42L14 44V41L18 38L17 26L4 28V24L16 20L20 6Z" fill="#065AF3"></path>
                  <path d="M24 6L28 6L32 20L44 24V26L31 24.5L30 38L34 41V43L24 41.5V6Z" fill="#2563EB"></path>
                  <path d="M24 7L21 20L24 23L27 20L24 7Z" fill="#93C5FD"></path>
                </svg>
              </div>
              <span className="text-xs font-bold text-[#065AF3] tracking-tight whitespace-nowrap">Flights</span>
              {/* Active Indicator Underline */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-12 h-[3.5px] bg-[#065AF3] rounded-full"></div>
            </div>

            {/* 2. Hotels */}
            <button
              onClick={() => onOpenComingSoon('Hotels Booking')}
              className="group flex flex-col items-center justify-between min-w-[70px] pb-2 text-center shrink-0 hover:opacity-90 transition-opacity cursor-pointer bg-transparent border-0"
              type="button"
            >
              <div className="h-11 flex items-center justify-center mb-1">
                <svg className="w-9 h-9 drop-shadow-xs" fill="none" viewBox="0 0 48 48">
                  <rect fill="#1E293B" height="28" rx="2" width="20" x="8" y="14"></rect>
                  <rect fill="#0284C7" height="34" rx="2" width="18" x="22" y="8"></rect>
                  <rect fill="#BAE6FD" height="4" rx="1" width="4" x="26" y="14"></rect>
                  <rect fill="#BAE6FD" height="4" rx="1" width="4" x="33" y="14"></rect>
                  <rect fill="#BAE6FD" height="4" rx="1" width="4" x="26" y="22"></rect>
                  <rect fill="#BAE6FD" height="4" rx="1" width="4" x="33" y="22"></rect>
                  <rect fill="#94A3B8" height="3" rx="0.5" width="3" x="13" y="20"></rect>
                  <rect fill="#94A3B8" height="3" rx="0.5" width="3" x="13" y="27"></rect>
                  <rect fill="#F8FAFC" height="8" rx="1" width="8" x="27" y="34"></rect>
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-[#065AF3] transition-colors tracking-tight whitespace-nowrap">Hotels</span>
            </button>

            {/* 3. Villas & Homestays */}
            <button
              onClick={() => onOpenComingSoon('Villas & Homestays')}
              className="group flex flex-col items-center justify-between min-w-[78px] pb-2 text-center shrink-0 hover:opacity-90 transition-opacity cursor-pointer bg-transparent border-0"
              type="button"
            >
              <div className="h-11 flex items-center justify-center mb-1">
                <svg className="w-10 h-9 drop-shadow-xs" fill="none" viewBox="0 0 48 48">
                  <path d="M8 22L22 10L36 22V40H8V22Z" fill="#F97316"></path>
                  <path d="M22 10L36 22H8L22 10Z" fill="#EA580C"></path>
                  <rect fill="#FEF3C7" height="12" rx="1" width="8" x="18" y="28"></rect>
                  <rect fill="#FFF7ED" height="4" rx="1" width="4" x="12" y="24"></rect>
                  <circle cx="38" cy="28" fill="#16A34A" r="7"></circle>
                  <rect fill="#78350F" height="6" width="3" x="36.5" y="34"></rect>
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-[#065AF3] transition-colors tracking-tight leading-tight text-center">Villas &amp;<br />Homestays</span>
            </button>

            {/* 4. Holiday Packages */}
            <button
              onClick={() => onOpenComingSoon('Holiday Packages')}
              className="group flex flex-col items-center justify-between min-w-[78px] pb-2 text-center shrink-0 hover:opacity-90 transition-opacity cursor-pointer bg-transparent border-0"
              type="button"
            >
              <div className="h-11 flex items-center justify-center mb-1">
                <svg className="w-9 h-9 drop-shadow-xs" fill="none" viewBox="0 0 48 48">
                  <circle cx="36" cy="12" fill="#FBBF24" r="5"></circle>
                  <path d="M12 24C12 16.268 18.268 10 26 10C33.732 10 40 16.268 40 24H12Z" fill="#EF4444"></path>
                  <path d="M19 24C19 16.268 22 10 26 10C30 10 33 16.268 33 24H19Z" fill="#F8FAFC"></path>
                  <path d="M25 24V40" stroke="#78350F" strokeLinecap="round" strokeWidth="2.5"></path>
                  <path d="M8 42C16 39 32 39 42 42" stroke="#38BDF8" strokeLinecap="round" strokeWidth="3"></path>
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-[#065AF3] transition-colors tracking-tight leading-tight text-center">Holiday<br />Packages</span>
            </button>

            {/* 5. Trains */}
            <button
              onClick={() => onOpenComingSoon('Trains Booking')}
              className="group flex flex-col items-center justify-between min-w-[70px] pb-2 text-center shrink-0 hover:opacity-90 transition-opacity cursor-pointer bg-transparent border-0"
              type="button"
            >
              <div className="h-11 flex items-center justify-center mb-1">
                <svg className="w-9 h-9 drop-shadow-xs" fill="none" viewBox="0 0 48 48">
                  <path d="M12 36L8 42H13L15 36H33L35 42H40L36 36" stroke="#64748B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                  <path d="M14 12C14 7 19 6 24 6C29 6 34 7 34 12V32C34 35 30 36 24 36C18 36 14 35 14 32V12Z" fill="#6366F1"></path>
                  <path d="M17 12H31V20H17V12Z" fill="#E0E7FF"></path>
                  <circle cx="19" cy="28" fill="#FEF08A" r="2"></circle>
                  <circle cx="29" cy="28" fill="#FEF08A" r="2"></circle>
                  <rect fill="#4338CA" height="2" rx="1" width="6" x="21" y="27"></rect>
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-[#065AF3] transition-colors tracking-tight whitespace-nowrap">Trains</span>
            </button>

            {/* 6. Buses */}
            <button
              onClick={() => onOpenComingSoon('Buses Booking')}
              className="group flex flex-col items-center justify-between min-w-[70px] pb-2 text-center shrink-0 hover:opacity-90 transition-opacity cursor-pointer bg-transparent border-0"
              type="button"
            >
              <div className="h-11 flex items-center justify-center mb-1">
                <svg className="w-9 h-9 drop-shadow-xs" fill="none" viewBox="0 0 48 48">
                  <rect fill="#DC2626" height="26" rx="4" width="28" x="10" y="10"></rect>
                  <path d="M10 20H38V28H10V20Z" fill="#FEE2E2"></path>
                  <rect fill="#FFFFFF" height="4" rx="1" width="20" x="14" y="13"></rect>
                  <circle cx="15" cy="31" fill="#FEF08A" r="2"></circle>
                  <circle cx="33" cy="31" fill="#FEF08A" r="2"></circle>
                  <rect fill="#1E293B" height="4" rx="1" width="5" x="14" y="36"></rect>
                  <rect fill="#1E293B" height="4" rx="1" width="5" x="29" y="36"></rect>
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-[#065AF3] transition-colors tracking-tight whitespace-nowrap">Buses</span>
            </button>

            {/* 7. Cabs */}
            <button
              onClick={() => onOpenComingSoon('Cabs Booking')}
              className="group flex flex-col items-center justify-between min-w-[70px] pb-2 text-center shrink-0 hover:opacity-90 transition-opacity cursor-pointer bg-transparent border-0"
              type="button"
            >
              <div className="h-11 flex items-center justify-center mb-1">
                <svg className="w-9 h-9 drop-shadow-xs" fill="none" viewBox="0 0 48 48">
                  <rect fill="#1E293B" height="3" rx="1" width="8" x="20" y="10"></rect>
                  <path d="M14 18L18 13H30L34 18H38C39.6 18 41 19.4 41 21V30C41 31.6 39.6 33 38 33H10C8.4 33 7 31.6 7 30V21C7 19.4 8.4 18 10 18H14Z" fill="#FACC15"></path>
                  <path d="M15 19H33L31 15H17L15 19Z" fill="#1E293B"></path>
                  <circle cx="14" cy="33" fill="#1E293B" r="3.5"></circle>
                  <circle cx="14" cy="33" fill="#94A3B8" r="1.5"></circle>
                  <circle cx="34" cy="33" fill="#1E293B" r="3.5"></circle>
                  <circle cx="34" cy="33" fill="#94A3B8" r="1.5"></circle>
                  <circle cx="11" cy="24" fill="#FFFFFF" r="1.5"></circle>
                  <circle cx="37" cy="24" fill="#FFFFFF" r="1.5"></circle>
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-[#065AF3] transition-colors tracking-tight whitespace-nowrap">Cabs</span>
            </button>

            {/* 8. Tours & Attractions */}
            <button
              onClick={() => onOpenComingSoon('Tours & Attractions')}
              className="group flex flex-col items-center justify-between min-w-[78px] pb-2 text-center shrink-0 hover:opacity-90 transition-opacity cursor-pointer bg-transparent border-0"
              type="button"
            >
              <div className="h-11 flex items-center justify-center mb-1">
                <svg className="w-9 h-9 drop-shadow-xs" fill="none" viewBox="0 0 48 48">
                  <path d="M24 6C16 6 11 12 11 19C11 25 18 32 21 34H27C30 32 37 25 37 19C37 12 32 6 24 6Z" fill="#8B5CF6"></path>
                  <path d="M20 6C16 11 16 27 21 34H27C32 27 32 11 28 6H20Z" fill="#EC4899"></path>
                  <rect fill="#B45309" height="5" rx="1" width="6" x="21" y="38"></rect>
                  <path d="M22 34L22 38M26 34L26 38" stroke="#78350F" strokeWidth="1.5"></path>
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-[#065AF3] transition-colors tracking-tight leading-tight text-center">Tours &amp;<br />Attractions</span>
            </button>

            {/* 9. Visa */}
            <button
              onClick={() => onOpenComingSoon('Visa Services')}
              className="group flex flex-col items-center justify-between min-w-[70px] pb-2 text-center shrink-0 hover:opacity-90 transition-opacity cursor-pointer bg-transparent border-0"
              type="button"
            >
              <div className="h-11 flex items-center justify-center mb-1">
                <svg className="w-9 h-9 drop-shadow-xs" fill="none" viewBox="0 0 48 48">
                  <rect fill="#0D9488" height="32" rx="3" width="24" x="12" y="8"></rect>
                  <circle cx="24" cy="20" r="5" stroke="#FDE047" strokeWidth="2"></circle>
                  <path d="M18 28H30M18 32H26" stroke="#CCFBF1" strokeLinecap="round" strokeWidth="2"></path>
                  <path d="M30 6L38 12V36L30 32" fill="#0F766E"></path>
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-[#065AF3] transition-colors tracking-tight whitespace-nowrap">Visa</span>
            </button>

            {/* 10. Forex Card & Currency */}
            <button
              onClick={() => onOpenComingSoon('Forex Card & Currency')}
              className="group flex flex-col items-center justify-between min-w-[78px] pb-2 text-center shrink-0 hover:opacity-90 transition-opacity cursor-pointer bg-transparent border-0"
              type="button"
            >
              <div className="h-11 flex items-center justify-center mb-1">
                <svg className="w-10 h-9 drop-shadow-xs" fill="none" viewBox="0 0 48 48">
                  <rect fill="#3B82F6" height="18" rx="2.5" width="28" x="8" y="14"></rect>
                  <rect fill="#1E3A8A" height="4" width="28" x="8" y="19"></rect>
                  <rect fill="#FDE047" height="3" rx="0.5" width="5" x="12" y="26"></rect>
                  <circle cx="34" cy="28" fill="#F59E0B" r="7" stroke="#FDE68A" strokeWidth="1.5"></circle>
                  <text fill="#78350F" fontSize="9" fontWeight="bold" textAnchor="middle" x="34" y="32">$</text>
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-[#065AF3] transition-colors tracking-tight leading-tight text-center">Forex Card<br />&amp; Currency</span>
            </button>

            {/* 11. Travel Insurance */}
            <button
              onClick={() => onOpenComingSoon('Travel Insurance')}
              className="group flex flex-col items-center justify-between min-w-[78px] pb-2 text-center shrink-0 hover:opacity-90 transition-opacity cursor-pointer bg-transparent border-0"
              type="button"
            >
              <div className="h-11 flex items-center justify-center mb-1">
                <svg className="w-9 h-9 drop-shadow-xs" fill="none" viewBox="0 0 48 48">
                  <path d="M24 7L37 12V24C37 32 31 38 24 41C17 38 11 32 11 24V12L24 7Z" fill="#10B981"></path>
                  <path d="M24 10L34 14V24C34 30.5 29.5 35.5 24 38V10Z" fill="#059669"></path>
                  <path d="M19 23.5L23 27.5L30 20" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-[#065AF3] transition-colors tracking-tight leading-tight text-center">Travel<br />Insurance</span>
            </button>
          </nav>
        </div>

        {/* 3. FLIGHT SEARCH CARD */}
        <div className="relative bg-white rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.10)] border border-slate-200/80 px-6 sm:px-8 pt-6 pb-12" data-purpose="flight-search-container">
          {/* Row 1: Radio Trips & Subtitle Note */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4" data-purpose="flight-trip-types">
            <div className="flex items-center gap-6 text-sm font-bold text-slate-800">
              {/* One Way */}
              <label 
                onClick={() => setSearchParams((prev) => ({ ...prev, tripType: 'oneway' }))}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <div className={`w-4 h-4 rounded-full border-2 ${searchParams.tripType === 'oneway' ? 'border-[#065AF3]' : 'border-slate-300'} flex items-center justify-center bg-white`}>
                  {searchParams.tripType === 'oneway' && <div className="w-2 h-2 rounded-full bg-[#065AF3]"></div>}
                </div>
                <span className={searchParams.tripType === 'oneway' ? 'text-slate-900' : 'text-slate-600 font-semibold group-hover:text-slate-900'}>One Way</span>
              </label>

              {/* Round Trip */}
              <label 
                onClick={() => setSearchParams((prev) => ({ 
                  ...prev, 
                  tripType: 'roundtrip',
                  returnDate: prev.returnDate || '2026-11-07',
                  returnDisplayDate: prev.returnDisplayDate || "07 Nov'26",
                  returnDay: prev.returnDay || 'Saturday'
                }))}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <div className={`w-4 h-4 rounded-full border-2 ${searchParams.tripType === 'roundtrip' ? 'border-[#065AF3]' : 'border-slate-300'} flex items-center justify-center bg-white`}>
                  {searchParams.tripType === 'roundtrip' && <div className="w-2 h-2 rounded-full bg-[#065AF3]"></div>}
                </div>
                <span className={searchParams.tripType === 'roundtrip' ? 'text-slate-900' : 'text-slate-600 font-semibold group-hover:text-slate-900'}>Round Trip</span>
              </label>

              {/* Multi City */}
              <label 
                onClick={() => onOpenComingSoon('Multi City Flights')}
                className="flex items-center gap-2 cursor-pointer group text-slate-600 font-semibold"
              >
                <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center bg-white group-hover:border-slate-400"></div>
                <span className="group-hover:text-slate-900 transition-colors">Multi City</span>
              </label>
            </div>

            <p className="text-xs text-slate-500 font-medium">Book International and Domestic Flights</p>
          </div>

          {/* Row 2: Search Fields (Segmented Border Grid) */}
          <div className="relative border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-visible mb-5 bg-white hover:border-slate-300 transition-colors" data-purpose="search-fields-grid">
            {/* 1. From (col-span-3) */}
            <div 
              ref={fromRef}
              onClick={() => {
                setIsFromOpen(!isFromOpen);
                setIsToOpen(false);
                setIsTravellersOpen(false);
                setIsDepDateOpen(false);
                setIsRetDateOpen(false);
              }}
              className="md:col-span-3 p-4 hover:bg-blue-50/30 transition-colors cursor-pointer rounded-l-xl relative"
            >
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1">From</label>
              <p className="text-2xl font-black text-slate-900 leading-none tracking-tight">{searchParams.fromCity.name}</p>
              <p className="text-xs text-slate-500 truncate mt-1.5 font-medium">{searchParams.fromCity.airport}</p>

              {/* From Dropdown Popover */}
              {isFromOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 py-2 max-h-80 overflow-y-auto animate-fadeIn"
                >
                  <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100">
                    Select Departure City
                  </div>
                  {CITIES.map((city) => (
                    <div
                      key={city.code}
                      onClick={() => {
                        // Prevent same From & To
                        if (city.code === searchParams.toCity.code) {
                          setSearchParams((prev) => ({
                            ...prev,
                            toCity: prev.fromCity,
                            fromCity: city,
                          }));
                        } else {
                          setSearchParams((prev) => ({ ...prev, fromCity: city }));
                        }
                        setIsFromOpen(false);
                      }}
                      className={`px-3 py-2.5 flex items-center justify-between hover:bg-blue-50 cursor-pointer transition-colors ${
                        city.code === searchParams.fromCity.code ? 'bg-blue-50/70' : ''
                      }`}
                    >
                      <div>
                        <div className="text-sm font-bold text-slate-900">{city.name}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{city.airport}</div>
                      </div>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {city.code}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Swap Button (Absolute Centered between From & To) */}
            <button
              onClick={handleSwapCities}
              className="absolute z-20 hidden md:flex left-[25%] -translate-x-1/2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-[#065AF3] hover:scale-110 hover:shadow-lg transition-all cursor-pointer"
              title="Swap cities"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </button>

            {/* 2. To (col-span-3) */}
            <div 
              ref={toRef}
              onClick={() => {
                setIsToOpen(!isToOpen);
                setIsFromOpen(false);
                setIsTravellersOpen(false);
                setIsDepDateOpen(false);
                setIsRetDateOpen(false);
              }}
              className="md:col-span-3 p-4 pl-5 hover:bg-blue-50/30 transition-colors cursor-pointer relative"
            >
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1">To</label>
              <p className="text-2xl font-black text-slate-900 leading-none tracking-tight">{searchParams.toCity.name}</p>
              <p className="text-xs text-slate-500 truncate mt-1.5 font-medium">{searchParams.toCity.airport}</p>

              {/* To Dropdown Popover */}
              {isToOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 py-2 max-h-80 overflow-y-auto animate-fadeIn"
                >
                  <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100">
                    Select Destination City
                  </div>
                  {CITIES.map((city) => (
                    <div
                      key={city.code}
                      onClick={() => {
                        // Prevent same From & To
                        if (city.code === searchParams.fromCity.code) {
                          setSearchParams((prev) => ({
                            ...prev,
                            fromCity: prev.toCity,
                            toCity: city,
                          }));
                        } else {
                          setSearchParams((prev) => ({ ...prev, toCity: city }));
                        }
                        setIsToOpen(false);
                      }}
                      className={`px-3 py-2.5 flex items-center justify-between hover:bg-blue-50 cursor-pointer transition-colors ${
                        city.code === searchParams.toCity.code ? 'bg-blue-50/70' : ''
                      }`}
                    >
                      <div>
                        <div className="text-sm font-bold text-slate-900">{city.name}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{city.airport}</div>
                      </div>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {city.code}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Departure (col-span-2) */}
            <div 
              ref={depDateRef}
              onClick={() => {
                setIsDepDateOpen(!isDepDateOpen);
                setIsFromOpen(false);
                setIsToOpen(false);
                setIsTravellersOpen(false);
                setIsRetDateOpen(false);
              }}
              className="md:col-span-2 p-4 hover:bg-blue-50/30 transition-colors cursor-pointer relative"
            >
              <div className="flex items-center gap-1 mb-1">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Departure</span>
                <svg className="w-3.5 h-3.5 text-[#065AF3]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none tracking-tight">
                {searchParams.departureDisplayDate.split(' ')[0]} <span className="text-xl font-bold">{searchParams.departureDisplayDate.split(' ')[1] || "Oct'26"}</span>
              </p>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">{searchParams.departureDay}</p>

              {/* Date selection popover */}
              {isDepDateOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 p-4 animate-fadeIn"
                >
                  <div className="text-xs font-bold text-slate-800 mb-2">Select Departure Date</div>
                  <input
                    type="date"
                    value={searchParams.departureDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const dateObj = parseLocalDate(val);
                      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                      const dayNum = dateObj.getDate();
                      const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
                      const year = String(dateObj.getFullYear()).slice(-2);
                      setSearchParams((prev) => ({
                        ...prev,
                        departureDate: val,
                        departureDisplayDate: `${dayNum} ${monthName}'${year}`,
                        departureDay: dayName,
                      }));
                      setIsDepDateOpen(false);
                    }}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#065AF3]"
                  />
                  <div className="mt-2 text-[11px] text-slate-400">
                    Departure set to: {searchParams.departureDisplayDate}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Return (col-span-2) */}
            <div 
              ref={retDateRef}
              onClick={() => {
                if (searchParams.tripType !== 'roundtrip') {
                  // Switch to round trip automatically
                  setSearchParams((prev) => ({
                    ...prev,
                    tripType: 'roundtrip',
                    returnDate: prev.returnDate || '2026-11-07',
                    returnDisplayDate: prev.returnDisplayDate || "07 Nov'26",
                    returnDay: prev.returnDay || 'Saturday'
                  }));
                }
                setIsRetDateOpen(!isRetDateOpen);
                setIsFromOpen(false);
                setIsToOpen(false);
                setIsTravellersOpen(false);
                setIsDepDateOpen(false);
              }}
              className={`md:col-span-2 p-4 transition-colors cursor-pointer relative ${
                searchParams.tripType === 'roundtrip' ? 'hover:bg-blue-50/30' : 'bg-slate-50/60'
              }`}
            >
              <div className="flex items-center gap-1 mb-1">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Return</span>
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>

              {searchParams.tripType === 'roundtrip' ? (
                <>
                  <p className="text-2xl font-black text-slate-900 leading-none tracking-tight">
                    {searchParams.returnDisplayDate?.split(' ')[0]} <span className="text-xl font-bold">{searchParams.returnDisplayDate?.split(' ')[1] || "Nov'26"}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">{searchParams.returnDay}</p>
                </>
              ) : (
                <p className="text-[11px] text-slate-400 font-medium leading-snug mt-1">
                  Tap to add a return date for bigger discounts
                </p>
              )}

              {/* Return date popover */}
              {isRetDateOpen && searchParams.tripType === 'roundtrip' && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 p-4 animate-fadeIn"
                >
                  <div className="text-xs font-bold text-slate-800 mb-2">Select Return Date</div>
                  <input
                    type="date"
                    min={searchParams.departureDate}
                    value={searchParams.returnDate || '2026-11-07'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const dateObj = parseLocalDate(val);
                      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                      const dayNum = dateObj.getDate();
                      const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
                      const year = String(dateObj.getFullYear()).slice(-2);
                      setSearchParams((prev) => ({
                        ...prev,
                        returnDate: val,
                        returnDisplayDate: `${dayNum} ${monthName}'${year}`,
                        returnDay: dayName,
                      }));
                      setIsRetDateOpen(false);
                    }}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#065AF3]"
                  />
                  <button
                    onClick={() => {
                      setSearchParams((prev) => ({
                        ...prev,
                        tripType: 'oneway',
                        returnDate: undefined,
                        returnDisplayDate: undefined,
                        returnDay: undefined,
                      }));
                      setIsRetDateOpen(false);
                    }}
                    className="mt-2 text-xs text-red-500 font-semibold hover:underline block cursor-pointer"
                  >
                    Switch back to One Way
                  </button>
                </div>
              )}
            </div>

            {/* 5. Travellers (col-span-2) - Label changed from TRAVELLERS & CLASS to TRAVELLERS as requested */}
            <div 
              ref={travellersRef}
              onClick={() => {
                setIsTravellersOpen(!isTravellersOpen);
                setIsFromOpen(false);
                setIsToOpen(false);
                setIsDepDateOpen(false);
                setIsRetDateOpen(false);
              }}
              className="md:col-span-2 p-4 hover:bg-blue-50/30 transition-colors cursor-pointer rounded-r-xl relative"
            >
              <div className="flex items-center gap-1 mb-1">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">TRAVELLERS</span>
                <svg className="w-3.5 h-3.5 text-[#065AF3]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none tracking-tight">
                {searchParams.adults + searchParams.children}{' '}
                <span className="text-base font-semibold text-slate-700">
                  {searchParams.adults + searchParams.children === 1 ? 'Adult' : 'Travellers'}
                </span>
              </p>
              <p className="text-xs text-slate-500 truncate mt-1.5 font-medium">
                {searchParams.cabinClass}
              </p>

              {/* Travellers Dropdown Popover */}
              {isTravellersOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 p-4 animate-fadeIn"
                >
                  <div className="space-y-4">
                    {/* Adults counter */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-900">Adults</div>
                        <div className="text-[11px] text-slate-400">12 yrs & above</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={searchParams.adults <= 1}
                          onClick={() => setSearchParams((prev) => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))}
                          className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{searchParams.adults}</span>
                        <button
                          type="button"
                          disabled={searchParams.adults >= 9}
                          onClick={() => setSearchParams((prev) => ({ ...prev, adults: Math.min(9, prev.adults + 1) }))}
                          className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children counter */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-900">Children</div>
                        <div className="text-[11px] text-slate-400">2 - 12 yrs</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={searchParams.children <= 0}
                          onClick={() => setSearchParams((prev) => ({ ...prev, children: Math.max(0, prev.children - 1) }))}
                          className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{searchParams.children}</span>
                        <button
                          type="button"
                          disabled={searchParams.children >= 6}
                          onClick={() => setSearchParams((prev) => ({ ...prev, children: Math.min(6, prev.children + 1) }))}
                          className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Cabin Class Selection */}
                    <div>
                      <div className="text-xs font-bold text-slate-800 mb-2">Cabin Class</div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {(['Economy', 'Premium Economy', 'Business'] as const).map((cls) => (
                          <label
                            key={cls}
                            className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                              searchParams.cabinClass === cls
                                ? 'border-[#065AF3] bg-blue-50/60 text-[#065AF3]'
                                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{cls}</span>
                            <input
                              type="radio"
                              name="cabinClass"
                              checked={searchParams.cabinClass === cls}
                              onChange={() => setSearchParams((prev) => ({ ...prev, cabinClass: cls }))}
                              className="accent-[#065AF3]"
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsTravellersOpen(false)}
                      className="w-full py-2 bg-[#065AF3] hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Special Fares */}
          <div className="flex flex-wrap items-center gap-3 pt-1" data-purpose="special-fares-row">
            <span className="text-xs font-bold text-slate-800 mr-1 shrink-0">Select a special fare:</span>

            {/* 1. Regular */}
            <div 
              onClick={() => setSearchParams((prev) => ({ ...prev, specialFare: 'Regular' }))}
              className={`flex flex-col px-3 py-1.5 rounded-lg border cursor-pointer text-left transition-all ${
                searchParams.specialFare === 'Regular'
                  ? 'border-[#065AF3] bg-blue-50/60'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {searchParams.specialFare === 'Regular' ? (
                  <div className="w-3 h-3 rounded-full border border-[#065AF3] flex items-center justify-center bg-[#065AF3]">
                    <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                ) : (
                  <div className="w-3 h-3 rounded-full border border-slate-300"></div>
                )}
                <span className={`text-xs font-bold ${searchParams.specialFare === 'Regular' ? 'text-[#065AF3]' : 'text-slate-800'}`}>
                  Regular
                </span>
              </div>
              <span className="text-[10px] text-slate-500 pl-4.5">Regular fares</span>
            </div>

            {/* 2. Student */}
            <div 
              onClick={() => setSearchParams((prev) => ({ ...prev, specialFare: 'Student' }))}
              className={`flex flex-col px-3 py-1.5 rounded-lg border cursor-pointer text-left transition-all ${
                searchParams.specialFare === 'Student'
                  ? 'border-[#065AF3] bg-blue-50/60'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className={`text-xs font-bold ${searchParams.specialFare === 'Student' ? 'text-[#065AF3]' : 'text-slate-800'}`}>
                Student
              </span>
              <span className="text-[10px] text-slate-500">Extra discounts/baggage</span>
            </div>

            {/* 3. Armed Forces */}
            <div 
              onClick={() => setSearchParams((prev) => ({ ...prev, specialFare: 'Armed Forces' }))}
              className={`flex flex-col px-3 py-1.5 rounded-lg border cursor-pointer text-left transition-all ${
                searchParams.specialFare === 'Armed Forces'
                  ? 'border-[#065AF3] bg-blue-50/60'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className={`text-xs font-bold ${searchParams.specialFare === 'Armed Forces' ? 'text-[#065AF3]' : 'text-slate-800'}`}>
                Armed Forces
              </span>
              <span className="text-[10px] text-slate-500">Up to ₹600 off</span>
            </div>

            {/* 4. Senior Citizen */}
            <div 
              onClick={() => setSearchParams((prev) => ({ ...prev, specialFare: 'Senior Citizen' }))}
              className={`flex flex-col px-3 py-1.5 rounded-lg border cursor-pointer text-left transition-all ${
                searchParams.specialFare === 'Senior Citizen'
                  ? 'border-[#065AF3] bg-blue-50/60'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className={`text-xs font-bold ${searchParams.specialFare === 'Senior Citizen' ? 'text-[#065AF3]' : 'text-slate-800'}`}>
                Senior Citizen
              </span>
              <span className="text-[10px] text-slate-500">Up to ₹600 off</span>
            </div>

            {/* 5. Doctor and Nurses */}
            <div 
              onClick={() => setSearchParams((prev) => ({ ...prev, specialFare: 'Doctor and Nurses' }))}
              className={`flex flex-col px-3 py-1.5 rounded-lg border cursor-pointer text-left transition-all ${
                searchParams.specialFare === 'Doctor and Nurses'
                  ? 'border-[#065AF3] bg-blue-50/60'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className={`text-xs font-bold ${searchParams.specialFare === 'Doctor and Nurses' ? 'text-[#065AF3]' : 'text-slate-800'}`}>
                Doctor and Nurses
              </span>
              <span className="text-[10px] text-slate-500">Up to ₹600 off</span>
            </div>
          </div>

          {/* CTA SEARCH Button (Overlapping Bottom Edge) */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-6">
            <button
              onClick={onSearch}
              className="bg-gradient-to-r from-[#065AF3] to-[#0084FF] hover:from-[#054ecf] hover:to-[#0074e0] text-white font-black text-lg tracking-wider px-14 py-3.5 rounded-full shadow-[0_10px_25px_rgba(6,90,243,0.45)] hover:shadow-[0_12px_28px_rgba(6,90,243,0.55)] transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
              type="button"
            >
              SEARCH
            </button>
          </div>
        </div>
      </main>

      {/* ===================== LOWER PART (Popular Routes, Banner, Offers, Benefits) ===================== */}
      <div className="w-full flex-1">
        {/* SECTION 1: Popular Flight Routes Card (3x3 Grid) */}
        <div className="pt-8 sm:pt-12 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="max-w-6xl mx-auto rounded-3xl p-6 sm:p-8 md:p-10 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-slate-100 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1A6BFF] text-xs font-bold tracking-wide uppercase mb-2">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path>
                  </svg>
                  Trending Fares
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Popular Flight Routes</h2>
                <p className="text-sm text-slate-500 mt-1">Explore top domestic getaways with instant lowest fare estimates</p>
              </div>
              <button
                onClick={() => onOpenComingSoon('All Domestic Routes Directory')}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1A6BFF] hover:text-[#0E55DF] transition-colors group self-start sm:self-auto cursor-pointer"
              >
                <span>Explore all routes</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2"></path>
                </svg>
              </button>
            </div>

            {/* 3x3 Grid of 9 destinations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {POPULAR_ROUTES.map((route) => (
                <div
                  key={route.city}
                  onClick={() => handleSelectPopularRoute(route.city)}
                  className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border border-slate-100 hover:border-[#1A6BFF]/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300 bg-[#F8FAFC] hover:bg-white cursor-pointer group"
                >
                  <img
                    alt={route.city}
                    className="w-12 h-12 rounded-full object-cover shadow-xs group-hover:scale-105 transition-transform shrink-0"
                    src={route.img}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-slate-800 group-hover:text-[#1A6BFF] transition-colors truncate">
                      {route.city}
                    </h3>
                    <p className="text-sm font-medium text-[#1A6BFF] mt-0.5">Flights from {route.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 2: TravelKart Wide Promo Banner */}
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-6 sm:my-8">
          <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-md bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white flex flex-col md:flex-row items-center justify-between p-8 md:p-10 relative gap-6">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#1A6BFF]/20 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center gap-5 z-10">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-white/20 shrink-0">
                <img
                  alt="Featured Travel Destination"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGrpBWHMzIGB1A3Gj49VitB6iRcktfn7LLqH__U-Xd-M1VqN-78WiQwrCnH8L4fXfNqfyY4UzJ21eDaVKLlXhp8CznIEFuIZZCdJPVIeRk2AuvBqUWze2GLVvSpRvCQMZ3NwZT9Bou7hWJ_xnutdgB_dJfErYOgvD-OxGRYXpXZq_WqtAdCC0TAUyvhC6vJYEIRQhHgeFnAFkKuLzDLyJAO3rlUONHPvQGFEEngJo"
                />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[11px] font-bold tracking-wider uppercase text-amber-300 mb-2 border border-white/10">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                  </svg>
                  Special Deal of the Season
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  Your next trip starts here. <br className="hidden sm:inline" />
                  <span className="text-amber-300">Book flights from ₹2,999</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg">
                  Unlock extra cashback, free cancellation perks, and special airline coupons on TravelKart.
                </p>
              </div>
            </div>

            <div className="shrink-0 z-10 w-full md:w-auto text-center">
              <button
                onClick={onSearch}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-8 py-3.5 rounded-full shadow-lg hover:shadow-orange-500/25 transition-all text-sm sm:text-base w-full md:w-auto cursor-pointer"
                type="button"
              >
                <span>Explore Now</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: Offers For You */}
        <section className="py-12 md:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-purpose="offers-section">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1A6BFF] text-xs font-bold tracking-wide uppercase mb-2">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.75 3.03v.568c0 .334.148.65.405.864l1.498 1.248c.453.378.747.933.747 1.54v.25c0 .607-.294 1.162-.747 1.54l-1.498 1.248a1.144 1.144 0 0 0-.405.864v1.546c0 .333.148.65.405.864l1.498 1.248c.453.378.747.933.747 1.54v.25c0 .607-.294 1.162-.747 1.54l-1.498 1.248a1.144 1.144 0 0 0-.405.864v.568a1.5 1.5 0 0 1-2.25 1.299l-7.5-4.33a1.5 1.5 0 0 1-.75-1.299v-8.66a1.5 1.5 0 0 1 .75-1.3l7.5-4.33a1.5 1.5 0 0 1 2.25 1.3Z"></path>
                </svg>
                Handpicked Savings
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Offers For You</h2>
              <p className="text-sm text-slate-500 mt-1">Exclusive promo codes, instant discounts, and airline deals</p>
            </div>
            <button
              onClick={() => onOpenComingSoon('All Deals & Promotions')}
              className="inline-flex items-center text-sm font-semibold text-[#1A6BFF] hover:text-[#0E55DF] transition-colors group cursor-pointer self-start sm:self-auto"
            >
              <span>View all deals</span>
              <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2"></path>
              </svg>
            </button>
          </div>

          {/* Category filter tabs: All Offers, Flights, Hotels, Holidays (Only highlight as requested) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-8">
            <button
              onClick={() => setActiveOfferTab('All')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                activeOfferTab === 'All'
                  ? 'bg-[#1A6BFF] text-white shadow-md shadow-blue-500/25'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-[#1A6BFF] hover:text-[#1A6BFF]'
              }`}
            >
              All Offers
            </button>
            <button
              onClick={() => setActiveOfferTab('Flights')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
                activeOfferTab === 'Flights'
                  ? 'bg-[#1A6BFF] text-white font-bold shadow-md shadow-blue-500/25'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-[#1A6BFF] hover:text-[#1A6BFF]'
              }`}
            >
              Flights
            </button>
            <button
              onClick={() => setActiveOfferTab('Hotels')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
                activeOfferTab === 'Hotels'
                  ? 'bg-[#1A6BFF] text-white font-bold shadow-md shadow-blue-500/25'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-[#1A6BFF] hover:text-[#1A6BFF]'
              }`}
            >
              Hotels
            </button>
            <button
              onClick={() => setActiveOfferTab('Holidays')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
                activeOfferTab === 'Holidays'
                  ? 'bg-[#1A6BFF] text-white font-bold shadow-md shadow-blue-500/25'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-[#1A6BFF] hover:text-[#1A6BFF]'
              }`}
            >
              Holidays
            </button>
          </div>

          {/* Grid of 4 offer cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Offer Card 1: Domestic Flights */}
            <div className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_36px_rgba(26,107,255,0.12)] transition-all duration-300 flex flex-col justify-between group ${
              activeOfferTab !== 'All' && activeOfferTab !== 'Flights' ? 'opacity-60' : 'opacity-100'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider bg-blue-100 text-[#1A6BFF] uppercase">Flights</span>
                  <span className="text-[11px] font-medium text-slate-400">Till 30 Nov</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1A6BFF] to-cyan-400 flex items-center justify-center text-white mb-3 shadow-md shadow-blue-500/20">
                  <svg className="w-5 h-5 transform -rotate-45" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"></path>
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1A6BFF] transition-colors">
                  Flat 12% off on domestic flights
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Use ICICI Bank cards. Valid on all domestic routes.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between bg-slate-50 border border-dashed border-slate-300 rounded-lg p-2 mb-3">
                  <span className="text-xs font-mono font-bold text-slate-800 tracking-wider">FLYKART12</span>
                  <button
                    onClick={() => handleCopyCode('FLYKART12')}
                    type="button"
                    className="text-[11px] font-semibold text-[#1A6BFF] hover:underline cursor-pointer"
                  >
                    {copiedCode === 'FLYKART12' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <button
                  onClick={onSearch}
                  className="w-full py-2.5 rounded-xl bg-[#1A6BFF] hover:bg-[#0E55DF] text-white text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  Book Now
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Offer Card 2: Hotels */}
            <div className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_36px_rgba(26,107,255,0.12)] transition-all duration-300 flex flex-col justify-between group ${
              activeOfferTab !== 'All' && activeOfferTab !== 'Hotels' ? 'opacity-60' : 'opacity-100'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider bg-orange-100 text-[#FF8A00] uppercase">Hotels</span>
                  <span className="text-[11px] font-medium text-slate-400">Till 15 Dec</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF8A00] to-amber-400 flex items-center justify-center text-white mb-3 shadow-md shadow-orange-500/20">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 7h-8v8H3V3H1v18h2v-4h18v4h2V11c0-2.21-1.79-4-4-4zm-9 6H5v-4h5v4z"></path>
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#FF8A00] transition-colors">
                  Up to 40% off on hotels
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  On luxury stays and boutique homestays across India &amp; abroad.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between bg-slate-50 border border-dashed border-slate-300 rounded-lg p-2 mb-3">
                  <span className="text-xs font-mono font-bold text-slate-800 tracking-wider">STAYKART</span>
                  <button
                    onClick={() => handleCopyCode('STAYKART')}
                    type="button"
                    className="text-[11px] font-semibold text-[#FF8A00] hover:underline cursor-pointer"
                  >
                    {copiedCode === 'STAYKART' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <button
                  onClick={() => onOpenComingSoon('Hotels Booking')}
                  className="w-full py-2.5 rounded-xl bg-[#FF8A00] hover:bg-orange-600 text-white text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  Book Now
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Offer Card 3: Student Special */}
            <div className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_36px_rgba(26,107,255,0.12)] transition-all duration-300 flex flex-col justify-between group ${
              activeOfferTab !== 'All' && activeOfferTab !== 'Flights' ? 'opacity-60' : 'opacity-100'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider bg-emerald-100 text-emerald-700 uppercase">Special</span>
                  <span className="text-[11px] font-medium text-slate-400">Year-round</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white mb-3 shadow-md shadow-emerald-500/20">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"></path>
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Student special fares
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Extra 10kg baggage + flat ₹600 off with valid student ID card.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between bg-slate-50 border border-dashed border-slate-300 rounded-lg p-2 mb-3">
                  <span className="text-xs font-mono font-bold text-slate-800 tracking-wider">STUDSAVE</span>
                  <button
                    onClick={() => handleCopyCode('STUDSAVE')}
                    type="button"
                    className="text-[11px] font-semibold text-emerald-600 hover:underline cursor-pointer"
                  >
                    {copiedCode === 'STUDSAVE' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <button
                  onClick={() => {
                    setSearchParams((prev) => ({ ...prev, specialFare: 'Student' }));
                    onSearch();
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
                >
                  Book Student Fare
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Offer Card 4: Holiday Packages */}
            <div className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_36px_rgba(26,107,255,0.12)] transition-all duration-300 flex flex-col justify-between group ${
              activeOfferTab !== 'All' && activeOfferTab !== 'Holidays' ? 'opacity-60' : 'opacity-100'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider bg-purple-100 text-purple-700 uppercase">Holidays</span>
                  <span className="text-[11px] font-medium text-slate-400">Limited Period</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-400 flex items-center justify-center text-white mb-3 shadow-md shadow-purple-600/20">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7z"></path>
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                  Holiday packages from ₹9,999
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  All-inclusive 3N/4D packages with curated flights &amp; luxury stays.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between bg-slate-50 border border-dashed border-slate-300 rounded-lg p-2 mb-3">
                  <span className="text-xs font-mono font-bold text-slate-800 tracking-wider">WANDERLUST</span>
                  <button
                    onClick={() => handleCopyCode('WANDERLUST')}
                    type="button"
                    className="text-[11px] font-semibold text-purple-600 hover:underline cursor-pointer"
                  >
                    {copiedCode === 'WANDERLUST' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <button
                  onClick={() => onOpenComingSoon('Holiday Packages Booking')}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  Book Now
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: Why Book with TravelKart */}
        <section className="py-12 md:py-16 bg-white border-y border-slate-200/70" data-purpose="why-book-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-[#1A6BFF] text-xs font-bold tracking-wide uppercase">
                TRUSTED BY 20M+ TRAVELERS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                Why Book with TravelKart
              </h2>
              <p className="text-sm sm:text-base text-slate-500 mt-2">
                Trusted by over 20 million happy travelers across India &amp; worldwide
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Benefit 1 */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-100 hover:border-[#1A6BFF]/30 hover:bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#1A6BFF] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Best price guarantee</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Unbeatable fares with real-time price match and zero hidden fees.
                </p>
              </div>

              {/* Benefit 2 */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-100 hover:border-[#FF8A00]/30 hover:bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#FF8A00] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">24x7 customer support</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Dedicated round-the-clock assistance via chat, phone, and WhatsApp.
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-100 hover:border-emerald-500/30 hover:bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">100% secure payments</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Bank-grade 256-bit encryption with UPI, NetBanking, cards &amp; EMI.
                </p>
              </div>

              {/* Benefit 4 */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-100 hover:border-purple-500/30 hover:bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Easy &amp; fast cancellation</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Instant automated refunds directly to your source account.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer 
          onOpenComingSoon={onOpenComingSoon} 
          onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
        />
      </div>
    </div>
  );
};
