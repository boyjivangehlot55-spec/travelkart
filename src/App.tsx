/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TravelKart - College Flight Booking Project
 * A simple, responsive single-page flight booking web application
 * Navigation flow: Landing -> Results -> Booking -> Confirmation
 */

import { useState } from 'react';
import { SearchParams, Flight, BookingRecord } from './types';
import { CITIES, FLIGHTS } from './data/flightData';
import { LandingPage } from './components/LandingPage';
import { ResultsPage } from './components/ResultsPage';
import { BookingPage } from './components/BookingPage';
import { ConfirmationPage } from './components/ConfirmationPage';
import { ComingSoonModal } from './components/ComingSoonModal';

export default function App() {
  // Navigation state: 'landing' | 'results' | 'booking' | 'confirmation'
  const [currentView, setCurrentView] = useState<'landing' | 'results' | 'booking' | 'confirmation'>('landing');

  // Active search parameters (Default: Delhi -> Bengaluru)
  const [searchParams, setSearchParams] = useState<SearchParams>({
    tripType: 'oneway',
    fromCity: CITIES[0], // Delhi (DEL)
    toCity: CITIES[2],   // Bengaluru (BLR)
    departureDate: '2026-10-31',
    departureDisplayDate: "31 Oct'26",
    departureDay: 'Saturday',
    adults: 1,
    children: 0,
    cabinClass: 'Economy',
    specialFare: 'Regular',
  });

  // Selected flight for checkout
  const [selectedFlight, setSelectedFlight] = useState<Flight>(FLIGHTS[0]);

  // Completed booking record for confirmation
  const [completedBooking, setCompletedBooking] = useState<BookingRecord | null>(null);

  // Coming Soon modal popup state
  const [comingSoonFeature, setComingSoonFeature] = useState<string | null>(null);

  // Trigger search from landing page
  const handleSearch = () => {
    setCurrentView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Select flight to start booking
  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    setCurrentView('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Proceed to payment & show confirmation
  const handleProceedToPay = (record: BookingRecord) => {
    setCompletedBooking(record);
    setCurrentView('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Return to landing page
  const handleNavigateHome = () => {
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F4F5F8] text-slate-800 antialiased font-sans flex flex-col selection:bg-[#065AF3] selection:text-white">
      {/* 1. Landing View */}
      {currentView === 'landing' && (
        <LandingPage
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          onSearch={handleSearch}
          onOpenComingSoon={(feature) => setComingSoonFeature(feature)}
        />
      )}

      {/* 2. Results View */}
      {currentView === 'results' && (
        <ResultsPage
          searchParams={searchParams}
          onSelectFlight={handleSelectFlight}
          onModifySearch={() => {
            setCurrentView('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateHome={handleNavigateHome}
          onOpenComingSoon={(feature) => setComingSoonFeature(feature)}
        />
      )}

      {/* 3. Booking View */}
      {currentView === 'booking' && (
        <BookingPage
          flight={selectedFlight}
          searchParams={searchParams}
          onProceedToPay={handleProceedToPay}
          onBackToResults={() => {
            setCurrentView('results');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateHome={handleNavigateHome}
          onOpenComingSoon={(feature) => setComingSoonFeature(feature)}
        />
      )}

      {/* 4. Confirmation View */}
      {currentView === 'confirmation' && completedBooking && (
        <ConfirmationPage
          bookingRecord={completedBooking}
          onNavigateHome={handleNavigateHome}
          onOpenComingSoon={(feature) => setComingSoonFeature(feature)}
        />
      )}

      {/* Universal Coming Soon Popup Modal */}
      <ComingSoonModal
        isOpen={!!comingSoonFeature}
        featureName={comingSoonFeature || undefined}
        onClose={() => setComingSoonFeature(null)}
      />
    </div>
  );
}
