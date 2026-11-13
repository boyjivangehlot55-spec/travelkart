import React, { useState, useMemo, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Flight, SearchParams } from '../types';
import { generateFlightsForSearch } from '../data/flightData';
import { buildWishlistItemId } from '../firebase';
import { Navbar, BrandLogo } from './Navbar';

interface ResultsPageProps {
  searchParams: SearchParams;
  onSelectFlight: (flight: Flight) => void;
  onModifySearch: () => void;
  onNavigateHome: () => void;
  onOpenComingSoon: (feature: string) => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onNavigateTrips: () => void;
  onNavigateWishlist: () => void;
  wishlistIds: Set<string>;
  onToggleWishlist: (flight: Flight) => void;
  wishlistError?: string | null;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  searchParams,
  onSelectFlight,
  onModifySearch,
  onNavigateHome,
  onOpenComingSoon,
  user,
  onSignIn,
  onSignOut,
  onNavigateTrips,
  onNavigateWishlist,
  wishlistIds,
  onToggleWishlist,
  wishlistError = null,
}) => {
  // Generate dynamic flights based on route, date, and cabin class
  const { flights: allFlights, usualSavings } = useMemo(
    () => generateFlightsForSearch(searchParams),
    [searchParams.fromCity.code, searchParams.toCity.code, searchParams.departureDate, searchParams.cabinClass]
  );

  // Derived metrics from the generated flight list
  const flightMetrics = useMemo(() => {
    const prices = allFlights.map((f) => f.basePrice);
    const minPrice = Math.min(...prices);
    const maxPriceBound = Math.max(...prices);

    const nonStopFlights = allFlights.filter((f) => f.stops === 0);
    const oneStopFlights = allFlights.filter((f) => f.stops === 1);
    const refundableFlights = allFlights.filter((f) => f.refundable);

    const cheapestFlight = allFlights.reduce((best, f) => (f.basePrice < best.basePrice ? f : best), allFlights[0]);
    const fastestFlight = allFlights.reduce((best, f) => (f.durationMinutes < best.durationMinutes ? f : best), allFlights[0]);
    const earliestFlight = allFlights.reduce(
      (best, f) => (f.departureTime.localeCompare(best.departureTime) < 0 ? f : best),
      allFlights[0]
    );

    const airlineMinPrices: Record<string, number | null> = {
      IndiGo: null,
      'Akasa Air': null,
      'Air India': null,
      'Air India Express': null,
      SpiceJet: null,
    };
    for (const f of allFlights) {
      const prev = airlineMinPrices[f.airline];
      if (prev === null || f.basePrice < prev) {
        airlineMinPrices[f.airline] = f.basePrice;
      }
    }

    return {
      minPrice,
      maxPriceBound,
      nonStopCount: nonStopFlights.length,
      oneStopCount: oneStopFlights.length,
      lowestNonStopPrice: nonStopFlights.length ? Math.min(...nonStopFlights.map((f) => f.basePrice)) : null,
      lowestRefundablePrice: refundableFlights.length ? Math.min(...refundableFlights.map((f) => f.basePrice)) : null,
      cheapestFlight,
      fastestFlight,
      earliestFlight,
      airlineMinPrices,
    };
  }, [allFlights]);

  // Filter states
  const [filterNonStopOnly, setFilterNonStopOnly] = useState<boolean>(true);
  const [filterRefundableOnly, setFilterRefundableOnly] = useState<boolean>(false);
  const [filterMorningOnly, setFilterMorningOnly] = useState<boolean>(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<'all' | 'early' | 'morning' | 'afternoon' | 'night'>('all');
  const [maxPrice, setMaxPrice] = useState<number>(flightMetrics.maxPriceBound);
  const [stopsFilter, setStopsFilter] = useState<'all' | 'nonstop' | '1stop' | '2plus'>('nonstop');
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([
    'IndiGo',
    'Akasa Air',
    'Air India',
    'Air India Express',
    'SpiceJet',
  ]);

  // Keep price slider cap updated when generated flights change (e.g. route/date/class)
  useEffect(() => {
    setMaxPrice(flightMetrics.maxPriceBound);
  }, [flightMetrics.maxPriceBound]);

  // Sort states
  const [activeSortTab, setActiveSortTab] = useState<'cheapest' | 'fastest' | 'earliest' | null>('cheapest');
  const [sortDropdown, setSortDropdown] = useState<string>('price-asc');

  // Pagination / Show More
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [expandedFlightId, setExpandedFlightId] = useState<string | null>(null);

  // Clear all filters
  const handleClearFilters = () => {
    setFilterNonStopOnly(false);
    setFilterRefundableOnly(false);
    setFilterMorningOnly(false);
    setSelectedTimeSlot('all');
    setMaxPrice(flightMetrics.maxPriceBound);
    setStopsFilter('all');
    setSelectedAirlines(['IndiGo', 'Akasa Air', 'Air India', 'Air India Express', 'SpiceJet']);
  };

  // Synchronize Popular Non-Stop Checkbox and Stops Radio
  const handleToggleNonStop = (checked: boolean) => {
    setFilterNonStopOnly(checked);
    setStopsFilter(checked ? 'nonstop' : 'all');
  };

  const handleSelectStops = (mode: 'all' | 'nonstop' | '1stop' | '2plus') => {
    setStopsFilter(mode);
    setFilterNonStopOnly(mode === 'nonstop');
  };

  // Synchronize Sort Tabs and Dropdown
  const handleSortTabChange = (tab: 'cheapest' | 'fastest' | 'earliest') => {
    setActiveSortTab(tab);
    if (tab === 'cheapest') setSortDropdown('price-asc');
    else if (tab === 'fastest') setSortDropdown('duration-asc');
    else if (tab === 'earliest') setSortDropdown('departure-asc');
  };

  const handleSortDropdownChange = (val: string) => {
    setSortDropdown(val);
    if (val === 'price-asc') setActiveSortTab('cheapest');
    else if (val === 'duration-asc') setActiveSortTab('fastest');
    else if (val === 'departure-asc') setActiveSortTab('earliest');
    else setActiveSortTab(null);
  };

  // Toggle Airline
  const handleToggleAirline = (airlineName: string) => {
    setSelectedAirlines((prev) =>
      prev.includes(airlineName)
        ? prev.filter((a) => a !== airlineName)
        : [...prev, airlineName]
    );
  };

  // Filter & Sort flights
  const filteredFlights = useMemo(() => {
    let result = [...allFlights];

    // Stops filter & Popular non-stop
    if (stopsFilter === '1stop') {
      result = result.filter((f) => f.stops === 1);
    } else if (stopsFilter === '2plus') {
      result = result.filter((f) => f.stops >= 2);
    } else if (filterNonStopOnly || stopsFilter === 'nonstop') {
      result = result.filter((f) => f.stops === 0);
    }

    // Refundable & Morning Popular Filters
    if (filterRefundableOnly) {
      result = result.filter((f) => f.refundable);
    }
    if (filterMorningOnly) {
      result = result.filter((f) => f.departureSlot === 'morning');
    }

    // Departure Time slot tile
    if (selectedTimeSlot !== 'all') {
      result = result.filter((f) => f.departureSlot === selectedTimeSlot);
    }

    // Price slider
    result = result.filter((f) => f.basePrice <= maxPrice);

    // Airlines
    if (selectedAirlines.length === 0) {
      result = [];
    } else {
      result = result.filter((f) => selectedAirlines.includes(f.airline));
    }

    // Sorting
    if (sortDropdown === 'price-asc') {
      result.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortDropdown === 'price-desc') {
      result.sort((a, b) => b.basePrice - a.basePrice);
    } else if (sortDropdown === 'duration-asc') {
      result.sort((a, b) => a.durationMinutes - b.durationMinutes);
    } else if (sortDropdown === 'departure-asc') {
      result.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    } else if (sortDropdown === 'arrival-asc') {
      result.sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime));
    }

    return result;
  }, [
    allFlights,
    filterNonStopOnly,
    filterRefundableOnly,
    filterMorningOnly,
    selectedTimeSlot,
    maxPrice,
    stopsFilter,
    selectedAirlines,
    sortDropdown,
  ]);

  const displayedFlights = filteredFlights.slice(0, visibleCount);
  const travellerLabel = `${searchParams.adults} ${searchParams.adults === 1 ? 'Adult' : 'Adults'}${
    searchParams.children > 0
      ? `, ${searchParams.children} ${searchParams.children === 1 ? 'Child' : 'Children'}`
      : ''
  }`;

  return (
    <div className="bg-[#f1f3ff] font-body-md text-[#141b2b] antialiased min-h-screen flex flex-col">
      {/* ===================== FIXED TOP NAVIGATION ===================== */}
      <div className="fixed top-0 left-0 right-0 z-50 shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
        {/* Row 1: Navbar */}
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

        {/* Row 2: Search Meta Sub-Header */}
        <div className="h-14 bg-[#424655] px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6 text-white text-xs sm:text-sm overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 font-headline-sm text-sm sm:text-base text-white font-bold shrink-0">
              <span>{searchParams.fromCity.name} ({searchParams.fromCity.code})</span>
              <span className="material-symbols-outlined text-[18px] text-[#ffb59d]">arrow_forward</span>
              <span>{searchParams.toCity.name} ({searchParams.toCity.code})</span>
            </div>
            <div className="w-px h-5 bg-white/20 hidden sm:block shrink-0"></div>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-200 shrink-0 font-medium">
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              <span>{searchParams.departureDay.slice(0, 3)}, {searchParams.departureDisplayDate}</span>
            </div>
            <div className="w-px h-5 bg-white/20 hidden md:block shrink-0"></div>
            <div className="hidden md:flex items-center gap-1.5 text-slate-200 shrink-0 font-medium">
              <span className="material-symbols-outlined text-[16px]">person</span>
              <span>
                {travellerLabel}, {searchParams.cabinClass}
              </span>
            </div>
          </div>

          <button
            onClick={onModifySearch}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all text-xs sm:text-sm font-semibold shrink-0 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            <span>Modify Search</span>
          </button>
        </div>
      </div>

      {/* ===================== MAIN CONTENT WRAPPER ===================== */}
      <main className="min-h-[calc(100vh-120px-40px)] pt-[144px] sm:pt-[152px] pb-12 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col w-full">
          {wishlistError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {wishlistError}
            </div>
          )}
          {/* Quick Insights Banner */}
          <div className="w-full mb-6">
            <div className="bg-white rounded-xl shadow-xs p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0053d3]">
                  <span className="material-symbols-outlined text-[22px]">trending_down</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-base sm:text-lg text-[#141b2b] font-bold">
                      Fares are ₹{usualSavings.toLocaleString('en-IN')} lower than usual
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#ffdbd0] text-[#390c00] text-[10px] font-bold uppercase tracking-wider">
                      High Demand
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#424655]">
                    Book today to secure the lowest guaranteed fare for {searchParams.fromCity.name} to {searchParams.toCity.name}.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">7-Day Price Trend</span>
                  <svg className="w-28 h-6 text-[#0053d3] overflow-visible mt-1" fill="none" viewBox="0 0 100 24">
                    <path d="M0 18 Q 20 22, 35 12 T 65 14 T 100 4" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5"></path>
                    <circle className="fill-[#fe6a34]" cx="100" cy="4" r="3"></circle>
                  </svg>
                </div>
                <button
                  onClick={() => onOpenComingSoon('Fare Alert Notification')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#e9edff] text-[#0053d3] text-xs font-bold hover:bg-[#dce2f7] transition-colors cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                  <span>Set Fare Alert</span>
                </button>
              </div>
            </div>
          </div>

          {/* Grid Layout: Filter Rail + Flight Cards */}
          <div className="grid grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Sticky Filter Sidebar */}
            <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-[152px] space-y-4">
              <div className="bg-white rounded-xl shadow-xs p-5 space-y-6 border border-slate-100">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#0053d3] text-[20px]">tune</span>
                    <h2 className="font-headline-sm text-base font-bold text-[#141b2b]">Filters</h2>
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-[#e9edff] text-[#0053d3] text-xs font-semibold">
                      {filteredFlights.length} {filteredFlights.length === 1 ? 'flight' : 'flights'}
                    </span>
                  </div>
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-[#0053d3] hover:underline font-semibold cursor-pointer"
                    type="button"
                  >
                    Clear All
                  </button>
                </div>

                {/* Popular Filters */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Popular Filters
                  </span>
                  <div className="space-y-1">
                    <label className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={filterNonStopOnly}
                          onChange={(e) => handleToggleNonStop(e.target.checked)}
                          className="w-4 h-4 rounded text-[#0053d3] focus:ring-0 cursor-pointer accent-[#0053d3]"
                        />
                        <span className="text-sm font-medium text-[#141b2b]">Non Stop</span>
                      </div>
                      <span className="text-xs text-slate-600 font-semibold">
                        {flightMetrics.lowestNonStopPrice !== null ? `₹${flightMetrics.lowestNonStopPrice.toLocaleString('en-IN')}` : '—'}
                      </span>
                    </label>

                    <label className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={filterRefundableOnly}
                          onChange={(e) => setFilterRefundableOnly(e.target.checked)}
                          className="w-4 h-4 rounded text-[#0053d3] focus:ring-0 cursor-pointer accent-[#0053d3]"
                        />
                        <span className="text-sm font-medium text-[#141b2b]">Refundable Fares</span>
                      </div>
                      <span className="text-xs text-slate-600 font-semibold">
                        {flightMetrics.lowestRefundablePrice !== null ? `₹${flightMetrics.lowestRefundablePrice.toLocaleString('en-IN')}` : '—'}
                      </span>
                    </label>

                    <label className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={filterMorningOnly}
                          onChange={(e) => setFilterMorningOnly(e.target.checked)}
                          className="w-4 h-4 rounded text-[#0053d3] focus:ring-0 cursor-pointer accent-[#0053d3]"
                        />
                        <span className="text-sm font-medium text-[#141b2b]">Morning Departures</span>
                      </div>
                      <span className="text-[11px] text-slate-400">06:00 - 12:00</span>
                    </label>
                  </div>
                </div>

                {/* Departure Time Slots */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Departure Time
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTimeSlot(selectedTimeSlot === 'early' ? 'all' : 'early')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all text-center cursor-pointer ${
                        selectedTimeSlot === 'early'
                          ? 'bg-[#0053d3] text-white shadow-xs'
                          : 'bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b]'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[20px] mb-1 ${selectedTimeSlot === 'early' ? 'text-white' : 'text-slate-400'}`}>
                        wb_twilight
                      </span>
                      <span className="text-xs font-bold leading-tight">Before 6 AM</span>
                      <span className={`text-[10px] ${selectedTimeSlot === 'early' ? 'text-blue-100' : 'text-slate-400'}`}>Early Morning</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTimeSlot(selectedTimeSlot === 'morning' ? 'all' : 'morning')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all text-center cursor-pointer ${
                        selectedTimeSlot === 'morning'
                          ? 'bg-[#0053d3] text-white shadow-xs'
                          : 'bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b]'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[20px] mb-1 ${selectedTimeSlot === 'morning' ? 'text-white' : 'text-slate-400'}`}>
                        wb_sunny
                      </span>
                      <span className="text-xs font-bold leading-tight">6 AM - 12 PM</span>
                      <span className={`text-[10px] ${selectedTimeSlot === 'morning' ? 'text-blue-100' : 'text-slate-400'}`}>Morning</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTimeSlot(selectedTimeSlot === 'afternoon' ? 'all' : 'afternoon')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all text-center cursor-pointer ${
                        selectedTimeSlot === 'afternoon'
                          ? 'bg-[#0053d3] text-white shadow-xs'
                          : 'bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b]'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[20px] mb-1 ${selectedTimeSlot === 'afternoon' ? 'text-white' : 'text-slate-400'}`}>
                        light_mode
                      </span>
                      <span className="text-xs font-bold leading-tight">12 PM - 6 PM</span>
                      <span className={`text-[10px] ${selectedTimeSlot === 'afternoon' ? 'text-blue-100' : 'text-slate-400'}`}>Afternoon</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTimeSlot(selectedTimeSlot === 'night' ? 'all' : 'night')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all text-center cursor-pointer ${
                        selectedTimeSlot === 'night'
                          ? 'bg-[#0053d3] text-white shadow-xs'
                          : 'bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b]'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[20px] mb-1 ${selectedTimeSlot === 'night' ? 'text-white' : 'text-slate-400'}`}>
                        nights_stay
                      </span>
                      <span className="text-xs font-bold leading-tight">After 6 PM</span>
                      <span className={`text-[10px] ${selectedTimeSlot === 'night' ? 'text-blue-100' : 'text-slate-400'}`}>Night</span>
                    </button>
                  </div>
                </div>

                {/* Price Range Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">One-way Price</span>
                    <span className="text-xs font-bold text-[#0053d3]">
                      Up to ₹{maxPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="px-1">
                    <input
                      type="range"
                      min={flightMetrics.minPrice}
                      max={flightMetrics.maxPriceBound}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0053d3]"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>₹{flightMetrics.minPrice.toLocaleString('en-IN')}</span>
                    <span>₹{flightMetrics.maxPriceBound.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Stops Segment */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Stops</span>
                  <div className="space-y-1">
                    <label className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="stops"
                          checked={stopsFilter === 'all'}
                          onChange={() => handleSelectStops('all')}
                          className="w-4 h-4 text-[#0053d3] accent-[#0053d3] cursor-pointer"
                        />
                        <span className="text-sm font-medium text-[#141b2b]">All Stops</span>
                      </div>
                      <span className="text-xs text-slate-400">{allFlights.length} flights</span>
                    </label>

                    <label className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="stops"
                          checked={stopsFilter === 'nonstop'}
                          onChange={() => handleSelectStops('nonstop')}
                          className="w-4 h-4 text-[#0053d3] accent-[#0053d3] cursor-pointer"
                        />
                        <span className="text-sm font-medium text-[#141b2b]">Non Stop Only</span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {flightMetrics.nonStopCount} {flightMetrics.nonStopCount === 1 ? 'flight' : 'flights'}
                      </span>
                    </label>

                    <label className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="stops"
                          checked={stopsFilter === '1stop'}
                          onChange={() => handleSelectStops('1stop')}
                          className="w-4 h-4 text-[#0053d3] accent-[#0053d3] cursor-pointer"
                        />
                        <span className="text-sm font-medium text-[#141b2b]">1 Stop</span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {flightMetrics.oneStopCount} {flightMetrics.oneStopCount === 1 ? 'flight' : 'flights'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Airlines Checklist */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Airlines</span>
                  <div className="space-y-1.5">
                    {/* IndiGo */}
                    <label className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedAirlines.includes('IndiGo')}
                          onChange={() => handleToggleAirline('IndiGo')}
                          className="w-4 h-4 rounded text-[#0053d3] accent-[#0053d3]"
                        />
                        <div className="w-5 h-5 rounded-full bg-[#1a6bff] flex items-center justify-center text-white text-[10px] font-bold">
                          6E
                        </div>
                        <span className="text-sm font-medium text-[#141b2b]">IndiGo</span>
                      </div>
                      <span className="text-xs text-slate-600 font-semibold">
                        {flightMetrics.airlineMinPrices['IndiGo'] !== null
                          ? `₹${flightMetrics.airlineMinPrices['IndiGo']!.toLocaleString('en-IN')}`
                          : '—'}
                      </span>
                    </label>

                    {/* Akasa Air */}
                    <label className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedAirlines.includes('Akasa Air')}
                          onChange={() => handleToggleAirline('Akasa Air')}
                          className="w-4 h-4 rounded text-[#0053d3] accent-[#0053d3]"
                        />
                        <div className="w-5 h-5 rounded-full bg-[#fe6a34] flex items-center justify-center text-white text-[10px] font-bold">
                          QP
                        </div>
                        <span className="text-sm font-medium text-[#141b2b]">Akasa Air</span>
                      </div>
                      <span className="text-xs text-slate-600 font-semibold">
                        {flightMetrics.airlineMinPrices['Akasa Air'] !== null
                          ? `₹${flightMetrics.airlineMinPrices['Akasa Air']!.toLocaleString('en-IN')}`
                          : '—'}
                      </span>
                    </label>

                    {/* Air India */}
                    <label className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedAirlines.includes('Air India')}
                          onChange={() => handleToggleAirline('Air India')}
                          className="w-4 h-4 rounded text-[#0053d3] accent-[#0053d3]"
                        />
                        <div className="w-5 h-5 rounded-full bg-[#ba1a1a] flex items-center justify-center text-white text-[10px] font-bold">
                          AI
                        </div>
                        <span className="text-sm font-medium text-[#141b2b]">Air India</span>
                      </div>
                      <span className="text-xs text-slate-600 font-semibold">
                        {flightMetrics.airlineMinPrices['Air India'] !== null
                          ? `₹${flightMetrics.airlineMinPrices['Air India']!.toLocaleString('en-IN')}`
                          : '—'}
                      </span>
                    </label>

                    {/* Air India Express */}
                    <label className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedAirlines.includes('Air India Express')}
                          onChange={() => handleToggleAirline('Air India Express')}
                          className="w-4 h-4 rounded text-[#0053d3] accent-[#0053d3]"
                        />
                        <div className="w-5 h-5 rounded-full bg-[#5d1900] flex items-center justify-center text-[#ffdbd0] text-[10px] font-bold">
                          IX
                        </div>
                        <span className="text-sm font-medium text-[#141b2b]">Air India Express</span>
                      </div>
                      <span className="text-xs text-slate-600 font-semibold">
                        {flightMetrics.airlineMinPrices['Air India Express'] !== null
                          ? `₹${flightMetrics.airlineMinPrices['Air India Express']!.toLocaleString('en-IN')}`
                          : '—'}
                      </span>
                    </label>

                    {/* SpiceJet */}
                    <label className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedAirlines.includes('SpiceJet')}
                          onChange={() => handleToggleAirline('SpiceJet')}
                          className="w-4 h-4 rounded text-[#0053d3] accent-[#0053d3]"
                        />
                        <div className="w-5 h-5 rounded-full bg-[#ab3500] flex items-center justify-center text-white text-[10px] font-bold">
                          SG
                        </div>
                        <span className="text-sm font-medium text-[#141b2b]">SpiceJet</span>
                      </div>
                      <span className="text-xs text-slate-600 font-semibold">
                        {flightMetrics.airlineMinPrices['SpiceJet'] !== null
                          ? `₹${flightMetrics.airlineMinPrices['SpiceJet']!.toLocaleString('en-IN')}`
                          : '—'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Sort Toolbar & Flight Listings */}
            <div className="col-span-12 lg:col-span-8 space-y-4">
              {/* Sort Bar Tabs */}
              <div className="bg-white rounded-xl shadow-xs p-2 sm:p-3 flex flex-wrap items-center justify-between gap-3 border border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Cheapest Tab */}
                  <button
                    type="button"
                    onClick={() => handleSortTabChange('cheapest')}
                    className={`flex items-center gap-2.5 px-4 py-2 rounded-full transition-all cursor-pointer ${
                      activeSortTab === 'cheapest'
                        ? 'bg-[#0053d3] text-white shadow-xs'
                        : 'bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">sell</span>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold leading-tight">Cheapest</span>
                      <span className={`text-[10px] ${activeSortTab === 'cheapest' ? 'text-blue-100' : 'text-slate-400'}`}>
                        ₹{flightMetrics.cheapestFlight.basePrice.toLocaleString('en-IN')} • {flightMetrics.cheapestFlight.duration}
                      </span>
                    </div>
                  </button>

                  {/* Fastest Tab */}
                  <button
                    type="button"
                    onClick={() => handleSortTabChange('fastest')}
                    className={`flex items-center gap-2.5 px-4 py-2 rounded-full transition-all cursor-pointer ${
                      activeSortTab === 'fastest'
                        ? 'bg-[#0053d3] text-white shadow-xs'
                        : 'bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">speed</span>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold leading-tight">Fastest</span>
                      <span className={`text-[10px] ${activeSortTab === 'fastest' ? 'text-blue-100' : 'text-slate-400'}`}>
                        ₹{flightMetrics.fastestFlight.basePrice.toLocaleString('en-IN')} • {flightMetrics.fastestFlight.duration}
                      </span>
                    </div>
                  </button>

                  {/* Earliest Tab */}
                  <button
                    type="button"
                    onClick={() => handleSortTabChange('earliest')}
                    className={`flex items-center gap-2.5 px-4 py-2 rounded-full transition-all cursor-pointer ${
                      activeSortTab === 'earliest'
                        ? 'bg-[#0053d3] text-white shadow-xs'
                        : 'bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">alarm</span>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold leading-tight">Earliest</span>
                      <span className={`text-[10px] ${activeSortTab === 'earliest' ? 'text-blue-100' : 'text-slate-400'}`}>
                        ₹{flightMetrics.earliestFlight.basePrice.toLocaleString('en-IN')} • {flightMetrics.earliestFlight.departureTime}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Secondary Sort Dropdown */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f1f3ff] border border-slate-200">
                  <span className="text-xs text-slate-400 font-semibold">Sort By:</span>
                  <select
                    value={sortDropdown}
                    onChange={(e) => handleSortDropdownChange(e.target.value)}
                    className="bg-transparent text-xs font-bold text-[#141b2b] focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="price-asc">Price (Low to High)</option>
                    <option value="price-desc">Price (High to Low)</option>
                    <option value="duration-asc">Duration (Shortest)</option>
                    <option value="departure-asc">Departure (Earliest)</option>
                    <option value="arrival-asc">Arrival (Earliest)</option>
                  </select>
                </div>
              </div>

              {/* FLIGHT RESULTS STACK */}
              <div className="space-y-4">
                {displayedFlights.length === 0 ? (
                  <div className="bg-white rounded-xl p-10 text-center shadow-xs border border-slate-100">
                    <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">flight_takeoff</span>
                    <h3 className="text-lg font-bold text-[#141b2b]">No flights match your filters</h3>
                    <p className="text-sm text-slate-500 mt-1">Try resetting your filters or adjusting your price range.</p>
                    <button
                      onClick={handleClearFilters}
                      className="mt-4 px-6 py-2 rounded-full bg-[#0053d3] text-white font-bold text-xs"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  displayedFlights.map((flight) => {
                    const isExpanded = expandedFlightId === flight.id;
                    const wishlistItemId = buildWishlistItemId(
                      flight.id,
                      searchParams.departureDate,
                      searchParams.cabinClass
                    );
                    const isWishlisted = wishlistIds.has(wishlistItemId);
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
                      <div
                        key={flight.id}
                        className={`bg-white rounded-xl shadow-xs hover:shadow-md transition-all overflow-hidden border border-slate-100 ${
                          flight.ribbonTag === 'CHEAPEST • Best Value Option' ? 'border-[#0053d3]/30' : ''
                        }`}
                      >
                        {/* Highlight Ribbon */}
                        {flight.ribbonTag && (
                          <div className="bg-[#e9edff] flex items-center justify-between px-4 py-1.5 border-b border-blue-100">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#00819b] animate-ping"></span>
                              <span className="text-[10px] text-[#00819b] font-bold uppercase tracking-wider">
                                {flight.ribbonTag}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500">Unlocked ₹500 off with FLYKART12</span>
                          </div>
                        )}

                        <div className="p-4 sm:p-6">
                          <div className="grid grid-cols-12 gap-4 items-center">
                            {/* Airline Brand */}
                            <div className="col-span-12 sm:col-span-3 flex items-center gap-3">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shadow-xs shrink-0 ${badgeColor}`}>
                                <span className="font-headline-sm text-base">{flight.airlineCode}</span>
                              </div>
                              <div className="min-w-0">
                                <div className="font-headline-sm text-base font-bold text-[#141b2b] truncate">
                                  {flight.airline}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {flight.flightNumber} • {flight.aircraft}
                                </div>
                              </div>
                            </div>

                            {/* Journey Timings & Route Visual (STRICT: Duration on one line above, Non Stop on one line below) */}
                            <div className="col-span-12 sm:col-span-6 flex items-center justify-between px-1 sm:px-3">
                              {/* Origin */}
                              <div className="text-left shrink-0">
                                <div className="font-headline-md text-xl sm:text-2xl font-bold text-[#141b2b]">
                                  {flight.departureTime}
                                </div>
                                <div className="font-label-lg text-xs font-bold text-[#424655]">
                                  {searchParams.fromCity.code}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate max-w-[90px] sm:max-w-[110px]">
                                  {flight.originTerminal}
                                </div>
                              </div>

                              {/* Flight Track Graphic - duration clearly above, stops label below */}
                              <div className="flex-1 px-3 sm:px-4 flex flex-col items-center select-none">
                                <span className="text-[11px] text-slate-500 font-semibold mb-1 leading-none whitespace-nowrap">
                                  {flight.duration}
                                </span>
                                <div className="relative w-full flex items-center justify-center my-1">
                                  <div className="w-full h-0.5 bg-slate-200"></div>
                                  <div className="absolute w-2 h-2 rounded-full bg-[#fe6a34] left-0"></div>
                                  <span className="material-symbols-outlined absolute text-[18px] text-[#fe6a34] rotate-90 bg-white px-1">
                                    flight
                                  </span>
                                  <div className="absolute w-2 h-2 rounded-full bg-slate-300 right-0"></div>
                                </div>
                                <span className="mt-1 text-[10px] text-slate-500 leading-none whitespace-nowrap">
                                  {flight.stopsLabel}
                                </span>
                              </div>

                              {/* Destination */}
                              <div className="text-right shrink-0">
                                <div className="font-headline-md text-xl sm:text-2xl font-bold text-[#141b2b] inline-flex items-baseline justify-end gap-1 whitespace-nowrap">
                                  <span>{flight.arrivalTime}</span>
                                  {flight.arrivalTime < flight.departureTime && (
                                    <span className="text-[10px] font-bold text-[#ab3500] leading-none">+1 day</span>
                                  )}
                                </div>
                                <div className="font-label-lg text-xs font-bold text-[#424655]">
                                  {searchParams.toCity.code}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate max-w-[90px] sm:max-w-[110px]">
                                  {flight.destTerminal}
                                </div>
                              </div>
                            </div>

                            {/* Fare Action Column (STRICT: "View Prices" on one line) */}
                            <div className="col-span-12 sm:col-span-3 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0">
                              <div className="flex items-center gap-2.5 sm:flex-row-reverse">
                                <button
                                  type="button"
                                  onClick={() => onToggleWishlist(flight)}
                                  aria-label={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                                  title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                                  data-purpose="wishlist-heart-button"
                                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                    isWishlisted
                                      ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                                      : 'bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                                  }`}
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill={isWishlisted ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                  </svg>
                                </button>
                                <div className="text-left sm:text-right">
                                  {flight.originalPrice && (
                                    <div className="text-xs text-slate-400 line-through">
                                      ₹{flight.originalPrice.toLocaleString('en-IN')}
                                    </div>
                                  )}
                                  <div className="font-headline-lg text-xl sm:text-2xl font-bold text-[#141b2b]">
                                    ₹{flight.basePrice.toLocaleString('en-IN')}
                                  </div>
                                  <div className="text-[10px] text-slate-400">per adult + taxes</div>
                                </div>
                              </div>

                              <button
                                onClick={() => onSelectFlight(flight)}
                                className="sm:mt-2 px-5 sm:px-6 py-2 rounded-full bg-[#0053d3] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                                type="button"
                              >
                                <span>View Prices</span>
                                <span className="material-symbols-outlined text-[16px]">expand_more</span>
                              </button>
                            </div>
                          </div>

                          {/* Card Bottom Segment Amenities & Details Trigger */}
                          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-slate-500 text-xs">
                            <div className="flex items-center gap-4 flex-wrap">
                              {flight.mealIncluded ? (
                                <div className="flex items-center gap-1 text-[#00667c] font-semibold">
                                  <span className="material-symbols-outlined text-[16px]">done_all</span>
                                  <span>Complimentary Meal</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[16px]">restaurant</span>
                                  <span>In-flight meal available</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">luggage</span>
                                <span>Cabin {flight.baggage.cabin} • Check-in {flight.baggage.checkIn}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => setExpandedFlightId(isExpanded ? null : flight.id)}
                              className="text-xs text-[#0053d3] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                              type="button"
                            >
                              <span>{isExpanded ? 'Hide Details' : 'Flight Details'}</span>
                              <span className="material-symbols-outlined text-[14px]">
                                {isExpanded ? 'expand_less' : 'arrow_forward'}
                              </span>
                            </button>
                          </div>

                          {/* Expanded Details Section */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-dashed border-slate-200 bg-[#f9f9ff] rounded-lg p-4 animate-fadeIn">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div>
                                  <span className="font-bold text-[#141b2b] block mb-1">Baggage Allowance</span>
                                  <p className="text-slate-600">Cabin Baggage: {flight.baggage.cabin}</p>
                                  <p className="text-slate-600">Check-in Baggage: {flight.baggage.checkIn}</p>
                                </div>
                                <div>
                                  <span className="font-bold text-[#141b2b] block mb-1">Fare Rules & Flexibility</span>
                                  <p className="text-slate-600">
                                    {flight.refundable ? 'Refundable with standard cancellation fees' : 'Non-Refundable fare'}
                                  </p>
                                  <p className="text-slate-600">Date change permitted up to 2 hrs before flight</p>
                                </div>
                                  <div>
                                  <span className="font-bold text-[#141b2b] block mb-1">Aircraft &amp; Perks</span>
                                  <p className="text-slate-600">{flight.aircraft} with standard legroom</p>
                                  <p className="text-slate-600">{flight.amenities.join(', ')}</p>
                                  {flight.viaCity && (
                                    <p className="text-[#0053d3] font-semibold mt-0.5">1 Stop via {flight.viaCity}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Show More Flights Button */}
              {visibleCount < filteredFlights.length && (
                <div className="pt-4 pb-8 flex flex-col items-center justify-center gap-2 text-center">
                  <span className="text-xs text-slate-400">
                    Showing {displayedFlights.length} of {filteredFlights.length} flights
                  </span>
                  <button
                    onClick={() => setVisibleCount((prev) => Math.min(prev + 6, filteredFlights.length))}
                    className="px-8 py-2.5 rounded-full bg-white hover:bg-slate-100 text-[#0053d3] font-bold text-xs shadow-xs border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                    type="button"
                  >
                    <span>Show More Flights</span>
                    <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="mt-auto min-h-12 py-3 bg-[#0B132B] text-slate-400 px-6 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <BrandLogo onClick={onNavigateHome} size="sm" />
          <span className="text-slate-600 hidden sm:inline">•</span>
          <div>© 2026 TravelKart. Educational project. All rights reserved.</div>
        </div>
        <div>Fares shown are simulated for this educational project</div>
        <div className="flex items-center gap-6">
          <span className="hidden sm:inline text-slate-500">Secure Flight Engine v2.4</span>
          <button 
            onClick={() => onOpenComingSoon('Support Center')} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            Support
          </button>
        </div>
      </footer>
    </div>
  );
};
