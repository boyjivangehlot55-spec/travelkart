// Simulated dynamic flight generator and city/route data for TravelKart
import { City, Flight, SearchParams } from '../types';

// Format a local Date object as YYYY-MM-DD without UTC timezone drift
export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Parse YYYY-MM-DD in local time
export function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }
  return new Date(dateStr);
}

// Get device's real current date in YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  return toLocalDateString(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
}

// Compute ISO date, short display label (e.g. "13 Nov'26"), and weekday name with optional day offset
export function getDateInfo(baseDateStr?: string, offsetDays = 0): {
  isoDate: string;
  displayDate: string;
  dayName: string;
} {
  const base = baseDateStr
    ? parseLocalDate(baseDateStr)
    : (() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      })();
  const target = new Date(base.getFullYear(), base.getMonth(), base.getDate() + offsetDays);
  const isoDate = toLocalDateString(target);
  const dayNum = target.getDate();
  const monthName = target.toLocaleDateString('en-US', { month: 'short' });
  const year = String(target.getFullYear()).slice(-2);
  const dayName = target.toLocaleDateString('en-US', { weekday: 'long' });
  return {
    isoDate,
    displayDate: `${dayNum} ${monthName}'${year}`,
    dayName,
  };
}

export const CITIES: City[] = [
  { name: 'Delhi', code: 'DEL', airport: 'DEL, Delhi Airport India', lat: 28.5562, lng: 77.1000 },
  { name: 'Mumbai', code: 'BOM', airport: 'BOM, Chhatrapati Shivaji Maharaj Intl', lat: 19.0896, lng: 72.8656 },
  { name: 'Bengaluru', code: 'BLR', airport: 'BLR, Bengaluru International Airport', lat: 13.1986, lng: 77.7066 },
  { name: 'Kolkata', code: 'CCU', airport: 'CCU, Netaji Subhash Chandra Bose Intl', lat: 22.6547, lng: 88.4467 },
  { name: 'Chennai', code: 'MAA', airport: 'MAA, Chennai International Airport', lat: 12.9941, lng: 80.1709 },
  { name: 'Hyderabad', code: 'HYD', airport: 'HYD, Rajiv Gandhi International Airport', lat: 17.2403, lng: 78.4294 },
  { name: 'Pune', code: 'PNQ', airport: 'PNQ, Pune International Airport', lat: 18.5822, lng: 73.9197 },
  { name: 'Ahmedabad', code: 'AMD', airport: 'AMD, Sardar Vallabhbhai Patel Intl', lat: 23.0772, lng: 72.6347 },
  { name: 'Jaipur', code: 'JAI', airport: 'JAI, Jaipur International Airport', lat: 26.8242, lng: 75.8122 },
  { name: 'Goa', code: 'GOI', airport: 'GOI, Dabolim / Mopa International Airport', lat: 15.3808, lng: 73.8314 },
];

// Fallback coordinates for extra popular route cities if selected outside the 10 main cities
const EXTRA_CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  KUU: { lat: 31.8767, lng: 77.1544 },
  COK: { lat: 10.1520, lng: 76.4019 },
  UDR: { lat: 24.6177, lng: 73.8961 },
  VNS: { lat: 25.4524, lng: 82.8593 },
  SLV: { lat: 31.0818, lng: 77.0674 },
};

// Haversine great-circle distance in km
export function calculateDistanceKm(from: City, to: City): number {
  const fromFallback = CITIES.find((c) => c.code === from.code) || EXTRA_CITY_COORDS[from.code];
  const toFallback = CITIES.find((c) => c.code === to.code) || EXTRA_CITY_COORDS[to.code];

  const lat1 = from.lat ?? fromFallback?.lat ?? 28.5562;
  const lng1 = from.lng ?? fromFallback?.lng ?? 77.1000;
  const lat2 = to.lat ?? toFallback?.lat ?? 13.1986;
  const lng2 = to.lng ?? toFallback?.lng ?? 77.7066;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Deterministic string hash (FNV-1a 32-bit)
function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Mulberry32 seeded pseudo-random generator
function createSeededRng(seedStr: string): () => number {
  let a = hashSeed(seedStr) || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface AirlineConfig {
  name: Flight['airline'];
  code: Flight['airlineCode'];
  aircrafts: string[];
  priceFactor: number;
  defaultRefundable: boolean;
  defaultMeal: boolean;
  checkInBaggage: string;
  perks: string[];
}

const AIRLINES: AirlineConfig[] = [
  {
    name: 'IndiGo',
    code: '6E',
    aircrafts: ['A321 Neo', 'A320 Neo', 'A321'],
    priceFactor: 1.0,
    defaultRefundable: true,
    defaultMeal: false,
    checkInBaggage: '15 kg',
    perks: ['In-flight meal available', 'Free Web Check-in available'],
  },
  {
    name: 'Akasa Air',
    code: 'QP',
    aircrafts: ['B737 Max', 'B737-8200'],
    priceFactor: 0.96,
    defaultRefundable: false,
    defaultMeal: false,
    checkInBaggage: '15 kg',
    perks: ['USB In-seat Power', 'Pre-book Cafe Akasa'],
  },
  {
    name: 'Air India',
    code: 'AI',
    aircrafts: ['A350-900', 'A321', 'B787-8'],
    priceFactor: 1.09,
    defaultRefundable: true,
    defaultMeal: true,
    checkInBaggage: '20 kg (Extra 5kg)',
    perks: ['Complimentary Hot Meal', 'Free 20kg Check-in (Extra 5kg)'],
  },
  {
    name: 'Air India Express',
    code: 'IX',
    aircrafts: ['B737 Max', 'A320 Neo'],
    priceFactor: 1.04,
    defaultRefundable: true,
    defaultMeal: true,
    checkInBaggage: '15 kg',
    perks: ['Wi-Fi Enabled', 'AirFlix In-flight Streaming'],
  },
  {
    name: 'SpiceJet',
    code: 'SG',
    aircrafts: ['B737-800', 'B737 Max'],
    priceFactor: 0.93,
    defaultRefundable: false,
    defaultMeal: false,
    checkInBaggage: '15 kg',
    perks: ['Paid Snacks & Drinks', '15kg Check-in'],
  },
];

const CITY_TERMINALS: Record<string, string[]> = {
  DEL: ['Terminal 3', 'Terminal 2', 'Terminal 1C'],
  BOM: ['Terminal 2', 'Terminal 1'],
  BLR: ['Terminal 1', 'Terminal 2'],
  CCU: ['Terminal 2', 'Terminal 1'],
  MAA: ['Terminal 1', 'Terminal 4'],
  HYD: ['Main Terminal'],
  PNQ: ['Main Terminal'],
  AMD: ['Terminal 1', 'Terminal 2'],
  JAI: ['Terminal 2', 'Terminal 1'],
  GOI: ['Terminal 1', 'Dabolim T1'],
};

function formatTime(totalMinutes: number): string {
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
  const hrs = Math.floor(wrapped / 60);
  const mins = wrapped % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

function getDatePriceMultiplier(departureDateStr: string): number {
  const parts = departureDateStr.split('-');
  if (parts.length !== 3) return 1.0;

  const depDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysAhead = Math.round((depDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Weekend multiplier (Sat = 6, Sun = 0)
  const dayOfWeek = depDate.getDay();
  const weekendMult = dayOfWeek === 0 || dayOfWeek === 6 ? 1.14 : dayOfWeek === 5 ? 1.06 : 1.0;

  // Advance booking curve: higher < 7 days away, cheaper far ahead
  let advanceMult = 1.0;
  if (daysAhead < 7) {
    advanceMult = 1.26;
  } else if (daysAhead <= 14) {
    advanceMult = 1.06;
  } else if (daysAhead >= 30) {
    advanceMult = 0.86;
  } else {
    advanceMult = 0.94;
  }

  return weekendMult * advanceMult;
}

export function generateFlightsForSearch(searchParams: SearchParams): {
  flights: Flight[];
  usualSavings: number;
} {
  const { fromCity, toCity, departureDate, cabinClass } = searchParams;
  const seed = `${fromCity.code}-${toCity.code}-${departureDate}`;
  const rng = createSeededRng(seed);

  const distanceKm = Math.max(120, calculateDistanceKm(fromCity, toCity));
  // Duration: ~55-70m for short routes (~150-300km) up to ~175-185m (~3h) for long routes (~1700-2100km)
  const baseNonStopMinutes = Math.min(
    185,
    Math.max(55, Math.round((50 + (distanceKm / 1850) * 125) / 5) * 5)
  );

  // 12 to 15 flights deterministically
  const totalFlights = 12 + Math.floor(rng() * 4);
  // About 80% Non Stop, ~20% 1 Stop
  const oneStopCount = Math.max(2, Math.round(totalFlights * 0.2));
  const stopFlags: boolean[] = Array.from({ length: totalFlights }, (_, idx) => idx >= totalFlights - oneStopCount);
  // Shuffle stopFlags deterministically
  for (let i = stopFlags.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [stopFlags[i], stopFlags[j]] = [stopFlags[j], stopFlags[i]];
  }

  // Candidate layover cities from the 10-city list
  const layoverCandidates = CITIES.filter(
    (c) => c.code !== fromCity.code && c.code !== toCity.code
  );

  // Spread departure windows evenly across the day
  const departureWindows: Array<{ slot: Flight['departureSlot']; minHour: number; maxHour: number; slotFactor: number }> = [
    { slot: 'early', minHour: 4, maxHour: 5, slotFactor: 0.9 },
    { slot: 'morning', minHour: 6, maxHour: 8, slotFactor: 1.07 },
    { slot: 'morning', minHour: 9, maxHour: 11, slotFactor: 1.05 },
    { slot: 'afternoon', minHour: 12, maxHour: 14, slotFactor: 1.0 },
    { slot: 'afternoon', minHour: 15, maxHour: 17, slotFactor: 1.02 },
    { slot: 'night', minHour: 18, maxHour: 20, slotFactor: 0.98 },
    { slot: 'night', minHour: 21, maxHour: 23, slotFactor: 0.93 },
  ];

  const dateMult = getDatePriceMultiplier(departureDate);
  const cabinMult =
    cabinClass === 'Premium Economy' ? 1.4 : cabinClass === 'Business' ? 2.5 : 1.0;

  // Ensure all 5 airlines appear at least once, then random picks
  const airlineIndices: number[] = [0, 1, 2, 3, 4];
  while (airlineIndices.length < totalFlights) {
    airlineIndices.push(Math.floor(rng() * AIRLINES.length));
  }
  for (let i = airlineIndices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [airlineIndices[i], airlineIndices[j]] = [airlineIndices[j], airlineIndices[i]];
  }

  const usedFlightNumbers = new Set<string>();
  const fromTerms = CITY_TERMINALS[fromCity.code] || ['Terminal 1', 'Terminal 2'];
  const toTerms = CITY_TERMINALS[toCity.code] || ['Terminal 1', 'Terminal 2'];

  const flights: Flight[] = [];

  for (let i = 0; i < totalFlights; i++) {
    const airlineCfg = AIRLINES[airlineIndices[i]];
    const isOneStop = stopFlags[i];

    // Unique 3-4 digit flight number
    let flightNumStr = '';
    do {
      const useFourDigits = rng() > 0.35;
      const num = useFourDigits
        ? 1000 + Math.floor(rng() * 8900)
        : 100 + Math.floor(rng() * 899);
      flightNumStr = `${airlineCfg.code} ${num}`;
    } while (usedFlightNumbers.has(flightNumStr));
    usedFlightNumbers.add(flightNumStr);

    // Departure window spread across day
    const win = departureWindows[i % departureWindows.length];
    const depHour = win.minHour + Math.floor(rng() * (win.maxHour - win.minHour + 1));
    const depMin = Math.floor(rng() * 12) * 5;
    const departureMinutes = depHour * 60 + depMin;

    // Duration
    const variance = (Math.floor(rng() * 4) - 1) * 5; // -5, 0, +5, +10
    const layoverMinutes = isOneStop ? (11 + Math.floor(rng() * 8)) * 5 : 0; // +55 to +90m
    const durationMinutes = Math.max(50, baseNonStopMinutes + variance + layoverMinutes);

    const viaCityObj = isOneStop
      ? layoverCandidates[Math.floor(rng() * layoverCandidates.length)]
      : undefined;

    // Base distance fare
    const distanceFare = 2450 + distanceKm * 1.82;
    const stopMult = isOneStop ? 0.92 : 1.0;
    const jitter = 0.96 + rng() * 0.09; // 0.96 - 1.05
    const rawEconomy = distanceFare * airlineCfg.priceFactor * win.slotFactor * dateMult * stopMult * jitter;
    const basePrice = Math.max(1999, Math.round((rawEconomy * cabinMult) / 10) * 10);

    const showDiscount = rng() > 0.55;
    const originalPrice = showDiscount
      ? Math.round((basePrice + (350 + Math.floor(rng() * 5) * 100) * cabinMult) / 10) * 10
      : undefined;

    const refundable = airlineCfg.defaultRefundable || rng() > 0.65;
    const extraMealRoll = rng();
    const mealIncluded = airlineCfg.defaultMeal || (cabinClass !== 'Economy' && extraMealRoll > 0.4);

    flights.push({
      id: `tk-${fromCity.code}-${toCity.code}-${i + 1}`,
      airline: airlineCfg.name,
      airlineCode: airlineCfg.code,
      flightNumber: flightNumStr,
      aircraft: airlineCfg.aircrafts[Math.floor(rng() * airlineCfg.aircrafts.length)],
      departureTime: formatTime(departureMinutes),
      arrivalTime: formatTime(departureMinutes + durationMinutes),
      duration: formatDuration(durationMinutes),
      durationMinutes,
      departureSlot: win.slot,
      originTerminal: fromTerms[Math.floor(rng() * fromTerms.length)],
      destTerminal: toTerms[Math.floor(rng() * toTerms.length)],
      basePrice,
      originalPrice,
      stops: isOneStop ? 1 : 0,
      stopsLabel: isOneStop ? '1 Stop' : 'Non Stop',
      viaCity: viaCityObj ? `${viaCityObj.name} (${viaCityObj.code})` : undefined,
      refundable,
      mealIncluded,
      baggage: {
        cabin: '7 kg',
        checkIn: airlineCfg.checkInBaggage,
      },
      amenities: airlineCfg.perks,
    });
  }

  // Assign ribbon tags to cheapest, fastest, and a meal-included flight
  let cheapestIdx = 0;
  let fastestIdx = 0;
  for (let i = 1; i < flights.length; i++) {
    if (flights[i].basePrice < flights[cheapestIdx].basePrice) cheapestIdx = i;
    if (flights[i].durationMinutes < flights[fastestIdx].durationMinutes) fastestIdx = i;
  }
  flights[cheapestIdx].ribbonTag = 'CHEAPEST • Best Value Option';
  if (fastestIdx !== cheapestIdx) {
    flights[fastestIdx].ribbonTag = 'Fastest';
  }
  const mealIdx = flights.findIndex((f, idx) => idx !== cheapestIdx && idx !== fastestIdx && f.mealIncluded);
  if (mealIdx !== -1) {
    flights[mealIdx].ribbonTag = 'Meal Inc';
  }

  // Deterministic "Fares are ₹X lower than usual" amount derived from cheapest flight & route distance
  const usualSavings = Math.round((380 + (flights[cheapestIdx].basePrice * 0.11)) / 10) * 10;

  return { flights, usualSavings };
}

export const POPULAR_ROUTES = [
  {
    city: 'Goa',
    code: 'GOI',
    price: '₹3,499',
    numericPrice: 3499,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4eY01OycoTTrVjJ87vL2aKrYDWDBfFEUGtQBz5ukV-QxHrVQMjB0ydsz-P5qTKkpE3ZfgEYWtj-SpYx5zD3_boXowDkaoPlNTPwyzMwc_w0F9x_uZ2ZXTcNcT3POxNivth5LuT7OlHBWuq5YCnW31h6Bku_onPxS9XWms0u9tcxMyzxI7qkxGTbO1mjRG4Oj5WJSk2tdpYfRGFbo-VqbnLsLi_bk2ZRxZRx3IhLw'
  },
  {
    city: 'Mumbai',
    code: 'BOM',
    price: '₹3,199',
    numericPrice: 3199,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpe-mPksIUN93ePuVmk6mdDTW5BQnuW2ZYlzWzLW3nPM6gOKGEvCGBRKYIOr2BiP50XT0B1bgyWML6UCMuzWvYIjZR3T9hg6I0zOrNSWZJ3XlyaZ9c2_O1LCgc9WvnCnMYil31QHpwS1HMJLvtvQKgd70xb_TyHKS0ih79OwUwjnKknlg60lZ0qlY3PujKNEHtlfD_szKRzjpr9gQTidWyKwjUvTeT8iiVHyImFeo'
  },
  {
    city: 'Delhi',
    code: 'DEL',
    price: '₹2,499',
    numericPrice: 2499,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1DnQl_rs-0krMchVcIFjX_WEDjpmr0RL0aqrBeY5WEHzCuUTDw_G5f-rVmmdbBi1Y1xkhvBXr3GcsxpWuGLzexCwCYYNZtfbpEuDQEdzgubG06UbrOWn74HMWU67e2YnSSNIITaDEmxwPSoGCtoHt38PSYfsTq2EHmFT9p6OoUaz9jUJL4o1Rw7uK9LLs6ZDeFRtRQobDNITM0Xr5h8ha24xBJaevPDCikgVWgjg'
  },
  {
    city: 'Jaipur',
    code: 'JAI',
    price: '₹2,899',
    numericPrice: 2899,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAdrU-Xc18dvqG8jt4IRHS0DV2fAIn0h1ayxmjVrPaD4jfygD_kOG2Kx3aWm5rmhSzjN7pwOuWodaP1_J-4f003Ygz3IhWopAI-wHu7P8Sd_shFKL_M68vvutDQqpbocGPZaNcU5AcoTNYNNpOcV3-gjFWOD6yUDRPZzXExyXHN8nuBOnI8xWLdiP2MWrvtIWrrI8g1u-5RaCaSJQrH7Kjsq8Z-093vx74Djs1g7g'
  },
  {
    city: 'Manali',
    code: 'KUU',
    price: '₹4,199',
    numericPrice: 4199,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGrpBWHMzIGB1A3Gj49VitB6iRcktfn7LLqH__U-Xd-M1VqN-78WiQwrCnH8L4fXfNqfyY4UzJ21eDaVKLlXhp8CznIEFuIZZCdJPVIeRk2AuvBqUWze2GLVvSpRvCQMZ3NwZT9Bou7hWJ_xnutdgB_dJfErYOgvD-OxGRYXpXZq_WqtAdCC0TAUyvhC6vJYEIRQhHgeFnAFkKuLzDLyJAO3rlUONHPvQGFEEngJo'
  },
  {
    city: 'Kochi',
    code: 'COK',
    price: '₹3,799',
    numericPrice: 3799,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWOIBa2gqSzm3H3x46hZFii9E6CF6nJuAzWHBOoxwbRLxr7BhBzdjJk8RlKfFGJs79cAYDRM-99rfqkxfui8h-JlbaSNJsSX4V63wgBPQhkC2D2YTDfw0zd3VhvTGYnWBd6NRPn3gpfOhCt2EF-603bI2TrMW-oL9DYO644mVYiB1hkLAt_svwv55LTZSF2ezhPVBNn6KQ_1LXSlVW-WHL1ZwDkxC1GXK_OpzKXLk'
  },
  {
    city: 'Udaipur',
    code: 'UDR',
    price: '₹3,299',
    numericPrice: 3299,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAdrU-Xc18dvqG8jt4IRHS0DV2fAIn0h1ayxmjVrPaD4jfygD_kOG2Kx3aWm5rmhSzjN7pwOuWodaP1_J-4f003Ygz3IhWopAI-wHu7P8Sd_shFKL_M68vvutDQqpbocGPZaNcU5AcoTNYNNpOcV3-gjFWOD6yUDRPZzXExyXHN8nuBOnI8xWLdiP2MWrvtIWrrI8g1u-5RaCaSJQrH7Kjsq8Z-093vx74Djs1g7g'
  },
  {
    city: 'Varanasi',
    code: 'VNS',
    price: '₹2,699',
    numericPrice: 2699,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1DnQl_rs-0krMchVcIFjX_WEDjpmr0RL0aqrBeY5WEHzCuUTDw_G5f-rVmmdbBi1Y1xkhvBXr3GcsxpWuGLzexCwCYYNZtfbpEuDQEdzgubG06UbrOWn74HMWU67e2YnSSNIITaDEmxwPSoGCtoHt38PSYfsTq2EHmFT9p6OoUaz9jUJL4o1Rw7uK9LLs6ZDeFRtRQobDNITM0Xr5h8ha24xBJaevPDCikgVWgjg'
  },
  {
    city: 'Shimla',
    code: 'SLV',
    price: '₹3,999',
    numericPrice: 3999,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGrpBWHMzIGB1A3Gj49VitB6iRcktfn7LLqH__U-Xd-M1VqN-78WiQwrCnH8L4fXfNqfyY4UzJ21eDaVKLlXhp8CznIEFuIZZCdJPVIeRk2AuvBqUWze2GLVvSpRvCQMZ3NwZT9Bou7hWJ_xnutdgB_dJfErYOgvD-OxGRYXpXZq_WqtAdCC0TAUyvhC6vJYEIRQhHgeFnAFkKuLzDLyJAO3rlUONHPvQGFEEngJo'
  }
];
