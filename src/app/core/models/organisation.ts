export interface OrganisationMarker {
    index: number;
    position: google.maps.LatLngLiteral;
    label: string;
    options: any;
}

export interface OrganisationDetail{
    logoUrl: string;
    name: string;
    address: OrganisationAddress[]
}

export interface OrganisationAddress{
    address: string;
    latLng: google.maps.LatLngLiteral;
    name: string;
    number: string;
}