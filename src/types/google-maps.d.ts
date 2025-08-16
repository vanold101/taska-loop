declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google.maps {
  export interface LatLng {
    lat(): number;
    lng(): number;
  }

  export interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  export enum TravelMode {
    DRIVING = 'DRIVING',
    WALKING = 'WALKING',
    BICYCLING = 'BICYCLING',
    TRANSIT = 'TRANSIT'
  }

  export enum DirectionsStatus {
    OK = 'OK',
    NOT_FOUND = 'NOT_FOUND',
    ZERO_RESULTS = 'ZERO_RESULTS',
    MAX_WAYPOINTS_EXCEEDED = 'MAX_WAYPOINTS_EXCEEDED',
    MAX_ROUTE_LENGTH_EXCEEDED = 'MAX_ROUTE_LENGTH_EXCEEDED',
    INVALID_REQUEST = 'INVALID_REQUEST',
    OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
    REQUEST_DENIED = 'REQUEST_DENIED',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
  }

  export interface DirectionsRequest {
    origin: LatLng | LatLngLiteral | string;
    destination: LatLng | LatLngLiteral | string;
    waypoints?: Array<{
      location: LatLng | LatLngLiteral | string;
      stopover?: boolean;
    }>;
    optimizeWaypoints?: boolean;
    travelMode?: TravelMode;
    unitSystem?: UnitSystem;
    avoidHighways?: boolean;
    avoidTolls?: boolean;
  }

  export interface DirectionsResult {
    routes: DirectionsRoute[];
    geocoded_waypoints: DirectionsGeocodedWaypoint[];
  }

  export interface DirectionsRoute {
    bounds: LatLngBounds;
    copyrights: string;
    fare: TransitFare;
    legs: DirectionsLeg[];
    overview_path: LatLng[];
    overview_polyline: string;
    warnings: string[];
    waypoint_order: number[];
  }

  export interface DirectionsLeg {
    arrival_time: Time;
    departure_time: Time;
    distance: Distance;
    duration: Duration;
    duration_in_traffic: Duration;
    end_address: string;
    end_location: LatLng;
    start_address: string;
    start_location: LatLng;
    steps: DirectionsStep[];
    traffic_speed_entry: any[];
    via_waypoints: LatLng[];
  }

  export interface DirectionsStep {
    distance: Distance;
    duration: Duration;
    end_location: LatLng;
    instructions: string;
    path: LatLng[];
    polyline: string;
    start_location: LatLng;
    transit: TransitDetails;
    travel_mode: TravelMode;
  }

  export interface Distance {
    text: string;
    value: number;
  }

  export interface Duration {
    text: string;
    value: number;
  }

  export interface Time {
    text: string;
    time_zone: string;
    value: Date;
  }

  export interface LatLngBounds {
    getCenter(): LatLng;
    getNorthEast(): LatLng;
    getSouthWest(): LatLng;
    isEmpty(): boolean;
    toSpan(): LatLng;
    toString(): string;
    toUrlValue(precision?: number): string;
    union(other: LatLngBounds | LatLngBoundsLiteral): LatLngBounds;
  }

  export interface LatLngBoundsLiteral {
    east: number;
    north: number;
    south: number;
    west: number;
  }

  export interface TransitFare {
    currency: string;
    value: number;
  }

  export interface TransitDetails {
    arrival_stop: TransitStop;
    arrival_time: Time;
    departure_stop: TransitStop;
    departure_time: Time;
    headsign: string;
    headway: number;
    line: TransitLine;
    num_stops: number;
  }

  export interface TransitStop {
    location: LatLng;
    name: string;
  }

  export interface TransitLine {
    agencies: TransitAgency[];
    color: string;
    icon: string;
    name: string;
    short_name: string;
    text_color: string;
    url: string;
    vehicle: TransitVehicle;
  }

  export interface TransitAgency {
    name: string;
    phone: string;
    url: string;
  }

  export interface TransitVehicle {
    icon: string;
    local_icon: string;
    name: string;
    type: VehicleType;
  }

  export enum VehicleType {
    BUS = 'BUS',
    CABLE_CAR = 'CABLE_CAR',
    COMMUTER_TRAIN = 'COMMUTER_TRAIN',
    FERRY = 'FERRY',
    FUNICULAR = 'FUNICULAR',
    GONDOLA_LIFT = 'GONDOLA_LIFT',
    HEAVY_RAIL = 'HEAVY_RAIL',
    HIGH_SPEED_TRAIN = 'HIGH_SPEED_TRAIN',
    METRO_RAIL = 'METRO_RAIL',
    MONORAIL = 'MONORAIL',
    OTHER = 'OTHER',
    RAIL = 'RAIL',
    SHARE_TAXI = 'SHARE_TAXI',
    SUBWAY = 'SUBWAY',
    TRAM = 'TRAM',
    TROLLEYBUS = 'TROLLEYBUS'
  }

  export enum UnitSystem {
    IMPERIAL = 0,
    METRIC = 1
  }

  export interface DirectionsGeocodedWaypoint {
    geocoder_status: GeocoderStatus;
    partial_match: boolean;
    place_id: string;
    types: string[];
  }

  export enum GeocoderStatus {
    OK = 'OK',
    ZERO_RESULTS = 'ZERO_RESULTS',
    OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
    REQUEST_DENIED = 'REQUEST_DENIED',
    INVALID_REQUEST = 'INVALID_REQUEST',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
  }

  export class DirectionsService {
    constructor();
    route(request: DirectionsRequest, callback: (result: DirectionsResult | null, status: DirectionsStatus) => void): void;
  }

  export class Geocoder {
    constructor();
    geocode(request: GeocoderRequest, callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void): void;
  }

  export interface GeocoderRequest {
    address?: string;
    bounds?: LatLngBounds | LatLngBoundsLiteral;
    componentRestrictions?: GeocoderComponentRestrictions;
    location?: LatLng | LatLngLiteral;
    placeId?: string;
    region?: string;
  }

  export interface GeocoderComponentRestrictions {
    administrativeArea?: string;
    country?: string;
    locality?: string;
    postalCode?: string;
    route?: string;
  }

  export interface GeocoderResult {
    address_components: GeocoderAddressComponent[];
    formatted_address: string;
    geometry: GeocoderGeometry;
    partial_match: boolean;
    place_id: string;
    postcode_localities: string[];
    types: string[];
  }

  export interface GeocoderAddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
  }

  export interface GeocoderGeometry {
    bounds?: LatLngBounds;
    location: LatLng;
    location_type: GeocoderLocationType;
    viewport?: LatLngBounds;
  }

  export enum GeocoderLocationType {
    APPROXIMATE = 'APPROXIMATE',
    GEOMETRIC_CENTER = 'GEOMETRIC_CENTER',
    RANGE_INTERPOLATED = 'RANGE_INTERPOLATED',
    ROOFTOP = 'ROOFTOP'
  }

  // Places API
  export namespace places {
    export enum PlacesServiceStatus {
      OK = 'OK',
      ZERO_RESULTS = 'ZERO_RESULTS',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      INVALID_REQUEST = 'INVALID_REQUEST',
      NOT_FOUND = 'NOT_FOUND',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR'
    }

    export interface AutocompletionRequest {
      input: string;
      bounds?: LatLngBounds | LatLngBoundsLiteral;
      componentRestrictions?: ComponentRestrictions;
      location?: LatLng | LatLngLiteral;
      offset?: number;
      origin?: LatLng | LatLngLiteral;
      radius?: number;
      sessionToken?: AutocompleteSessionToken;
      types?: string[];
    }

    export interface ComponentRestrictions {
      country: string | string[];
    }

    export interface AutocompletePrediction {
      description: string;
      matched_substrings: PredictionSubstring[];
      place_id: string;
      reference: string;
      structured_formatting: StructuredFormatting;
      terms: PredictionTerm[];
      types: string[];
    }

    export interface PredictionSubstring {
      length: number;
      offset: number;
    }

    export interface PredictionTerm {
      offset: number;
      value: string;
    }

    export interface StructuredFormatting {
      main_text: string;
      main_text_matched_substrings: PredictionSubstring[];
      secondary_text: string;
    }

    export class AutocompleteSessionToken {
      constructor();
    }

    export class AutocompleteService {
      constructor();
      getPlacePredictions(request: AutocompletionRequest, callback: (predictions: AutocompletePrediction[] | null, status: PlacesServiceStatus) => void): void;
    }

    export interface PlaceDetailsRequest {
      placeId: string;
      fields?: string[];
      language?: string;
      region?: string;
      sessionToken?: AutocompleteSessionToken;
    }

    export interface PlaceResult {
      address_components?: GeocoderAddressComponent[];
      adr_address?: string;
      aspects?: PlaceAspectRating[];
      business_status?: BusinessStatus;
      formatted_address?: string;
      formatted_phone_number?: string;
      geometry?: PlaceGeometry;
      html_attributions?: string[];
      icon?: string;
      icon_background_color?: string;
      icon_mask_base_uri?: string;
      international_phone_number?: string;
      name?: string;
      opening_hours?: PlaceOpeningHours;
      photos?: PlacePhoto[];
      place_id?: string;
      plus_code?: PlacePlusCode;
      price_level?: PriceLevel;
      rating?: number;
      reviews?: PlaceReview[];
      types?: string[];
      url?: string;
      user_ratings_total?: number;
      utc_offset_minutes?: number;
      vicinity?: string;
      website?: string;
    }

    export interface PlaceAspectRating {
      rating: number;
      type: string;
    }

    export enum BusinessStatus {
      CLOSED_PERMANENTLY = 'CLOSED_PERMANENTLY',
      CLOSED_TEMPORARILY = 'CLOSED_TEMPORARILY',
      OPERATIONAL = 'OPERATIONAL'
    }

    export interface PlaceGeometry {
      location?: LatLng;
      viewport?: LatLngBounds;
    }

    export interface PlaceOpeningHours {
      open_now?: boolean;
      periods?: PlaceOpeningHoursPeriod[];
      weekday_text?: string[];
    }

    export interface PlaceOpeningHoursPeriod {
      close?: PlaceOpeningHoursTime;
      open: PlaceOpeningHoursTime;
    }

    export interface PlaceOpeningHoursTime {
      day: number;
      time: string;
    }

    export interface PlacePhoto {
      height: number;
      html_attributions: string[];
      width: number;
    }

    export interface PlacePlusCode {
      compound_code?: string;
      global_code: string;
    }

    export enum PriceLevel {
      FREE = 0,
      INEXPENSIVE = 1,
      MODERATE = 2,
      EXPENSIVE = 3,
      VERY_EXPENSIVE = 4
    }

    export interface PlaceReview {
      aspects?: PlaceAspectRating[];
      author_name: string;
      author_url?: string;
      language: string;
      profile_photo_url?: string;
      rating: number;
      relative_time_description: string;
      text: string;
      time: number;
    }

    export class PlacesService {
      constructor(attrContainer: HTMLDivElement | google.maps.Map);
      getDetails(request: PlaceDetailsRequest, callback: (place: PlaceResult | null, status: PlacesServiceStatus) => void): void;
    }
  }
}

export {};
