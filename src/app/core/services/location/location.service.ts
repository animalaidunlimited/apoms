import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APIService } from '../http/api.service';

@Injectable({
  providedIn: 'root'
})
export class LocationService extends APIService {

  endpoint = 'Location';

  constructor(http: HttpClient) {
    super(http);
  }

  getLocation(){

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {


        const vehicleLocation = {
          vehicleId: 1,
          timestamp: new Date(),
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed,
          heading: position.coords.heading,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          altitude: position.coords.altitude,
          accuracy: position.coords.accuracy,
        };

        console.log(vehicleLocation);

        await this.postSubEndpoint('LogVehicleLocation', vehicleLocation);

      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }

  }
  logLocation(){

    for(let i = 0; i < 10; i++){
      setTimeout(() => this.getLocation(),i * 2000);
  }

  }



}
