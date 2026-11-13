import React from 'react';

interface FooterProps {
  onOpenComingSoon: (feature: string) => void;
  onNavigateHome: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenComingSoon, onNavigateHome }) => {
  return (
    <footer className="w-full bg-[#0B132B] text-slate-300 pt-16 pb-12 border-t border-slate-800" data-purpose="footer-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top row with TravelKart airplane logo, statement & app downloads */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 pb-14 border-b border-slate-800">
          <div className="lg:col-span-2">
            <div 
              onClick={onNavigateHome} 
              className="flex items-center gap-2.5 mb-4 cursor-pointer group"
            >
              {/* Airplane Logo Badge - Never shopping cart */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF7A00] to-[#FFB020] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-white -rotate-45" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"></path>
                </svg>
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Travel<span className="text-[#FF8A00]">Kart</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mb-6">
              TravelKart is India's fastest-growing online travel booking platform, bringing effortless flight reservations, budget &amp; luxury hotels, and custom holiday experiences to millions.
            </p>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Download Mobile App</h4>
              <div className="flex flex-wrap gap-2.5">
                {/* Google Play Badge */}
                <button
                  onClick={() => onOpenComingSoon('Google Play App Download')}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors cursor-pointer text-left"
                  type="button"
                >
                  <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186c-.378-.363-.61-.87-.61-1.436V3.25c0-.566.232-1.073.61-1.436zm11.235 11.235L5.787 22.106l10.978-6.338-1.921-2.719zm0-2.098L16.765 8.23 5.787 1.894l9.057 9.057zm1.098 1.049l3.541 2.044c.942.544.942 1.43 0 1.974l-3.541 2.044-1.637-2.316 1.637-3.746z"></path>
                  </svg>
                  <div className="text-left">
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 leading-none">Get it on</div>
                    <div className="text-xs font-semibold text-white leading-tight">Google Play</div>
                  </div>
                </button>
                {/* App Store Badge */}
                <button
                  onClick={() => onOpenComingSoon('iOS App Store Download')}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors cursor-pointer text-left"
                  type="button"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.76 1.05-1.81.93-2.87-.9.04-2.03.6-2.68 1.36-.57.65-1.07 1.72-.94 2.74 1.01.08 2.07-.47 2.69-1.23z"></path>
                  </svg>
                  <div className="text-left">
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 leading-none">Download on</div>
                    <div className="text-xs font-semibold text-white leading-tight">App Store</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Column 1: Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Company</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><button onClick={() => onOpenComingSoon('About Us')} className="hover:text-white transition-colors cursor-pointer text-left">About Us</button></li>
              <li><button onClick={() => onOpenComingSoon('Careers')} className="hover:text-white transition-colors cursor-pointer text-left">Careers</button></li>
              <li><button onClick={() => onOpenComingSoon('Press & Media')} className="hover:text-white transition-colors cursor-pointer text-left">Press &amp; Media</button></li>
              <li><button onClick={() => onOpenComingSoon('Blog')} className="hover:text-white transition-colors cursor-pointer text-left">Blog</button></li>
              <li><button onClick={() => onOpenComingSoon('Sustainability')} className="hover:text-white transition-colors cursor-pointer text-left">Sustainability</button></li>
            </ul>
          </div>

          {/* Column 2: Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Support</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><button onClick={() => onOpenComingSoon('Help Center')} className="hover:text-white transition-colors cursor-pointer text-left">Help Center</button></li>
              <li><button onClick={() => onOpenComingSoon('Manage Bookings')} className="hover:text-white transition-colors cursor-pointer text-left">Manage Bookings</button></li>
              <li><button onClick={() => onOpenComingSoon('Baggage Guide')} className="hover:text-white transition-colors cursor-pointer text-left">Baggage Guide</button></li>
              <li><button onClick={() => onOpenComingSoon('Special Assistance')} className="hover:text-white transition-colors cursor-pointer text-left">Special Assistance</button></li>
              <li><button onClick={() => onOpenComingSoon('FAQs')} className="hover:text-white transition-colors cursor-pointer text-left">FAQs</button></li>
              <li><button onClick={() => onOpenComingSoon('Contact Us')} className="hover:text-white transition-colors cursor-pointer text-left">Contact Us</button></li>
            </ul>
          </div>

          {/* Column 3: Explore */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Explore</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><button onClick={onNavigateHome} className="hover:text-white transition-colors cursor-pointer text-left">Domestic Flights</button></li>
              <li><button onClick={() => onOpenComingSoon('International Flights')} className="hover:text-white transition-colors cursor-pointer text-left">International Flights</button></li>
              <li><button onClick={() => onOpenComingSoon('Luxury Hotels')} className="hover:text-white transition-colors cursor-pointer text-left">Luxury Hotels</button></li>
              <li><button onClick={() => onOpenComingSoon('Homestays')} className="hover:text-white transition-colors cursor-pointer text-left">Homestays</button></li>
              <li><button onClick={() => onOpenComingSoon('Holiday Ideas')} className="hover:text-white transition-colors cursor-pointer text-left">Holiday Ideas</button></li>
              <li><button onClick={() => onOpenComingSoon('Travel Insurance')} className="hover:text-white transition-colors cursor-pointer text-left">Travel Insurance</button></li>
            </ul>
          </div>

          {/* Column 4: Follow Us & Newsletter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Follow Us</h4>
            <div className="flex items-center gap-2 mb-5">
              <button 
                onClick={() => onOpenComingSoon('Facebook')}
                aria-label="Facebook" 
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#1A6BFF] flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"></path></svg>
              </button>
              <button 
                onClick={() => onOpenComingSoon('Twitter / X')}
                aria-label="X Twitter" 
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
              </button>
              <button 
                onClick={() => onOpenComingSoon('Instagram')}
                aria-label="Instagram" 
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-pink-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
              </button>
              <button 
                onClick={() => onOpenComingSoon('LinkedIn')}
                aria-label="LinkedIn" 
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.761-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
              </button>
              <button 
                onClick={() => onOpenComingSoon('YouTube')}
                aria-label="YouTube" 
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path></svg>
              </button>
            </div>
            <div className="mt-4">
              <label className="text-[11px] text-slate-400 block mb-2 font-medium" htmlFor="newsletter-email">
                Subscribe for secret flight drops
              </label>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  onOpenComingSoon('Newsletter Subscription');
                }}
                className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700/80 focus-within:border-[#1A6BFF]"
              >
                <input
                  className="bg-transparent border-0 text-white text-xs px-2.5 py-1.5 focus:ring-0 w-full placeholder:text-slate-500 outline-none"
                  id="newsletter-email"
                  placeholder="Enter your email"
                  type="email"
                />
                <button 
                  type="submit"
                  className="bg-[#1A6BFF] hover:bg-[#0E55DF] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom footer bar - Updated with year 2026 */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="order-2 sm:order-1 text-center sm:text-left">
            © 2026 TravelKart. Educational project. All rights reserved.
          </p>
          <div className="order-1 sm:order-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-slate-400">
            <button onClick={() => onOpenComingSoon('Privacy Policy')} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button>
            <span className="text-slate-700">|</span>
            <button onClick={() => onOpenComingSoon('Terms of Service')} className="hover:text-white transition-colors cursor-pointer">Terms of Service</button>
            <span className="text-slate-700">|</span>
            <button onClick={() => onOpenComingSoon('Security')} className="hover:text-white transition-colors cursor-pointer">Security</button>
            <span className="text-slate-700">|</span>
            <button onClick={() => onOpenComingSoon('Site Map')} className="hover:text-white transition-colors cursor-pointer">Site Map</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
