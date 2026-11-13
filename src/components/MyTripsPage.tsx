import React from 'react';
import { User } from 'firebase/auth';
import { TripRecord } from '../types';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface MyTripsPageProps {
  trips: TripRecord[];
  user: User | null;
  authReady: boolean;
  isLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onNavigateHome: () => void;
  onNavigateTrips: () => void;
  onNavigateWishlist: () => void;
  onOpenComingSoon: (feature: string) => void;
}

export const MyTripsPage: React.FC<MyTripsPageProps> = ({
  trips,
  user,
  authReady,
  isLoading,
  onSignIn,
  onSignOut,
  onNavigateHome,
  onNavigateTrips,
  onNavigateWishlist,
  onOpenComingSoon,
}) => {
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
                My Trips
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {user
                  ? `Showing confirmed flight bookings for ${user.displayName || user.email || 'your account'}`
                  : 'Sign in with Google to view your saved flight bookings'}
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateHome}
              className="px-5 py-2.5 rounded-full bg-[#0053d3] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">flight_takeoff</span>
              <span>Search Flights</span>
            </button>
          </div>

          {/* Signed-out Prompt */}
          {authReady && !user && (
            <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-[#e9edff] text-[#0053d3] flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">account_circle</span>
              </div>
              <h2 className="text-lg font-bold text-[#141b2b]">Sign in to see your trips</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Sign in with your Google account to access your confirmed itineraries and booking history across sessions.
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
              <p className="text-sm font-semibold text-slate-500">Loading your trips...</p>
            </div>
          )}

          {/* Empty State */}
          {user && !isLoading && trips.length === 0 && (
            <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-[#e9edff] text-[#0053d3] flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">luggage</span>
              </div>
              <h2 className="text-lg font-bold text-[#141b2b]">No trips yet</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Confirmed flight bookings will appear here automatically.
              </p>
              <button
                type="button"
                onClick={onNavigateHome}
                className="mt-5 px-6 py-2.5 rounded-full bg-[#0053d3] hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                Book a Flight
              </button>
            </div>
          )}

          {/* Trips List (Newest First) */}
          {user && trips.length > 0 && (
            <div className="space-y-5">
              {trips.map((trip) => {
                const { flight, fromCity, toCity, passengers, pricing } = trip;
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
                    key={trip.bookingId}
                    className="bg-white rounded-2xl shadow-xs border border-slate-100 p-5 sm:p-6 space-y-5"
                  >
                    {/* Card Header: Booking ID + Both Dates */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${badgeColor}`}>
                          {flight.airlineCode}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-bold text-[#141b2b]">
                              {fromCity.name} ({fromCity.code}) → {toCity.name} ({toCity.code})
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                              Confirmed
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {flight.airline} • {flight.flightNumber} • {trip.cabinClass}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end text-left sm:text-right">
                        <span className="px-2.5 py-1 rounded-lg bg-[#e9edff] text-[#0053d3] font-mono text-xs font-extrabold tracking-wider">
                          ID: {trip.bookingId}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-1">
                          Booked on <strong className="text-slate-600">{trip.bookingDate}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Flight Timings Row */}
                    <div className="bg-[#f9f9ff] rounded-xl p-4 border border-slate-100 grid grid-cols-12 items-center gap-3">
                      <div className="col-span-4 text-left">
                        <div className="text-xl sm:text-2xl font-extrabold text-[#141b2b]">
                          {flight.departureTime}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-[#0053d3]">
                          {fromCity.name} ({fromCity.code})
                        </div>
                        <div className="text-[11px] text-slate-500">{flight.originTerminal}</div>
                      </div>

                      <div className="col-span-4 flex flex-col items-center justify-center">
                        <span className="text-[11px] text-slate-500 font-semibold mb-1">
                          {flight.duration}
                        </span>
                        <div className="w-full flex items-center relative my-1">
                          <div className="w-2 h-2 rounded-full bg-[#0053d3]"></div>
                          <div className="flex-1 h-0.5 bg-[#b3c5ff] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[16px] text-[#0053d3] bg-[#f9f9ff] px-1 rotate-90">
                              flight
                            </span>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-[#0053d3]"></div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase mt-1 text-center">
                          {flight.viaCity ? `${flight.stopsLabel} via ${flight.viaCity}` : flight.stopsLabel}
                        </span>
                      </div>

                      <div className="col-span-4 text-right">
                        <div className="text-xl sm:text-2xl font-extrabold text-[#141b2b] inline-flex items-baseline justify-end gap-1 whitespace-nowrap">
                          <span>{flight.arrivalTime}</span>
                          {flight.arrivalTime < flight.departureTime && (
                            <span className="text-[10px] font-bold text-[#ab3500] leading-none">
                              +1 day
                            </span>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-[#0053d3]">
                          {toCity.name} ({toCity.code})
                        </div>
                        <div className="text-[11px] text-slate-500">{flight.destTerminal}</div>
                      </div>
                    </div>

                    {/* Metadata Footer: Travel Date, Booking Date, Passengers, Total Paid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-1">
                      <div className="md:col-span-8 space-y-2">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
                          <span className="text-slate-500">
                            Travel Date:{' '}
                            <strong className="text-[#141b2b]">{trip.travelDate}</strong>
                          </span>
                          <span className="text-slate-500">
                            Booking Date:{' '}
                            <strong className="text-[#141b2b]">{trip.bookingDate}</strong>
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs text-slate-500 mr-1">
                            Passengers ({passengers.length}):
                          </span>
                          {passengers.map((p) => (
                            <span
                              key={p.id}
                              className="px-2.5 py-0.5 rounded-lg bg-[#f1f3ff] text-[#141b2b] text-[11px] font-semibold"
                            >
                              {p.firstName} {p.lastName} ({p.label}
                              {p.type === 'Child' && p.age ? `, ${p.age}y` : ''})
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-4 flex md:flex-col items-baseline md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0">
                        <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                          Total Paid
                        </span>
                        <span className="text-2xl font-black text-[#0053d3]">
                          ₹{(trip.totalAmount ?? pricing.totalAmount).toLocaleString('en-IN')}
                        </span>
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
