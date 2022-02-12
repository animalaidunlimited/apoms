import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { map } from 'rxjs/operators';
import { OrganisationDetail } from '../../models/organisation';
import { SuccessOnlyResponse } from '../../models/responses';
import { APIService } from '../http/api.service';
import { StorageService } from '../storage/storage.service';

@Injectable({
    providedIn: 'root',
})
export class OrganisationOptionsService extends APIService{

    endpoint = 'Organisation';

    defaultCoordinates: google.maps.LatLngLiteral = {
        lat: 24.57127,
        lng: 73.691544,
    };

    organisationDetail =  new BehaviorSubject<any>([]);

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

    async updateOrganisationDetail(orgDetails:OrganisationDetail) : Promise<SuccessOnlyResponse>{

        return await this.post(orgDetails).then(data => {
            return data;
        })
        .catch(error => {
            console.log(error);
        });
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

}
