export interface VehicleStaff {
    colour?: any;
    surname?: any;
    initials: string;
    firstName: string;
}

export interface LatLng {
    lat: number;
    lng: number;
}

export interface VehicleDetails {
    latLng: LatLng;
    vehicleId: number;
}

export interface ActiveVehicleLocations {
    vehicleStaff: VehicleStaff[];
    vehicleDetails: VehicleDetails;
}

export interface LocationHistory {
    speed: number;
    latLng: LatLng;
    heading?: any;
    timestamp: string;
}

export interface VehicleLocationHistory {
    vehicleId: number;
    locationHistory: LocationHistory[];
}

export interface PolylineOptions {
    strokeColor: string | undefined;
    path: LatLng[];
}

export interface LocationPathSegment {
    vehicleId: number;
    options: PolylineOptions[];
}
