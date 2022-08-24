import { SafeUrl } from "@angular/platform-browser";

export interface OrganisationMarker {
    index: number;
    position: google.maps.LatLngLiteral;
    label: string;
    options: any;
}

export interface OrganisationDetail{
    logoUrl: SafeUrl | undefined;
    name: string;
    address: OrganisationAddress[],
    driverViewDeskNumber: string
}

export interface OrganisationAddress{
    address: string;
    latLng: google.maps.LatLngLiteral;
    name: string;
    number: string;
}