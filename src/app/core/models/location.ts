import { User } from "./user";
import { VehicleDetails } from "./vehicle";

export interface LatLng {
    lat: number;
    lng: number;
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
    vehicleStaff: User[];
}

export interface VehicleLocationDetails {
    vehicleDetails: VehicleDetails;
    vehicleLocation: LocationHistory;
}

export interface PolylineOptions {
    strokeColor: string | undefined;
    path: LatLng[];
}

export interface LocationPathSegment {
    vehicleId: number;
    options: PolylineOptions[];
}

export interface LocationHistory {
    locationHistory: VehicleLocation[];
}
