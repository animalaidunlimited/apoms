export interface VehicleStaff {
    initials: string;
    firstName: string;
    surname?: any;
    colour?: any;
}

export interface LatLng {
    lat: number;
    lng: number;
}

export interface VehicleDetails {
    vehicleId: number;
    vehicleTypeId: number;
    vehicleImage: string;
    vehicleNumber: string;
    largeAnimalCapacity: number;
    smallAnimalCapacity: number;
    vehicleRegistrationNumber: string;
}

export interface VehicleLocation {
    speed: number;
    latLng: LatLng;
    timestamp: string;
    heading?: number;
    accuracy?: number;
    altitude?: number;
    altitudeAccuracy?: number;
}

export interface ActiveVehicleLocation {
    vehicleDetails: VehicleDetails;
    vehicleLocation: VehicleLocation;
    vehicleStaff: VehicleStaff[];
}

export interface VehicleLocationDetails {
    vehicleDetails: VehicleDetails;
    locationHistory: VehicleLocation[];
}

export interface PolylineOptions {
    strokeColor: string | undefined;
    path: LatLng[];
}

export interface LocationPathSegment {
    vehicleId: number;
    options: PolylineOptions[];
}
