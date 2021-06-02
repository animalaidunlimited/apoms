import { Injectable } from '@angular/core';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LocationTrackingService {

  constructor() { }

  getLocation(){

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {

        let currentTime = new Date();

        console.log(`${currentTime} - ${position}`);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }

  }
  logLocation(){

    for(let i = 0; i < 200; i++){
      setTimeout(() => this.getLocation(),i * 2000);
  }

  }


}
