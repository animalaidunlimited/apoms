import { SafeUrl } from "@angular/platform-browser";

export interface OrganisationMarker {
    index: number;
    position: google.maps.LatLngLiteral;
    label: string;
    options: any;
}

export interface OrganisationDetail{
    organisationId: number;
    logoUrl: SafeUrl | undefined;
    name: string;
    address: OrganisationAddress[],
    driverViewDeskNumber: string,
    vehicleDefaults: OrganisationVehicleDefaults,
    rotaDefaults: OrganisationRotaDefaults
}

export interface OrganisationRotaDefaults {
    periodsToShow: number;
}

export interface OrganisationAddress{
    address: string;
    latLng: google.maps.LatLngLiteral;
    name: string;
    number: string;
}

export interface OrganisationVehicleDefaults {
    shiftStartTime: string;
    shiftEndTime: string;
    defaultShiftLength: number;
}