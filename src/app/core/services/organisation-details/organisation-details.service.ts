import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { OrganisationDetail, OrganisationRotaDefaults, OrganisationVehicleDefaults } from '../../models/organisation';
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

    organisationDetail:  BehaviorSubject<OrganisationDetail>;

    constructor(
        private storage: StorageService,
        http: HttpClient) {
            super(http);

            this.organisationDetail =  new BehaviorSubject<OrganisationDetail>({
                organisationId: Number(this.storage.read('OrganisationId')),
                logoUrl: '',
                name: 'Animal Aid Unlimited',
                address: [],
                driverViewDeskNumber: '',
                vehicleDefaults: {
                    shiftStartTime: "07:00",
                    shiftEndTime: "23:00",
                    defaultShiftLength: 9
                },
                rotaDefaults: {
                    periodsToShow: 4
                }
            })
        }

    getOrganisationDetail(){

        const request = '?organisationId=' + this.getOrganisationId();

        this.getObservable(request).subscribe(response => {
            
            this.organisationDetail.next(response)
        
        });

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

    public getTimezoneOffsetMinutes() : number {
        return 330;
    }

    public set vehicleAssignerStartHour(incomingStartTime:string){

        let currentDetail = this.organisationDetail.value;

        currentDetail.vehicleDefaults.shiftStartTime = incomingStartTime

        this.organisationDetail.next(currentDetail);

    }


    public set vehicleAssignerEndHour(incomingEndTime:string){

        let currentDetail = this.organisationDetail.value;

        currentDetail.vehicleDefaults.shiftEndTime = incomingEndTime

        this.organisationDetail.next(currentDetail);

    }

    public set defaultShiftLength( incomingDefaultShiftLength : number ){

        let currentDetail = this.organisationDetail.value;

        currentDetail.vehicleDefaults.defaultShiftLength = incomingDefaultShiftLength

        this.organisationDetail.next(currentDetail);

    }

    public async saveOrganisationVehicleDefaults(organisationVehicleDefaults: OrganisationVehicleDefaults) : Promise<SuccessOnlyResponse> {
    
        let currentSettings = this.organisationDetail.value;

        currentSettings.vehicleDefaults = organisationVehicleDefaults;

        this.organisationDetail.next(currentSettings);

        return await this.updateOrganisationDetail(currentSettings);        
    
      }

      public async saveOrganisationRotaDefaults(organisationRotaDefaults: OrganisationRotaDefaults) : Promise<SuccessOnlyResponse> {
      
          let currentSettings = this.organisationDetail.value;
  
          currentSettings.rotaDefaults = organisationRotaDefaults;
  
          this.organisationDetail.next(currentSettings);
  
          return await this.updateOrganisationDetail(currentSettings);        
      
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

        currentDetails.logoUrl = logoURL;

        this.organisationDetail.next(currentDetails);

    }






}
