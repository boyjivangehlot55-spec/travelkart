import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { WishlistItem } from '../types';
import { getTodayDateString } from '../data/flightData';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface WishlistPageProps {
  items: WishlistItem[];
  user: User | null;
  authReady: boolean;
  isLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onNavigateHome: () => void;
  onNavigateTrips: () => void;
  onNavigateWishlist: () => void;
  onRemoveItem: (itemId: string) => void;
  onBookItem: (item: WishlistItem) => void;
  onOpenComingSoon: (feature: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  items,
  user,
  authReady,
  isLoading,
  onSignIn,
  onSignOut,
  onNavigateHome,
  onNavigateTrips,
  onNavigateWishlist,
  onRemoveItem,
  onBookItem,
  onOpenComingSoon,
}) => {
  const [expiredItemId, setExpiredItemId] = useState<string | null>(null);
  const todayIso = getTodayDateString();

  return (
    <div className="bg-[#f9f9ff] font-body-md text-[#141b2b] antialiased min-h-screen flex flex-col">
      <Navbar
        variant="dark"
        user={user}
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        onNavigateHome={onNavigateHome}
        onNavigateTrips={onNavigateTrips}
        onNavigateWishlist={onNavigateWishlist}
        onOpenComingSoon={onOpenComingSoon}
      />

      <main className="w-full flex-1 pt-8 pb-16 bg-[#f1f3ff]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141b2b] tracking-tight">
                Wishlist
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {user
                  ? `${items.length} saved ${items.length === 1 ? 'flight' : 'flights'} for ${user.displayName || user.email || 'your account'}`
                  : 'Sign in with Google to save and view your favourite flights'}
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateHome}
              className="px-5 py-2.5 rounded-full bg-[#0053d3] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">search</span>
              <span>Explore Flights</span>
            </button>
          </div>

          {/* Signed-out Prompt */}
          {authReady && !user && (
            <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">favorite</span>
              </div>
              <h2 className="text-lg font-bold text-[#141b2b]">Sign in to access your Wishlist</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Save flights while browsing results and revisit them anytime from your Google account.
              </p>
              <button
                type="button"
                onClick={onSignIn}
                className="mt-5 px-6 py-2.5 rounded-full bg-[#0053d3] hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                Login or Create Account
              </button>
            </div>
          )}

          {/* Loading State */}
          {user && isLoading && (
            <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-10 text-center">
              <p className="text-sm font-semibold text-slate-500">Loading your wishlist...</p>
            </div>
          )}

          {/* Empty State */}
          {user && !isLoading && items.length === 0 && (
            <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">favorite_border</span>
              </div>
              <h2 className="text-lg font-bold text-[#141b2b]">No saved flights yet</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Tap the heart icon on any flight card in the search results to save it here.
              </p>
              <button
                type="button"
                onClick={onNavigateHome}
                className="mt-5 px-6 py-2.5 rounded-full bg-[#0053d3] hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                Search Flights
              </button>
            </div>
          )}

          {/* Saved Flights Stack */}
          {user && items.length > 0 && (
            <div className="space-y-4">
              {items.map((item) => {
                const { flight, fromCity, toCity } = item;
                const badgeColor =
                  flight.airlineCode === '6E'
                    ? 'bg-[#1a6bff] text-white'
                    : flight.airlineCode === 'QP'
                    ? 'bg-[#fe6a34] text-white'
                    : flight.airlineCode === 'AI'
                    ? 'bg-[#ba1a1a] text-white'
                    : flight.airlineCode === 'IX'
                    ? 'bg-[#5d1900] text-[#ffdbd0]'
                    : 'bg-[#ab3500] text-white';

                return (
                  <article
                    key={item.itemId}
                    className="bg-white rounded-2xl shadow-xs border border-slate-100 p-5 sm:p-6"
                  >
                    {/* Top Route + Travel Date Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
                      <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-bold text-[#141b2b]">
                        <span>
                          {fromCity.name} ({fromCity.code}) → {toCity.name} ({toCity.code})
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs sm:text-sm font-semibold text-[#0053d3]">
                          {item.travelDate}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#f1f3ff] text-[#141b2b] text-[10px] font-bold">
                          {item.cabinClass}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.itemId)}
                        title="Remove from Wishlist"
                        aria-label="Remove from Wishlist"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        <span>Remove</span>
                      </button>
                    </div>

                    {/* Flight Card Row */}
                    <div className="pt-4 grid grid-cols-12 gap-4 items-center">
                      {/* Airline */}
                      <div className="col-span-12 sm:col-span-4 flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shadow-xs shrink-0 ${badgeColor}`}
                        >
                          <span className="text-base">{flight.airlineCode}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-base font-bold text-[#141b2b] truncate">
                            {flight.airline}
                          </div>
                          <div className="text-xs text-slate-400">
                            {flight.flightNumber} • {flight.aircraft}
                          </div>
                        </div>
                      </div>

                      {/* Timings */}
                      <div className="col-span-12 sm:col-span-5 flex items-center justify-between px-1">
                        <div className="text-left shrink-0">
                          <div className="text-xl font-bold text-[#141b2b]">
                            {flight.departureTime}
                          </div>
                          <div className="text-xs font-bold text-[#424655]">{fromCity.code}</div>
                        </div>

                        <div className="flex-1 px-3 flex flex-col items-center">
                          <span className="text-[11px] text-slate-500 font-semibold mb-1.5 leading-none whitespace-nowrap">
                            {flight.duration}
                          </span>
                          <div className="relative w-full h-6 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-slate-200"></div>
                            <span className="material-symbols-outlined absolute text-[18px] leading-none text-[#fe6a34] rotate-90 bg-white px-1">
                              flight
                            </span>
                          </div>
                          <span className="mt-1.5 text-[10px] text-slate-500 leading-tight text-center">
                            {flight.viaCity ? `${flight.stopsLabel} via ${flight.viaCity}` : flight.stopsLabel}
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xl font-bold text-[#141b2b] inline-flex items-baseline justify-end gap-1 whitespace-nowrap">
                            <span>{flight.arrivalTime}</span>
                            {flight.arrivalTime < flight.departureTime && (
                              <span className="text-[10px] font-bold text-[#ab3500] leading-none">
                                +1 day
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-[#424655]">{toCity.code}</div>
                        </div>
                      </div>

                      {/* Price & Book CTA */}
                      <div className="col-span-12 sm:col-span-3 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 gap-2">
                        <div className="text-left sm:text-right">
                          <div className="text-xl font-extrabold text-[#141b2b]">
                            ₹{flight.basePrice.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-slate-400">per adult + taxes</div>
                        </div>
                        <div className="flex flex-col items-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.departureDateIso < todayIso) {
                                setExpiredItemId(item.itemId);
                                return;
                              }
                              setExpiredItemId(null);
                              onBookItem(item);
                            }}
                            className="sm:mt-1 px-6 py-2 rounded-full bg-[#0053d3] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Book
                          </button>
                          {expiredItemId === item.itemId && (
                            <p className="mt-1.5 text-[11px] font-semibold text-red-600 text-right">
                              This flight date has passed
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer onOpenComingSoon={onOpenComingSoon} onNavigateHome={onNavigateHome} />
    </div>
  );
};
