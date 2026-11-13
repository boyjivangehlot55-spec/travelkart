/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * TravelKart - College Flight Booking Project
 * A simple, responsive single-page flight booking web application
 * Navigation flow: Landing -> Results -> Booking -> Confirmation (+ My Trips & Wishlist)
 */

import { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  SearchParams,
  Flight,
  BookingRecord,
  TripRecord,
  WishlistItem,
} from './types';
import { CITIES, getDateInfo, getTodayDateString } from './data/flightData';
import {
  auth,
  signInWithGoogle,
  signOutUser,
  saveTripToFirestore,
  addWishlistItemToFirestore,
  removeWishlistItemFromFirestore,
  subscribeToTrips,
  subscribeToWishlist,
  buildWishlistItemId,
} from './firebase';
import { LandingPage } from './components/LandingPage';
import { ResultsPage } from './components/ResultsPage';
import { BookingPage } from './components/BookingPage';
import { ConfirmationPage } from './components/ConfirmationPage';
import { MyTripsPage } from './components/MyTripsPage';
import { WishlistPage } from './components/WishlistPage';
import { ComingSoonModal } from './components/ComingSoonModal';

type ViewName = 'landing' | 'results' | 'booking' | 'confirmation' | 'trips' | 'wishlist';

export default function App() {
  // Navigation state
  const [currentView, setCurrentView] = useState<ViewName>('landing');

  // Firebase Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Firestore synced collections for the signed-in user
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Active search parameters (Default: Delhi -> Bengaluru, Departure = tomorrow)
  const [searchParams, setSearchParams] = useState<SearchParams>(() => {
    const tomorrow = getDateInfo(undefined, 1);
    return {
      tripType: 'oneway',
      fromCity: CITIES[0], // Delhi (DEL)
      toCity: CITIES[2],   // Bengaluru (BLR)
      departureDate: tomorrow.isoDate,
      departureDisplayDate: tomorrow.displayDate,
      departureDay: tomorrow.dayName,
      adults: 1,
      children: 0,
      cabinClass: 'Economy',
      specialFare: 'Regular',
    };
  });

  // Selected flight & booking states
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [completedBooking, setCompletedBooking] = useState<BookingRecord | null>(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [wishlistError, setWishlistError] = useState<string | null>(null);

  // Coming Soon modal popup state
  const [comingSoonFeature, setComingSoonFeature] = useState<string | null>(null);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
      if (!firebaseUser) {
        setTrips([]);
        setWishlistItems([]);
        setTripsLoading(false);
        setWishlistLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to user's Trips & Wishlist when authenticated
  useEffect(() => {
    if (!authReady || !user) return;

    setTripsLoading(true);
    setWishlistLoading(true);

    const unsubTrips = subscribeToTrips(
      user.uid,
      (fetchedTrips) => {
        setTrips(fetchedTrips);
        setTripsLoading(false);
      },
      () => {
        setTripsLoading(false);
      }
    );

    const unsubWishlist = subscribeToWishlist(
      user.uid,
      (fetchedWishlist) => {
        setWishlistItems(fetchedWishlist);
        setWishlistLoading(false);
      },
      () => {
        setWishlistLoading(false);
      }
    );

    return () => {
      unsubTrips();
      unsubWishlist();
    };
  }, [authReady, user]);

  // Fast lookup Set for wishlist hearts on ResultsPage
  const wishlistIds = useMemo(
    () => new Set(wishlistItems.map((item) => item.itemId)),
    [wishlistItems]
  );

  // Auth Actions
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign-in error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  // Navigation helpers
  const navigateTo = (view: ViewName) => {
    setBookingError(null);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = () => navigateTo('results');
  const handleNavigateHome = () => navigateTo('landing');
  const handleNavigateTrips = () => navigateTo('trips');
  const handleNavigateWishlist = () => navigateTo('wishlist');

  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    setBookingError(null);
    setCurrentView('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Proceed to payment: enforce Google sign-in first if signed out, save to Firestore, show confirmation
  const handleProceedToPay = async (record: BookingRecord) => {
    setBookingError(null);
    setIsSubmittingBooking(true);

    try {
      let activeUser = auth.currentUser || user;
      if (!activeUser) {
        activeUser = await signInWithGoogle();
      }

      if (!activeUser) {
        setBookingError('Please sign in with Google to confirm your booking.');
        setIsSubmittingBooking(false);
        return;
      }

      await saveTripToFirestore(activeUser.uid, record);
      setCompletedBooking(record);
      setCurrentView('confirmation');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message : String(err);
      let realError = rawMsg || 'Booking save failed.';
      if (rawMsg.startsWith('{')) {
        try {
          const parsed = JSON.parse(rawMsg) as { error?: string };
          if (parsed?.error) {
            realError = parsed.error;
          }
        } catch {
          // keep rawMsg
        }
      }
      setBookingError(realError);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Wishlist heart toggle on ResultsPage
  const handleToggleWishlist = async (flight: Flight) => {
    setWishlistError(null);
    try {
      let activeUser = auth.currentUser || user;
      if (!activeUser) {
        activeUser = await signInWithGoogle();
      }
      if (!activeUser) return;

      const itemId = buildWishlistItemId(
        flight.id,
        searchParams.departureDate,
        searchParams.cabinClass
      );

      if (wishlistIds.has(itemId)) {
        await removeWishlistItemFromFirestore(activeUser.uid, itemId);
      } else {
        await addWishlistItemToFirestore(activeUser.uid, flight, searchParams);
      }
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message : String(err);
      let realError = rawMsg || 'Wishlist save failed.';
      if (rawMsg.startsWith('{')) {
        try {
          const parsed = JSON.parse(rawMsg) as { error?: string };
          if (parsed?.error) {
            realError = parsed.error;
          }
        } catch {
          // keep rawMsg
        }
      }
      setWishlistError(realError);
    }
  };

  const handleRemoveWishlistItem = async (itemId: string) => {
    const activeUser = auth.currentUser || user;
    if (!activeUser) return;
    try {
      await removeWishlistItemFromFirestore(activeUser.uid, itemId);
    } catch (err) {
      console.error('Wishlist remove failed:', err);
    }
  };

  // Open BookingPage directly for a saved wishlist flight (preserving current traveller counts)
  const handleBookWishlistItem = (item: WishlistItem) => {
    if (item.departureDateIso < getTodayDateString()) {
      return;
    }

    const fullFrom =
      CITIES.find((c) => c.code === item.fromCity.code) || item.fromCity;
    const fullTo =
      CITIES.find((c) => c.code === item.toCity.code) || item.toCity;

    setSearchParams((prev) => ({
      ...prev,
      tripType: 'oneway',
      fromCity: fullFrom,
      toCity: fullTo,
      departureDate: item.departureDateIso,
      departureDisplayDate: item.departureDisplayDate,
      departureDay: item.departureDay,
      cabinClass: item.cabinClass,
    }));
    setSelectedFlight(item.flight);
    navigateTo('booking');
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
          user={user}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          onNavigateTrips={handleNavigateTrips}
          onNavigateWishlist={handleNavigateWishlist}
        />
      )}

      {/* 2. Results View */}
      {currentView === 'results' && (
        <ResultsPage
          searchParams={searchParams}
          onSelectFlight={handleSelectFlight}
          onModifySearch={handleNavigateHome}
          onNavigateHome={handleNavigateHome}
          onOpenComingSoon={(feature) => setComingSoonFeature(feature)}
          user={user}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          onNavigateTrips={handleNavigateTrips}
          onNavigateWishlist={handleNavigateWishlist}
          wishlistIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
          wishlistError={wishlistError}
        />
      )}

      {/* 3. Booking View */}
      {currentView === 'booking' && selectedFlight && (
        <BookingPage
          flight={selectedFlight}
          searchParams={searchParams}
          onProceedToPay={handleProceedToPay}
          onBackToResults={() => navigateTo('results')}
          onNavigateHome={handleNavigateHome}
          onOpenComingSoon={(feature) => setComingSoonFeature(feature)}
          user={user}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          onNavigateTrips={handleNavigateTrips}
          onNavigateWishlist={handleNavigateWishlist}
          isSubmitting={isSubmittingBooking}
          bookingError={bookingError}
        />
      )}

      {/* 4. Confirmation View */}
      {currentView === 'confirmation' && completedBooking && (
        <ConfirmationPage
          bookingRecord={completedBooking}
          onNavigateHome={handleNavigateHome}
          onOpenComingSoon={(feature) => setComingSoonFeature(feature)}
          user={user}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          onNavigateTrips={handleNavigateTrips}
          onNavigateWishlist={handleNavigateWishlist}
        />
      )}

      {/* 5. My Trips View */}
      {currentView === 'trips' && (
        <MyTripsPage
          trips={trips}
          user={user}
          authReady={authReady}
          isLoading={tripsLoading}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          onNavigateHome={handleNavigateHome}
          onNavigateTrips={handleNavigateTrips}
          onNavigateWishlist={handleNavigateWishlist}
          onOpenComingSoon={(feature) => setComingSoonFeature(feature)}
        />
      )}

      {/* 6. Wishlist View */}
      {currentView === 'wishlist' && (
        <WishlistPage
          items={wishlistItems}
          user={user}
          authReady={authReady}
          isLoading={wishlistLoading}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          onNavigateHome={handleNavigateHome}
          onNavigateTrips={handleNavigateTrips}
          onNavigateWishlist={handleNavigateWishlist}
          onRemoveItem={handleRemoveWishlistItem}
          onBookItem={handleBookWishlistItem}
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
