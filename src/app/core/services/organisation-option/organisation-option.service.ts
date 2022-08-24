import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { OrganisationDetail } from '../../models/organisation';
import { SuccessOnlyResponse } from '../../models/responses';
import { APIService } from '../http/api.service';
import { StorageService } from '../storage/storage.service';

@Injectable({
    providedIn: 'root',
})
export class OrganisationDetailsService extends APIService{

    endpoint = 'Organisation';

    defaultCoordinates: google.maps.LatLngLiteral = {
        lat: 24.57127,
        lng: 73.691544,
    };

    organisationDetail =  new BehaviorSubject<OrganisationDetail>({
        logoUrl: '',
        name: 'Animal Aid Unlimited',
        address: [],
        driverViewDeskNumber: ''
    });

    // Default is 7AM
    vehicleAssignerStartHour = 7;
    vehicleAssignerEndHour = 23;


    constructor(
        private storage: StorageService,
        http: HttpClient) {
            super(http);
        }

    getOrganisationDetail(){

        const request = '?organisationId=' + this.getOrganisationId();

        this.getObservable(request).subscribe(response => this.organisationDetail.next(response));

    }

    getDefaultCoordinates() : google.maps.LatLngLiteral{
        if (!this.defaultCoordinates) {
            this.defaultCoordinates = {
                lat: 24.57127,
                lng: 73.691544,
            };
        }

        return this.defaultCoordinates;
    }


    public getOrganisationSocketEndPoint() {
        return this.storage.read('SOCKET_END_POINT');
    }

    public getOrganisationId() {
        return this.storage.read('OrganisationId');
    }

    getVehicleAssignerStartHour() : number {

        if (!this.vehicleAssignerStartHour) {
            this.vehicleAssignerStartHour = 7;
        }
    
        return this.vehicleAssignerStartHour;
    }

    getVehicleAssignerEndHour() : number {

    if (!this.vehicleAssignerEndHour) {
        this.vehicleAssignerEndHour = 23;
    }

    return this.vehicleAssignerEndHour;
    }

    async updateOrganisationDetail(orgDetails:OrganisationDetail) : Promise<SuccessOnlyResponse>{

        return await this.post(orgDetails).then(data => {
            return data;
        })
        .catch(error => {
            console.log(error);
        });
    }

    updateOrganisationLogo(logoURL: SafeUrl | undefined) : void {

        if(!logoURL){
            return;
        }

        let currentDetails = this.organisationDetail.value;

        console.log(currentDetails);

        currentDetails.logoUrl = logoURL;

        this.organisationDetail.next(currentDetails);

    }






}
