import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OrganisationOptionService {

  // Default is 7AM
  vehicleAssignerStartHour = 7;
  vehicleAssignerEndHour = 23;

  constructor() { }


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
