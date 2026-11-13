import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getFirestore,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  BookingRecord,
  City,
  CitySummary,
  Flight,
  PassengerDetails,
  SearchParams,
  TripRecord,
  WishlistItem,
} from './types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Verify Firestore connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const baseMsg = error instanceof Error ? error.message : String(error);
  const code = (error as { code?: string })?.code;
  const fullMsg = code && !baseMsg.includes(code) ? `${baseMsg} (${code})` : baseMsg;

  const errInfo: FirestoreErrorInfo = {
    error: fullMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function removeUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => removeUndefined(item)) as unknown as T;
  }
  if (isPlainObject(value)) {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (v !== undefined) {
        cleaned[k] = removeUndefined(v);
      }
    }
    return cleaned as T;
  }
  return value;
}

function clipStr(val: string | undefined | null, maxLen: number): string {
  return (val ?? '').trim().slice(0, maxLen);
}

function sanitizeCity(city: City): CitySummary {
  return {
    name: clipStr(city.name, 60) || 'City',
    code: clipStr(city.code, 10) || 'CTY',
    airport: clipStr(city.airport, 120) || 'Airport',
  };
}

function sanitizeFlight(flight: Flight) {
  return {
    id: clipStr(flight.id, 64),
    airline: flight.airline,
    airlineCode: flight.airlineCode,
    flightNumber: clipStr(flight.flightNumber, 20),
    aircraft: clipStr(flight.aircraft, 40),
    departureTime: clipStr(flight.departureTime, 10),
    arrivalTime: clipStr(flight.arrivalTime, 10),
    duration: clipStr(flight.duration, 20),
    durationMinutes: Number(flight.durationMinutes) || 60,
    departureSlot: flight.departureSlot,
    originTerminal: clipStr(flight.originTerminal, 40),
    destTerminal: clipStr(flight.destTerminal, 40),
    basePrice: Number(flight.basePrice) || 1,
    stops: flight.stops,
    stopsLabel: flight.stopsLabel,
    viaCity: clipStr(flight.viaCity ?? '', 80),
    refundable: Boolean(flight.refundable),
    mealIncluded: Boolean(flight.mealIncluded),
    baggage: {
      cabin: clipStr(flight.baggage?.cabin, 30) || '7 kg',
      checkIn: clipStr(flight.baggage?.checkIn, 40) || '15 kg',
    },
  };
}

function sanitizePassenger(p: PassengerDetails) {
  return {
    id: clipStr(p.id, 32),
    type: p.type,
    label: clipStr(p.label, 24),
    gender: p.gender,
    firstName: clipStr(p.firstName, 80),
    lastName: clipStr(p.lastName, 80),
    age: clipStr(p.age ?? '', 10),
    email: clipStr(p.email ?? '', 120),
    mobile: clipStr(p.mobile ?? '', 20),
  };
}

export function buildWishlistItemId(
  flightId: string,
  departureDateIso: string,
  cabinClass: SearchParams['cabinClass']
): string {
  const raw = `${flightId}_${departureDateIso}_${cabinClass.replace(/[^a-zA-Z0-9]/g, '')}`;
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
}

export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return null;
    }
    throw err;
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export async function saveTripToFirestore(userId: string, record: BookingRecord): Promise<void> {
  const path = `users/${userId}/trips/${record.bookingId}`;
  const travelDate = clipStr(
    `${record.searchParams.departureDay.slice(0, 3)}, ${record.searchParams.departureDisplayDate}`,
    40
  );

  const payload = removeUndefined({
    userId,
    bookingId: clipStr(record.bookingId, 32),
    bookingDate: clipStr(record.bookingDate, 40),
    travelDate,
    departureDateIso: clipStr(record.searchParams.departureDate, 20),
    departureDisplayDate: clipStr(record.searchParams.departureDisplayDate, 32),
    departureDay: clipStr(record.searchParams.departureDay, 20),
    fromCity: sanitizeCity(record.searchParams.fromCity),
    toCity: sanitizeCity(record.searchParams.toCity),
    cabinClass: record.searchParams.cabinClass,
    flight: sanitizeFlight(record.flight),
    passengers: record.passengers.slice(0, 15).map(sanitizePassenger),
    addOns: {
      seatSelection: Boolean(record.addOns.seatSelection),
      meal: Boolean(record.addOns.meal),
      insurance: Boolean(record.addOns.insurance),
    },
    paymentMethod: record.paymentMethod,
    pricing: {
      baseFare: Number(record.pricing.baseFare) || 1,
      taxes: Number(record.pricing.taxes) || 0,
      udf: Number(record.pricing.udf) || 0,
      addOnsTotal: Number(record.pricing.addOnsTotal) || 0,
      convenienceFee: Number(record.pricing.convenienceFee) || 0,
      discount: Number(record.pricing.discount) || 0,
      totalAmount: Number(record.pricing.totalAmount) || 0,
      couponApplied: clipStr(record.pricing.couponApplied ?? '', 32),
    },
    totalAmount: Number(record.pricing.totalAmount) || 0,
    createdAt: serverTimestamp(),
  });

  try {
    await setDoc(doc(db, 'users', userId, 'trips', payload.bookingId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function addWishlistItemToFirestore(
  userId: string,
  flight: Flight,
  searchParams: SearchParams
): Promise<void> {
  const itemId = buildWishlistItemId(flight.id, searchParams.departureDate, searchParams.cabinClass);
  const path = `users/${userId}/wishlist/${itemId}`;
  const travelDate = clipStr(
    `${searchParams.departureDay.slice(0, 3)}, ${searchParams.departureDisplayDate}`,
    40
  );

  const payload = removeUndefined({
    userId,
    itemId,
    flight: sanitizeFlight(flight),
    fromCity: sanitizeCity(searchParams.fromCity),
    toCity: sanitizeCity(searchParams.toCity),
    travelDate,
    departureDateIso: clipStr(searchParams.departureDate, 20),
    departureDisplayDate: clipStr(searchParams.departureDisplayDate, 32),
    departureDay: clipStr(searchParams.departureDay, 20),
    cabinClass: searchParams.cabinClass,
    createdAt: serverTimestamp(),
  });

  try {
    await setDoc(doc(db, 'users', userId, 'wishlist', itemId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function removeWishlistItemFromFirestore(
  userId: string,
  itemId: string
): Promise<void> {
  const path = `users/${userId}/wishlist/${itemId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'wishlist', itemId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

function extractTimestampMillis(ts: unknown): number {
  if (ts instanceof Timestamp) {
    return ts.toMillis();
  }
  if (ts && typeof (ts as { toMillis?: () => number }).toMillis === 'function') {
    return (ts as { toMillis: () => number }).toMillis();
  }
  return Date.now();
}

export function subscribeToTrips(
  userId: string,
  onUpdate: (trips: TripRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `users/${userId}/trips`;
  const q = query(
    collection(db, 'users', userId, 'trips'),
    where('userId', '==', userId),
    limit(100)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: TripRecord[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        const flightRaw = d.flight || {};
        const viaCityVal = typeof flightRaw.viaCity === 'string' && flightRaw.viaCity.length > 0
          ? flightRaw.viaCity
          : undefined;
        const flight: Flight = {
          id: flightRaw.id || docSnap.id,
          airline: flightRaw.airline,
          airlineCode: flightRaw.airlineCode,
          flightNumber: flightRaw.flightNumber,
          aircraft: flightRaw.aircraft,
          departureTime: flightRaw.departureTime,
          arrivalTime: flightRaw.arrivalTime,
          duration: flightRaw.duration,
          durationMinutes: flightRaw.durationMinutes,
          departureSlot: flightRaw.departureSlot,
          originTerminal: flightRaw.originTerminal,
          destTerminal: flightRaw.destTerminal,
          basePrice: flightRaw.basePrice,
          stops: flightRaw.stops,
          stopsLabel: flightRaw.stopsLabel,
          viaCity: viaCityVal,
          refundable: Boolean(flightRaw.refundable),
          mealIncluded: Boolean(flightRaw.mealIncluded),
          baggage: flightRaw.baggage || { cabin: '7 kg', checkIn: '15 kg' },
          amenities: [],
        };

        const pricingRaw = d.pricing || {};
        return {
          userId: d.userId,
          bookingId: d.bookingId || docSnap.id,
          bookingDate: d.bookingDate || '',
          travelDate: d.travelDate || '',
          departureDateIso: d.departureDateIso || '',
          departureDisplayDate: d.departureDisplayDate || '',
          departureDay: d.departureDay || '',
          fromCity: d.fromCity,
          toCity: d.toCity,
          cabinClass: d.cabinClass || 'Economy',
          flight,
          passengers: Array.isArray(d.passengers) ? d.passengers : [],
          addOns: d.addOns || { seatSelection: false, meal: false, insurance: false },
          paymentMethod: d.paymentMethod || 'upi',
          pricing: {
            baseFare: pricingRaw.baseFare || 0,
            taxes: pricingRaw.taxes || 0,
            udf: pricingRaw.udf || 0,
            addOnsTotal: pricingRaw.addOnsTotal || 0,
            convenienceFee: pricingRaw.convenienceFee || 0,
            discount: pricingRaw.discount || 0,
            totalAmount: pricingRaw.totalAmount ?? d.totalAmount ?? 0,
            couponApplied:
              typeof pricingRaw.couponApplied === 'string' && pricingRaw.couponApplied.length > 0
                ? pricingRaw.couponApplied
                : null,
          },
          totalAmount: d.totalAmount ?? pricingRaw.totalAmount ?? 0,
          createdAtMillis: extractTimestampMillis(d.createdAt),
        };
      });

      items.sort((a, b) => b.createdAtMillis - a.createdAtMillis);
      onUpdate(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError) onError(wrapped as Error);
      }
    }
  );
}

export function subscribeToWishlist(
  userId: string,
  onUpdate: (items: WishlistItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `users/${userId}/wishlist`;
  const q = query(
    collection(db, 'users', userId, 'wishlist'),
    where('userId', '==', userId),
    limit(100)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: WishlistItem[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        const flightRaw = d.flight || {};
        const viaCityVal = typeof flightRaw.viaCity === 'string' && flightRaw.viaCity.length > 0
          ? flightRaw.viaCity
          : undefined;
        const flight: Flight = {
          id: flightRaw.id || docSnap.id,
          airline: flightRaw.airline,
          airlineCode: flightRaw.airlineCode,
          flightNumber: flightRaw.flightNumber,
          aircraft: flightRaw.aircraft,
          departureTime: flightRaw.departureTime,
          arrivalTime: flightRaw.arrivalTime,
          duration: flightRaw.duration,
          durationMinutes: flightRaw.durationMinutes,
          departureSlot: flightRaw.departureSlot,
          originTerminal: flightRaw.originTerminal,
          destTerminal: flightRaw.destTerminal,
          basePrice: flightRaw.basePrice,
          stops: flightRaw.stops,
          stopsLabel: flightRaw.stopsLabel,
          viaCity: viaCityVal,
          refundable: Boolean(flightRaw.refundable),
          mealIncluded: Boolean(flightRaw.mealIncluded),
          baggage: flightRaw.baggage || { cabin: '7 kg', checkIn: '15 kg' },
          amenities: [],
        };

        return {
          userId: d.userId,
          itemId: d.itemId || docSnap.id,
          flight,
          fromCity: d.fromCity,
          toCity: d.toCity,
          travelDate: d.travelDate || '',
          departureDateIso: d.departureDateIso || '',
          departureDisplayDate: d.departureDisplayDate || '',
          departureDay: d.departureDay || '',
          cabinClass: d.cabinClass || 'Economy',
          createdAtMillis: extractTimestampMillis(d.createdAt),
        };
      });

      items.sort((a, b) => b.createdAtMillis - a.createdAtMillis);
      onUpdate(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError) onError(wrapped as Error);
      }
    }
  );
}
