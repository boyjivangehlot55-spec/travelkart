import React from 'react';
import { BookingRecord } from '../types';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

import { User } from 'firebase/auth';

interface ConfirmationPageProps {
  bookingRecord: BookingRecord;
  onNavigateHome: () => void;
  onOpenComingSoon: (feature: string) => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onNavigateTrips: () => void;
  onNavigateWishlist: () => void;
}

export const ConfirmationPage: React.FC<ConfirmationPageProps> = ({
  bookingRecord,
  onNavigateHome,
  onOpenComingSoon,
  user,
  onSignIn,
  onSignOut,
  onNavigateTrips,
  onNavigateWishlist,
}) => {
  const { flight, searchParams, passengers, addOns, pricing, bookingId } = bookingRecord;
  const primaryPassenger = passengers[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#f9f9ff] font-body-md text-[#141b2b] antialiased min-h-screen flex flex-col">
      {/* Top Navbar */}
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

      <main className="w-full flex-1 pt-6 pb-16 bg-[#f9f9ff]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Progress Stepper with Step 5 Complete */}
          <section className="w-full bg-white rounded-full p-2 shadow-xs mb-6">
            <div className="flex items-center justify-between px-4 py-1 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 text-[#0053d3] text-xs font-semibold shrink-0">
                <div className="w-6 h-6 rounded-full bg-[#0053d3]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </div>
                <span>1. Review</span>
              </div>
              <div className="flex-1 h-0.5 mx-2 bg-[#0053d3] min-w-3"></div>

              <div className="flex items-center gap-1.5 text-[#0053d3] text-xs font-semibold shrink-0">
                <div className="w-6 h-6 rounded-full bg-[#0053d3]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </div>
                <span>2. Travellers</span>
              </div>
              <div className="flex-1 h-0.5 mx-2 bg-[#0053d3] min-w-3"></div>

              <div className="flex items-center gap-1.5 text-[#0053d3] text-xs font-semibold shrink-0">
                <div className="w-6 h-6 rounded-full bg-[#0053d3]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </div>
                <span>3. Add-ons</span>
              </div>
              <div className="flex-1 h-0.5 mx-2 bg-[#0053d3] min-w-3"></div>

              <div className="flex items-center gap-1.5 text-[#0053d3] text-xs font-semibold shrink-0">
                <div className="w-6 h-6 rounded-full bg-[#0053d3]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </div>
                <span>4. Payment</span>
              </div>
              <div className="flex-1 h-0.5 mx-2 bg-[#0053d3] min-w-3"></div>

              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold shrink-0">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </div>
                <span>5. Confirmed</span>
              </div>
            </div>
          </section>

          {/* Success Banner Card */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-3xl text-white">verified</span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-200">
                  Congratulations!
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
                  Booking Confirmed!
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                  Confirmation e-ticket sent to <strong className="text-white">{primaryPassenger?.email}</strong>
                </p>
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-xs px-5 py-3 rounded-xl border border-white/20 text-center shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200 block">
                Booking Reference ID
              </span>
              <span className="text-2xl font-black font-mono tracking-widest text-white">
                {bookingId}
              </span>
            </div>
          </div>

          {/* Confirmation Details Card */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-6 sm:p-8 space-y-6">
            {/* Flight Summary Box */}
            <div className="border border-slate-200 rounded-xl p-5 bg-[#f9f9ff]">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#0053d3] flex items-center justify-center text-white font-extrabold text-xs">
                    {flight.airlineCode}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#141b2b]">
                      {flight.airline} • {flight.flightNumber}
                    </h3>
                    <p className="text-xs text-slate-500">{flight.aircraft}</p>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <span className="font-semibold text-[#141b2b]">{searchParams.departureDay}, {searchParams.departureDisplayDate}</span>
                  <span className="block text-slate-400">{searchParams.cabinClass}</span>
                </div>
              </div>

              {/* Timing & Leg breakdown */}
              <div className="py-4 grid grid-cols-12 items-center gap-2">
                <div className="col-span-4 text-left">
                  <div className="text-2xl font-extrabold text-[#141b2b]">{flight.departureTime}</div>
                  <div className="text-sm font-bold text-[#0053d3]">{searchParams.fromCity.name} ({searchParams.fromCity.code})</div>
                  <div className="text-xs text-slate-500">{flight.originTerminal}</div>
                </div>

                <div className="col-span-4 flex flex-col items-center justify-center">
                  <span className="text-xs text-slate-400 font-semibold mb-1">{flight.duration}</span>
                  <div className="w-full flex items-center relative my-1">
                    <div className="w-2 h-2 rounded-full bg-[#0053d3]"></div>
                    <div className="flex-1 h-0.5 bg-[#b3c5ff] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px] text-[#0053d3] bg-white px-1 rotate-90">
                        flight
                      </span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-[#0053d3]"></div>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 text-center">
                    {flight.viaCity ? `${flight.stopsLabel} via ${flight.viaCity}` : flight.stopsLabel}
                  </span>
                </div>

                <div className="col-span-4 text-right">
                  <div className="text-2xl font-extrabold text-[#141b2b] inline-flex items-baseline justify-end gap-1.5 whitespace-nowrap">
                    <span>{flight.arrivalTime}</span>
                    {flight.arrivalTime < flight.departureTime && (
                      <span className="text-[11px] font-bold text-[#ab3500] leading-none">+1 day</span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-[#0053d3]">{searchParams.toCity.name} ({searchParams.toCity.code})</div>
                  <div className="text-xs text-slate-500">{flight.destTerminal}</div>
                </div>
              </div>
            </div>

            {/* Passenger & Add-ons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Passenger Info */}
              <div className="bg-[#f1f3ff] rounded-xl p-5">
                <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3">
                  Passenger Details ({passengers.length} {passengers.length === 1 ? 'Traveller' : 'Travellers'})
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-slate-500 block">Passengers:</span>
                    {passengers.map((p) => {
                      const title = p.gender === 'Male' ? 'Mr.' : p.gender === 'Female' ? 'Ms.' : '';
                      return (
                        <div key={p.id} className="flex items-center justify-between gap-2 bg-white/80 rounded-lg px-3 py-1.5">
                          <span className="text-sm font-bold text-[#141b2b]">
                            {title ? `${title} ` : ''}{p.firstName} {p.lastName}
                          </span>
                          <span className="text-[11px] font-semibold text-[#0053d3] shrink-0">
                            {p.label}{p.type === 'Child' && p.age ? ` • Age ${p.age} yrs` : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <span className="text-slate-500 block">Primary Contact:</span>
                    <span className="font-semibold text-[#141b2b]">
                      +91 {primaryPassenger?.mobile} • {primaryPassenger?.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Baggage Allowance:</span>
                    <span className="font-semibold text-[#141b2b]">
                      Cabin {flight.baggage.cabin} / Check-in {flight.baggage.checkIn}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment & Add-ons Summary */}
              <div className="bg-[#f1f3ff] rounded-xl p-5">
                <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3">
                  Payment &amp; Add-ons
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Gateway:</span>
                    <span className="font-bold text-[#141b2b] uppercase">{bookingRecord.paymentMethod} (Paid)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Selected Add-ons:</span>
                    <span className="font-semibold text-[#141b2b]">
                      {[
                        addOns.seatSelection && 'Seat Selection',
                        addOns.meal && 'Meal',
                        addOns.insurance && 'Travel Insurance',
                      ].filter(Boolean).join(', ') || 'None'}
                    </span>
                  </div>
                  {pricing.couponApplied && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Promo Applied:</span>
                      <span>{pricing.couponApplied} (-₹{pricing.discount})</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="text-xs font-bold text-[#141b2b]">Total Paid:</span>
                    <span className="text-lg font-black text-[#0053d3]">
                      ₹{pricing.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions: Download / Print E-Ticket & Back to Home */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <button
                onClick={handlePrint}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Print / Download E-Ticket</span>
              </button>

              <button
                onClick={onNavigateHome}
                className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#0053d3] hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                type="button"
              >
                <span>Back to Home</span>
                <span className="material-symbols-outlined text-[18px]">home</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer
        onOpenComingSoon={onOpenComingSoon}
        onNavigateHome={onNavigateHome}
      />
    </div>
  );
};
