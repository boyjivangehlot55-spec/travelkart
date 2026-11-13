import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { Flight, SearchParams, PassengerDetails, AddOnsSelection, BookingRecord } from '../types';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface BookingPageProps {
  flight: Flight;
  searchParams: SearchParams;
  onProceedToPay: (record: BookingRecord) => Promise<void> | void;
  onBackToResults: () => void;
  onNavigateHome: () => void;
  onOpenComingSoon: (feature: string) => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onNavigateTrips: () => void;
  onNavigateWishlist: () => void;
  isSubmitting?: boolean;
  bookingError?: string | null;
}

interface PassengerErrors {
  firstName?: string;
  lastName?: string;
  age?: string;
  email?: string;
  mobile?: string;
}

function formatTravellersLabel(adults: number, children: number): string {
  const parts: string[] = [];
  if (adults > 0) parts.push(`${adults} ${adults === 1 ? 'Adult' : 'Adults'}`);
  if (children > 0) parts.push(`${children} ${children === 1 ? 'Child' : 'Children'}`);
  return parts.join(', ') || '1 Adult';
}

function buildInitialPassengers(adults: number, children: number): PassengerDetails[] {
  const list: PassengerDetails[] = [];
  const adultCount = Math.max(1, adults);

  for (let i = 1; i <= adultCount; i++) {
    const isPrimary = i === 1;
    list.push({
      id: `adult-${i}`,
      type: 'Adult',
      label: `Adult ${i}`,
      gender: 'Male',
      firstName: isPrimary ? 'Rahul' : '',
      lastName: isPrimary ? 'Sharma' : '',
      ...(isPrimary
        ? {
            email: 'rahul.sharma@example.com',
            mobile: '9876543210',
            saveTraveller: true,
          }
        : {}),
    });
  }

  for (let i = 1; i <= children; i++) {
    list.push({
      id: `child-${i}`,
      type: 'Child',
      label: `Child ${i}`,
      gender: 'Male',
      firstName: '',
      lastName: '',
      age: '',
    });
  }

  return list;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  flight,
  searchParams,
  onProceedToPay,
  onBackToResults,
  onNavigateHome,
  onOpenComingSoon,
  user,
  onSignIn,
  onSignOut,
  onNavigateTrips,
  onNavigateWishlist,
  isSubmitting = false,
  bookingError = null,
}) => {
  // Multi-passenger details state
  const [passengers, setPassengers] = useState<PassengerDetails[]>(() =>
    buildInitialPassengers(searchParams.adults, searchParams.children)
  );

  // Per-passenger validation errors keyed by passenger index
  const [errors, setErrors] = useState<Record<number, PassengerErrors>>({});

  // Add-ons selection state
  const [addOns, setAddOns] = useState<AddOnsSelection>({
    seatSelection: false,
    meal: false,
    insurance: true, // Default checked in Stitch file
  });

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>('FLYKART12');
  const [couponError, setCouponError] = useState<string | null>(null);

  // Pricing calculations (children pay the same fare as adults)
  const totalTravellers = searchParams.adults + searchParams.children;
  const travellersLabel = formatTravellersLabel(searchParams.adults, searchParams.children);
  const baseFare = flight.basePrice * totalTravellers;
  const taxes = 749 * totalTravellers;
  const udf = 100 * totalTravellers;
  const convenienceFee = 100;

  // Per-traveller add-ons price
  let addOnsTotal = 0;
  if (addOns.seatSelection) addOnsTotal += 250 * totalTravellers;
  if (addOns.meal) addOnsTotal += 350 * totalTravellers;
  if (addOns.insurance) addOnsTotal += 199 * totalTravellers;

  // Coupon discount
  const discount = appliedCoupon === 'FLYKART12' ? 500 : 0;

  // Final Total
  const totalAmount = Math.max(0, baseFare + taxes + udf + addOnsTotal + convenienceFee - discount);

  // Helper to update a single passenger's field and clear its error
  const updatePassenger = (idx: number, patch: Partial<PassengerDetails>, clearField?: keyof PassengerErrors) => {
    setPassengers((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, ...patch } : item))
    );
    if (clearField) {
      setErrors((prev) => {
        if (!prev[idx]?.[clearField]) return prev;
        const nextIdxErrors = { ...prev[idx], [clearField]: undefined };
        return { ...prev, [idx]: nextIdxErrors };
      });
    }
  };

  // Apply Coupon
  const handleApplyCoupon = () => {
    setCouponError(null);
    const cleaned = couponInput.trim().toUpperCase();
    if (cleaned === 'FLYKART12') {
      setAppliedCoupon('FLYKART12');
      setCouponInput('');
    } else {
      setCouponError('Invalid code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  // Form Validation & Submit across all passengers
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newErrors: Record<number, PassengerErrors> = {};
    let firstInvalidElementId: string | null = null;

    const recordError = (idx: number, field: keyof PassengerErrors, message: string, elementId: string) => {
      if (!newErrors[idx]) newErrors[idx] = {};
      newErrors[idx][field] = message;
      if (!firstInvalidElementId) {
        firstInvalidElementId = elementId;
      }
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    passengers.forEach((p, idx) => {
      if (!p.firstName.trim()) {
        recordError(idx, 'firstName', 'First name is required', `p${idx}-first-name`);
      }
      if (!p.lastName.trim()) {
        recordError(idx, 'lastName', 'Last name is required', `p${idx}-last-name`);
      }
      if (p.type === 'Child') {
        const ageTrimmed = (p.age || '').trim();
        const ageNum = Number(ageTrimmed);
        if (!ageTrimmed || isNaN(ageNum) || !Number.isInteger(ageNum) || ageNum < 2 || ageNum > 11) {
          recordError(idx, 'age', 'Enter age between 2 and 11 years', `p${idx}-age`);
        }
      }
      if (idx === 0) {
        const emailVal = (p.email || '').trim();
        if (!emailVal || !emailRegex.test(emailVal)) {
          recordError(idx, 'email', 'Enter a valid email address', 'p0-email');
        }
        const cleanMobile = (p.mobile || '').replace(/\D/g, '');
        if (cleanMobile.length !== 10) {
          recordError(idx, 'mobile', 'Enter a valid 10-digit mobile number', 'p0-mobile');
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (firstInvalidElementId) {
        const el = document.getElementById(firstInvalidElementId);
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    setErrors({});

    // Generate random Booking ID like TK12345
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const record: BookingRecord = {
      bookingId: `TK${randomNum}`,
      bookingDate: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      flight,
      searchParams,
      passengers,
      addOns,
      paymentMethod,
      pricing: {
        baseFare,
        taxes,
        udf,
        addOnsTotal,
        convenienceFee,
        discount,
        totalAmount,
        couponApplied: appliedCoupon,
      },
    };

    onProceedToPay(record);
  };

  return (
    <div className="bg-[#f9f9ff] font-body-md text-[#141b2b] antialiased min-h-screen flex flex-col">
      {/* ===================== FIXED TOP NAVIGATION ===================== */}
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

      {/* ===================== MAIN CONTENT WRAPPER ===================== */}
      <main className="w-full flex-1 pt-6 pb-16 bg-[#f9f9ff]">
        <div className="flex flex-col w-full">
          <div className="w-full bg-[#f1f3ff] py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-8">
              {/* Progress Stepper */}
              <section className="w-full bg-white rounded-full p-2 shadow-xs mb-6">
                <div className="flex items-center justify-between px-4 py-1 overflow-x-auto no-scrollbar">
                  {/* Step 1: Completed */}
                  <button
                    onClick={onBackToResults}
                    className="flex items-center gap-2 text-[#0053d3] hover:underline cursor-pointer shrink-0"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#0053d3]/10 flex items-center justify-center text-xs">
                      <span className="material-symbols-outlined text-[16px] text-[#0053d3]">check</span>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold tracking-tight">1. Flight Review</span>
                  </button>

                  <div className="flex-1 h-0.5 mx-3 bg-[#0053d3] min-w-4"></div>

                  {/* Step 2: Active / Current */}
                  <div className="flex items-center gap-2 text-[#0053d3] shrink-0">
                    <div className="w-7 h-7 rounded-full bg-[#0053d3] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      2
                    </div>
                    <span className="text-xs sm:text-sm font-bold tracking-tight text-[#141b2b]">2. Traveller Details</span>
                  </div>

                  <div className="flex-1 h-0.5 mx-3 bg-slate-200 min-w-4"></div>

                  {/* Step 3: Pending */}
                  <div className="flex items-center gap-2 text-slate-400 shrink-0">
                    <div className="w-7 h-7 rounded-full bg-[#e9edff] text-slate-500 flex items-center justify-center text-xs font-medium">
                      3
                    </div>
                    <span className="text-xs sm:text-sm font-medium hidden md:inline">3. Add-ons &amp; Seats</span>
                  </div>

                  <div className="flex-1 h-0.5 mx-3 bg-slate-200 min-w-4 hidden md:block"></div>

                  {/* Step 4: Pending */}
                  <div className="flex items-center gap-2 text-slate-400 shrink-0 hidden md:flex">
                    <div className="w-7 h-7 rounded-full bg-[#e9edff] text-slate-500 flex items-center justify-center text-xs font-medium">
                      4
                    </div>
                    <span className="text-xs sm:text-sm font-medium">4. Payment</span>
                  </div>

                  <div className="flex-1 h-0.5 mx-3 bg-slate-200 min-w-4 hidden lg:block"></div>

                  {/* Step 5: Pending */}
                  <div className="flex items-center gap-2 text-slate-400 shrink-0 hidden lg:flex">
                    <div className="w-7 h-7 rounded-full bg-[#e9edff] text-slate-500 flex items-center justify-center text-xs font-medium">
                      5
                    </div>
                    <span className="text-xs sm:text-sm font-medium">5. Confirmation</span>
                  </div>
                </div>
              </section>

              {/* Two-Column Workspace */}
              <div className="grid grid-cols-12 gap-6 items-start">
                {/* LEFT COLUMN (Booking Details & Forms ~68%) */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                  {/* Flight Summary Card */}
                  <article className="bg-white rounded-xl p-6 shadow-xs border border-slate-100">
                    {/* Header Meta */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-[#0053d3]/10 text-[#0053d3] text-[10px] font-bold uppercase tracking-wider">
                          Flight Summary
                        </span>
                        <span className="text-base sm:text-lg text-[#141b2b] font-bold">
                          {searchParams.fromCity.name} ({searchParams.fromCity.code}) → {searchParams.toCity.name} ({searchParams.toCity.code})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <span>{searchParams.departureDay.slice(0, 3)}, {searchParams.departureDisplayDate}</span>
                        <span>•</span>
                        <span>{travellersLabel} • {searchParams.cabinClass}</span>
                      </div>
                    </div>

                    {/* Airline Meta Row */}
                    <div className="bg-[#f1f3ff] rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 my-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-xs font-extrabold text-[#0053d3] text-sm">
                          {flight.airlineCode}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-base font-bold text-[#141b2b]">{flight.airline}</span>
                            <span className="text-xs text-slate-500 font-medium">• {flight.flightNumber}</span>
                          </div>
                          <span className="text-xs text-slate-400">{flight.aircraft}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#0053d3]/10 text-[#0053d3] text-xs font-semibold">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        <span>{flight.refundable ? 'Refundable Fare' : 'Standard Fare'}</span>
                      </div>
                    </div>

                    {/* Timings & Trajectory Bar */}
                    <div className="py-4 grid grid-cols-12 items-center gap-2">
                      {/* Origin */}
                      <div className="col-span-4 flex flex-col">
                        <span className="text-2xl sm:text-3xl font-extrabold text-[#141b2b] leading-none">
                          {flight.departureTime}
                        </span>
                        <span className="text-base font-semibold text-[#0053d3] mt-1">
                          {searchParams.fromCity.name} ({searchParams.fromCity.code})
                        </span>
                        <span className="text-xs text-slate-600">{flight.originTerminal}</span>
                        <span className="text-[10px] text-slate-400 truncate">{searchParams.fromCity.airport}</span>
                      </div>

                      {/* Route Graphics */}
                      <div className="col-span-4 flex flex-col items-center justify-center px-1">
                        <span className="text-xs text-slate-500 font-medium mb-1 leading-none">{flight.duration}</span>
                        <div className="w-full flex items-center my-1 relative">
                          <div className="w-2 h-2 rounded-full bg-[#0053d3]"></div>
                          <div className="flex-1 h-0.5 bg-[#b3c5ff] relative flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#0053d3] text-[18px] bg-white px-1 transform rotate-90">
                              flight
                            </span>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-[#0053d3]"></div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#e9edff] text-[#141b2b] text-[10px] font-bold uppercase mt-1 leading-none text-center">
                          {flight.viaCity ? `${flight.stopsLabel} via ${flight.viaCity}` : flight.stopsLabel}
                        </span>
                      </div>

                      {/* Destination */}
                      <div className="col-span-4 flex flex-col items-end text-right">
                        <span className="text-2xl sm:text-3xl font-extrabold text-[#141b2b] leading-none inline-flex items-baseline justify-end gap-1.5 whitespace-nowrap">
                          <span>{flight.arrivalTime}</span>
                          {flight.arrivalTime < flight.departureTime && (
                            <span className="text-[11px] font-bold text-[#ab3500] leading-none">+1 day</span>
                          )}
                        </span>
                        <span className="text-base font-semibold text-[#0053d3] mt-1">
                          {searchParams.toCity.name} ({searchParams.toCity.code})
                        </span>
                        <span className="text-xs text-slate-600">{flight.destTerminal}</span>
                        <span className="text-[10px] text-slate-400 truncate">{searchParams.toCity.airport}</span>
                      </div>
                    </div>

                    {/* Baggage & Check-in Strip */}
                    <div className="mt-3 pt-3 flex flex-wrap items-center justify-between gap-3 bg-[#f1f3ff]/70 rounded-lg p-3.5">
                      <div className="flex items-center gap-6 text-slate-600 text-xs flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px] text-[#0053d3]">luggage</span>
                          <span>Cabin: <strong className="text-[#141b2b]">{flight.baggage.cabin}</strong> / person</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px] text-[#0053d3]">work</span>
                          <span>Check-in: <strong className="text-[#141b2b]">{flight.baggage.checkIn}</strong> / person</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px] text-[#0053d3]">how_to_reg</span>
                          <span className="text-[#141b2b]">Free Web Check-in available</span>
                        </div>
                      </div>
                    </div>

                    {/* Cancellation Policy Pill Notice (FIX: Change £ to ₹) */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-slate-600 text-xs px-1">
                      <span className="material-symbols-outlined text-[18px] text-[#ab3500]">info</span>
                      <span>
                        Cancellation fee starts at <strong className="text-[#141b2b] font-semibold">₹1,500</strong> up to 2 hrs before departure.
                      </span>
                    </div>
                  </article>

                  {/* Traveller Details Form Cards (one per passenger) */}
                  {passengers.map((p, idx) => {
                    const pErr = errors[idx] || {};
                    const isPrimary = idx === 0;
                    return (
                      <article key={p.id} className="bg-white rounded-xl p-6 shadow-xs border border-slate-100">
                        <div className="flex items-center justify-between gap-2 pb-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#0053d3]/10 flex items-center justify-center text-[#0053d3] shrink-0">
                              <span className="material-symbols-outlined text-[20px]">
                                {p.type === 'Child' ? 'child_care' : 'person'}
                              </span>
                            </div>
                            <div>
                              <h2 className="text-base font-bold text-[#141b2b]">Traveller Details ({p.label})</h2>
                              <p className="text-xs text-slate-400">
                                {p.type === 'Child'
                                  ? 'Child (2 to 11 years). Please ensure name matches birth certificate or government ID.'
                                  : 'Please ensure names match government ID (Aadhaar / Passport / Voter ID).'}
                              </p>
                            </div>
                          </div>
                          {isPrimary && (
                            <span className="px-2.5 py-1 rounded-full bg-[#e9edff] text-[#141b2b] text-[10px] font-bold shrink-0">
                              Primary Contact
                            </span>
                          )}
                        </div>

                        <div className="space-y-4 mt-2">
                          {/* Gender Selection */}
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                              Gender
                            </label>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              {(['Male', 'Female', 'Transgender'] as const).map((g) => (
                                <label
                                  key={g}
                                  onClick={() => updatePassenger(idx, { gender: g })}
                                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                                    p.gender === g
                                      ? 'bg-[#0053d3] text-white shadow-xs'
                                      : 'bg-[#e9edff] text-[#141b2b] hover:bg-[#dce2f7]'
                                  }`}
                                >
                                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${p.gender === g ? 'bg-white' : 'bg-slate-300'}`}>
                                    {p.gender === g && <span className="w-1.5 h-1.5 rounded-full bg-[#0053d3]"></span>}
                                  </span>
                                  <span>{g}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Names Grid (+ Age for Child) */}
                          <div className={`grid grid-cols-1 ${p.type === 'Child' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor={`p${idx}-first-name`}>
                                First &amp; Middle Name
                              </label>
                              <input
                                id={`p${idx}-first-name`}
                                type="text"
                                value={p.firstName}
                                onChange={(e) => updatePassenger(idx, { firstName: e.target.value }, 'firstName')}
                                placeholder={p.type === 'Child' ? 'e.g. Aarav' : 'e.g. Rahul'}
                                className={`w-full px-4 py-2 rounded-lg bg-[#f1f3ff] text-[#141b2b] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0053d3] transition-all border ${
                                  pErr.firstName ? 'border-red-500' : 'border-transparent'
                                }`}
                              />
                              {pErr.firstName && <span className="text-xs text-red-500 mt-1 block">{pErr.firstName}</span>}
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor={`p${idx}-last-name`}>
                                Last Name
                              </label>
                              <input
                                id={`p${idx}-last-name`}
                                type="text"
                                value={p.lastName}
                                onChange={(e) => updatePassenger(idx, { lastName: e.target.value }, 'lastName')}
                                placeholder="e.g. Sharma"
                                className={`w-full px-4 py-2 rounded-lg bg-[#f1f3ff] text-[#141b2b] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0053d3] transition-all border ${
                                  pErr.lastName ? 'border-red-500' : 'border-transparent'
                                }`}
                              />
                              {pErr.lastName && <span className="text-xs text-red-500 mt-1 block">{pErr.lastName}</span>}
                            </div>

                            {p.type === 'Child' && (
                              <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor={`p${idx}-age`}>
                                  Age (2 - 11 yrs)
                                </label>
                                <input
                                  id={`p${idx}-age`}
                                  type="number"
                                  min={2}
                                  max={11}
                                  value={p.age ?? ''}
                                  onChange={(e) => updatePassenger(idx, { age: e.target.value }, 'age')}
                                  placeholder="e.g. 7"
                                  className={`w-full px-4 py-2 rounded-lg bg-[#f1f3ff] text-[#141b2b] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0053d3] transition-all border ${
                                    pErr.age ? 'border-red-500' : 'border-transparent'
                                  }`}
                                />
                                {pErr.age && <span className="text-xs text-red-500 mt-1 block">{pErr.age}</span>}
                              </div>
                            )}
                          </div>

                          {/* Contact Grid (Only in Primary Contact card) */}
                          {isPrimary && (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="p0-email">
                                    Email Address
                                  </label>
                                  <input
                                    id="p0-email"
                                    type="email"
                                    value={p.email ?? ''}
                                    onChange={(e) => updatePassenger(idx, { email: e.target.value }, 'email')}
                                    placeholder="rahul.sharma@example.com"
                                    className={`w-full px-4 py-2 rounded-lg bg-[#f1f3ff] text-[#141b2b] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0053d3] transition-all border ${
                                      pErr.email ? 'border-red-500' : 'border-transparent'
                                    }`}
                                  />
                                  {pErr.email ? (
                                    <span className="text-xs text-red-500 mt-1 block">{pErr.email}</span>
                                  ) : (
                                    <span className="text-[11px] text-slate-400 mt-1 block">Your e-ticket &amp; invoice will be sent here</span>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="p0-mobile">
                                    Mobile Number
                                  </label>
                                  <div className="flex items-center">
                                    <span className="px-3.5 py-2 bg-[#e9edff] text-[#141b2b] text-sm font-semibold rounded-l-lg select-none border border-r-0 border-slate-200">
                                      +91
                                    </span>
                                    <input
                                      id="p0-mobile"
                                      type="tel"
                                      value={p.mobile ?? ''}
                                      onChange={(e) => updatePassenger(idx, { mobile: e.target.value }, 'mobile')}
                                      placeholder="9876543210"
                                      className={`w-full px-4 py-2 rounded-r-lg bg-[#f1f3ff] text-[#141b2b] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0053d3] transition-all border ${
                                        pErr.mobile ? 'border-red-500' : 'border-slate-200'
                                      }`}
                                    />
                                  </div>
                                  {pErr.mobile ? (
                                    <span className="text-xs text-red-500 mt-1 block">{pErr.mobile}</span>
                                  ) : (
                                    <span className="text-[11px] text-slate-400 mt-1 block">For boarding gate alerts via WhatsApp &amp; SMS</span>
                                  )}
                                </div>
                              </div>

                              {/* Save details checkbox */}
                              <div className="pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(p.saveTraveller)}
                                    onChange={(e) => updatePassenger(idx, { saveTraveller: e.target.checked })}
                                    className="w-4 h-4 rounded text-[#0053d3] focus:ring-[#0053d3] accent-[#0053d3]"
                                  />
                                  <span className="text-xs text-[#141b2b] font-medium">
                                    Save this traveller for faster 1-click bookings next time
                                  </span>
                                </label>
                              </div>
                            </>
                          )}
                        </div>
                      </article>
                    );
                  })}

                  {/* Add-ons & Travel Protection Card */}
                  <article className="bg-white rounded-xl p-6 shadow-xs border border-slate-100">
                    <div className="flex items-center gap-2.5 pb-4">
                      <div className="w-8 h-8 rounded-full bg-[#fe6a34]/20 flex items-center justify-center text-[#ab3500]">
                        <span className="material-symbols-outlined text-[20px]">card_giftcard</span>
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-[#141b2b]">Add-ons &amp; Travel Protection</h2>
                        <p className="text-xs text-slate-400">Optional upgrades tailored for seamless travel.</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Item 1: Seat Selection */}
                      <label className="flex items-start justify-between gap-2 p-3 sm:p-4 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] transition-colors cursor-pointer group">
                        <div className="flex items-start gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={addOns.seatSelection}
                            onChange={(e) => setAddOns((prev) => ({ ...prev, seatSelection: e.target.checked }))}
                            className="mt-1 w-4 h-4 rounded text-[#0053d3] focus:ring-[#0053d3] accent-[#0053d3] shrink-0"
                          />
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white flex items-center justify-center text-[#0053d3] group-hover:scale-105 transition-transform shadow-xs shrink-0">
                            <span className="material-symbols-outlined text-[20px] sm:text-[22px]">airline_seat_recline_extra</span>
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-[#141b2b]">Seat Selection</h3>
                            <p className="text-xs text-slate-500">Choose preferred extra-legroom, window or aisle seats.</p>
                          </div>
                        </div>
                        <div className="text-right pl-1 sm:pl-3 shrink-0">
                          <span className="text-sm font-bold text-[#141b2b] whitespace-nowrap">Starts at ₹250</span>
                          <span className="block text-[10px] text-slate-400">per seat</span>
                        </div>
                      </label>

                      {/* Item 2: Meal */}
                      <label className="flex items-start justify-between gap-2 p-3 sm:p-4 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] transition-colors cursor-pointer group">
                        <div className="flex items-start gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={addOns.meal}
                            onChange={(e) => setAddOns((prev) => ({ ...prev, meal: e.target.checked }))}
                            className="mt-1 w-4 h-4 rounded text-[#0053d3] focus:ring-[#0053d3] accent-[#0053d3] shrink-0"
                          />
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white flex items-center justify-center text-[#ab3500] group-hover:scale-105 transition-transform shadow-xs shrink-0">
                            <span className="material-symbols-outlined text-[20px] sm:text-[22px]">restaurant</span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h3 className="text-sm font-bold text-[#141b2b]">In-flight Meal</h3>
                              <span className="px-1.5 py-0.5 rounded-full bg-[#fe6a34]/20 text-[#ab3500] text-[10px] font-bold whitespace-nowrap">
                                20% Off
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">Pre-book freshly curated hot snacks, sandwiches &amp; drinks.</p>
                          </div>
                        </div>
                        <div className="text-right pl-1 sm:pl-3 shrink-0">
                          <span className="text-sm font-bold text-[#141b2b] whitespace-nowrap">From ₹350</span>
                          <span className="block text-[10px] text-slate-400">per meal</span>
                        </div>
                      </label>

                      {/* Item 3: Insurance */}
                      <label className="flex items-start justify-between gap-2 p-3 sm:p-4 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] transition-colors cursor-pointer group">
                        <div className="flex items-start gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={addOns.insurance}
                            onChange={(e) => setAddOns((prev) => ({ ...prev, insurance: e.target.checked }))}
                            className="mt-1 w-4 h-4 rounded text-[#0053d3] focus:ring-[#0053d3] accent-[#0053d3] shrink-0"
                          />
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white flex items-center justify-center text-[#00819b] group-hover:scale-105 transition-transform shadow-xs shrink-0">
                            <span className="material-symbols-outlined text-[20px] sm:text-[22px]">health_and_safety</span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h3 className="text-sm font-bold text-[#141b2b]">Comprehensive Travel Insurance</h3>
                              <span className="px-1.5 py-0.5 rounded-full bg-[#e9edff] text-[#141b2b] text-[10px] font-bold whitespace-nowrap">
                                Recommended
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              Coverage for baggage delay up to ₹10,000, trip cancellation &amp; medical expenses.
                            </p>
                          </div>
                        </div>
                        <div className="text-right pl-1 sm:pl-3 shrink-0">
                          <span className="text-sm font-bold text-[#141b2b] whitespace-nowrap">₹199</span>
                          <span className="block text-[10px] text-slate-400">/ traveller</span>
                        </div>
                      </label>
                    </div>
                  </article>

                  {/* Payment Method Card */}
                  <article className="bg-white rounded-xl p-6 shadow-xs border border-slate-100">
                    <div className="flex items-center justify-between pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#0053d3]/10 flex items-center justify-center text-[#0053d3]">
                          <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-[#141b2b]">Select Payment Method</h2>
                          <p className="text-xs text-slate-400">Choose your preferred gateway</p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Options Tabs/Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                      {/* UPI Option */}
                      <label 
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between border ${
                          paymentMethod === 'upi' ? 'bg-[#e9edff] border-[#0053d3]' : 'bg-[#f1f3ff] border-transparent hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2 py-0.5 rounded-full bg-[#0053d3]/10 text-[#0053d3] text-[10px] font-bold">
                              Zero Fee
                            </span>
                            <input
                              type="radio"
                              name="pay-method"
                              checked={paymentMethod === 'upi'}
                              onChange={() => setPaymentMethod('upi')}
                              className="accent-[#0053d3]"
                            />
                          </div>
                          <h3 className="text-sm font-bold text-[#141b2b] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[#0053d3] text-[20px]">qr_code_scanner</span>
                            UPI
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">Google Pay, PhonePe, Paytm, BHIM</p>
                        </div>
                      </label>

                      {/* Cards Option */}
                      <label 
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between border ${
                          paymentMethod === 'card' ? 'bg-[#e9edff] border-[#0053d3]' : 'bg-[#f1f3ff] border-transparent hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-medium">
                              Fast Checkout
                            </span>
                            <input
                              type="radio"
                              name="pay-method"
                              checked={paymentMethod === 'card'}
                              onChange={() => setPaymentMethod('card')}
                              className="accent-[#0053d3]"
                            />
                          </div>
                          <h3 className="text-sm font-bold text-[#141b2b] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[#0053d3] text-[20px]">credit_card</span>
                            Credit / Debit Card
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">Visa, Mastercard, RuPay, Amex</p>
                        </div>
                      </label>

                      {/* Net Banking Option */}
                      <label 
                        onClick={() => setPaymentMethod('netbanking')}
                        className={`p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between border ${
                          paymentMethod === 'netbanking' ? 'bg-[#e9edff] border-[#0053d3]' : 'bg-[#f1f3ff] border-transparent hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-medium">
                              All Banks
                            </span>
                            <input
                              type="radio"
                              name="pay-method"
                              checked={paymentMethod === 'netbanking'}
                              onChange={() => setPaymentMethod('netbanking')}
                              className="accent-[#0053d3]"
                            />
                          </div>
                          <h3 className="text-sm font-bold text-[#141b2b] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[#0053d3] text-[20px]">account_balance</span>
                            Net Banking
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">HDFC, ICICI, SBI, Axis &amp; 40+ banks</p>
                        </div>
                      </label>
                    </div>

                    {/* Security Badges Footer */}
                    <div className="mt-6 p-2 rounded-lg bg-[#f1f3ff] flex flex-wrap items-center justify-center gap-4 text-slate-400 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">lock</span>
                        <span>256-bit SSL Encrypted</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">verified_user</span>
                        <span>RBI Compliant</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">security</span>
                        <span>PCI-DSS Certified</span>
                      </div>
                    </div>
                  </article>
                </div>

                {/* RIGHT COLUMN (Sticky Fare Summary Card ~32%) */}
                <aside className="col-span-12 lg:col-span-4 lg:sticky lg:top-6">
                  <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100">
                    {/* Card Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h2 className="text-base font-bold text-[#141b2b]">Fare Summary</h2>
                        <span className="text-xs text-slate-400">
                          {travellersLabel} • {searchParams.cabinClass}
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#e9edff] flex items-center justify-center text-[#141b2b]">
                        <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                      </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="space-y-2.5 py-4 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Base Fare ({travellersLabel})</span>
                        <span className="font-semibold text-[#141b2b]">₹{baseFare.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1">
                          Taxes &amp; Airport Fees
                          <span className="material-symbols-outlined text-[14px] text-slate-400 cursor-pointer" title="Includes K3, PSF, and Goods and Services Tax">
                            help
                          </span>
                        </span>
                        <span className="font-semibold text-[#141b2b]">₹{taxes.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span>User Development Fee</span>
                        <span className="font-semibold text-[#141b2b]">₹{udf.toLocaleString('en-IN')}</span>
                      </div>

                      {addOnsTotal > 0 && (
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Add-ons ({[
                            addOns.seatSelection && 'Seat',
                            addOns.meal && 'Meal',
                            addOns.insurance && 'Insurance'
                          ].filter(Boolean).join(', ')})</span>
                          <span className="font-semibold text-[#141b2b]">₹{addOnsTotal.toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-slate-600">
                        <span>Convenience Fee</span>
                        <span className="font-semibold text-[#141b2b]">₹{convenienceFee}</span>
                      </div>

                      {discount > 0 && (
                        <div className="flex items-center justify-between text-emerald-600 font-semibold">
                          <span>Coupon Discount (FLYKART12)</span>
                          <span>-₹{discount}</span>
                        </div>
                      )}
                    </div>

                    {/* Promo Code Module */}
                    <div className="my-4 pt-4 border-t border-slate-100">
                      {appliedCoupon ? (
                        /* Applied Chip */
                        <div className="p-2.5 rounded-lg bg-[#f1f3ff] flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-[#0053d3] text-xs">
                            <span className="material-symbols-outlined text-[18px] text-[#0053d3]">check_circle</span>
                            <span className="font-bold tracking-wide">{appliedCoupon}</span>
                            <span className="text-slate-500 font-normal">(-₹500 applied)</span>
                          </div>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-[#ab3500] text-xs font-semibold hover:underline cursor-pointer"
                            type="button"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        /* Input for coupon code */
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <input
                              value={couponInput}
                              onChange={(e) => {
                                setCouponInput(e.target.value);
                                if (couponError) setCouponError(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleApplyCoupon();
                                }
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-[#f1f3ff] text-[#141b2b] text-xs focus:outline-none focus:ring-1 focus:ring-[#0053d3] uppercase tracking-wider"
                              placeholder="Enter Coupon Code (try FLYKART12)"
                              type="text"
                            />
                            <button
                              onClick={handleApplyCoupon}
                              className="px-4 py-1.5 rounded-lg bg-[#e9edff] hover:bg-[#dce2f7] text-[#141b2b] text-xs font-bold transition-colors cursor-pointer shrink-0"
                              type="button"
                            >
                              Apply
                            </button>
                          </div>
                          {couponError && <p className="text-xs text-red-500 font-medium">{couponError}</p>}
                        </div>
                      )}
                    </div>

                    {/* Total Price Calculation Display */}
                    <div className="mt-4 pt-4 bg-[#f1f3ff] rounded-xl p-4">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Amount</span>
                          <span className="text-3xl font-extrabold text-[#0053d3] tracking-tight">
                            ₹{totalAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        {discount > 0 && (
                          <span className="px-2.5 py-1 rounded-full bg-[#0053d3]/10 text-[#0053d3] text-xs font-bold">
                            You Saved ₹{discount}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Inclusive of all taxes, fees and applied discounts</p>
                    </div>

                    {/* Big High-Contrast CTA Button */}
                    <div className="mt-6 space-y-2.5">
                      {bookingError && (
                        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                          {bookingError}
                        </div>
                      )}
                      <button
                        onClick={() => handleSubmit()}
                        disabled={isSubmitting}
                        className="w-full py-3.5 px-6 rounded-full bg-[#0053d3] hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
                        type="button"
                      >
                        <span>
                          {isSubmitting
                            ? !user
                              ? 'Signing in to continue...'
                              : 'Confirming Booking...'
                            : `Proceed to Pay ₹${totalAmount.toLocaleString('en-IN')}`}
                        </span>
                        {!isSubmitting && (
                          <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                            arrow_forward
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Trust & Assurance Micro-points */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                        <span className="material-symbols-outlined text-[#0053d3] text-[18px]">verified</span>
                        <span>100% Safe &amp; Secure Payment Guarantee</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                        <span className="material-symbols-outlined text-[#0053d3] text-[18px]">replay</span>
                        <span>Instant refund process on cancellation</span>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer 
        onOpenComingSoon={onOpenComingSoon} 
        onNavigateHome={onNavigateHome} 
      />
    </div>
  );
};
