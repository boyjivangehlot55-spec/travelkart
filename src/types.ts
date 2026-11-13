// Common data types for TravelKart flight booking application

export interface City {
  name: string;
  code: string;
  airport: string;
  lat?: number;
  lng?: number;
}

export interface Flight {
  id: string;
  airline: 'IndiGo' | 'Air India' | 'Air India Express' | 'Akasa Air' | 'SpiceJet';
  airlineCode: '6E' | 'AI' | 'IX' | 'QP' | 'SG';
  flightNumber: string;
  aircraft: string;
  departureTime: string; // HH:mm format, e.g. "06:15"
  arrivalTime: string;   // HH:mm format, e.g. "09:00"
  duration: string;      // e.g. "2h 45m"
  durationMinutes: number;
  departureSlot: 'early' | 'morning' | 'afternoon' | 'night'; // <6am, 6am-12pm, 12pm-6pm, >6pm
  originTerminal: string;
  destTerminal: string;
  basePrice: number;     // e.g. 5299
  originalPrice?: number;
  stops: 0 | 1 | 2;
  stopsLabel: 'Non Stop' | '1 Stop' | '2+ Stops';
  viaCity?: string;      // e.g. "Hyderabad (HYD)" for 1-stop flights
  refundable: boolean;
  mealIncluded: boolean;
  baggage: {
    cabin: string;
    checkIn: string;
  };
  amenities: string[];
  ribbonTag?: string; // e.g. "CHEAPEST • Best Value Option", "Fastest", "Meal Inc"
}

export interface SearchParams {
  tripType: 'oneway' | 'roundtrip';
  fromCity: City;
  toCity: City;
  departureDate: string; // YYYY-MM-DD
  departureDisplayDate: string;
  departureDay: string;
  returnDate?: string;
  returnDisplayDate?: string;
  returnDay?: string;
  adults: number;
  children: number;
  cabinClass: 'Economy' | 'Premium Economy' | 'Business';
  specialFare: 'Regular' | 'Student' | 'Armed Forces' | 'Senior Citizen' | 'Doctor and Nurses';
}

export interface PassengerDetails {
  id: string;
  type: 'Adult' | 'Child';
  label: string; // e.g. "Adult 1", "Child 1"
  gender: 'Male' | 'Female' | 'Transgender';
  firstName: string;
  lastName: string;
  age?: string; // 2 to 11 years for Child
  email?: string; // Primary Contact only
  mobile?: string; // Primary Contact only
  saveTraveller?: boolean; // Primary Contact only
}

export interface AddOnsSelection {
  seatSelection: boolean;
  meal: boolean;
  insurance: boolean;
}

export interface BookingRecord {
  bookingId: string;
  bookingDate: string;
  flight: Flight;
  searchParams: SearchParams;
  passengers: PassengerDetails[];
  addOns: AddOnsSelection;
  paymentMethod: 'upi' | 'card' | 'netbanking';
  pricing: {
    baseFare: number;
    taxes: number;
    udf: number;
    addOnsTotal: number;
    convenienceFee: number;
    discount: number;
    totalAmount: number;
    couponApplied: string | null;
  };
}

export interface CitySummary {
  name: string;
  code: string;
  airport: string;
}

export interface TripRecord {
  userId: string;
  bookingId: string;
  bookingDate: string;
  travelDate: string;
  departureDateIso: string;
  departureDisplayDate: string;
  departureDay: string;
  fromCity: CitySummary;
  toCity: CitySummary;
  cabinClass: SearchParams['cabinClass'];
  flight: Flight;
  passengers: PassengerDetails[];
  addOns: AddOnsSelection;
  paymentMethod: 'upi' | 'card' | 'netbanking';
  pricing: BookingRecord['pricing'];
  totalAmount: number;
  createdAtMillis: number;
}

export interface WishlistItem {
  userId: string;
  itemId: string;
  flight: Flight;
  fromCity: CitySummary;
  toCity: CitySummary;
  travelDate: string;
  departureDateIso: string;
  departureDisplayDate: string;
  departureDay: string;
  cabinClass: SearchParams['cabinClass'];
  createdAtMillis: number;
}
