import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActiveVehicleLocations, LocationHistory, LocationPathSegment, PolylineOptions, VehicleLocationHistory } from '../../models/location';
import { APIService } from '../http/api.service';

@Injectable({
  providedIn: 'root'
})
export class LocationService extends APIService {

  ambulanceLocations$ = new BehaviorSubject<ActiveVehicleLocations[]>([]);

  endpoint = 'Location';

  locationList$: BehaviorSubject<LocationPathSegment[]>

  speedColours = [
    {maxSpeed: 7, colour: "gray"},
    {maxSpeed: 30, colour: "green"},
    {maxSpeed: 40, colour: "yellow"},
    {maxSpeed: 999, colour: "red"}
  ];

  emptyOptions: PolylineOptions[] = [{
    strokeColor: "",
    path: [],
  }];

  emptyLocationList:LocationPathSegment[] = [{
    vehicleId: 0,
    options: this.emptyOptions}];


  constructor(http: HttpClient) {
    super(http);
    this.locationList$ = new BehaviorSubject<LocationPathSegment[]>(this.emptyLocationList);

    //this.locationList$.subscribe(vals => console.log(vals));
    this.getActiveVehicleLocations();

    this.ambulanceLocations$.subscribe(vals => console.log(vals));
  }

  receiveVehicleLocation(locationMessage: any){

    let currentLocations = this.ambulanceLocations$.value;

    const updated = currentLocations.map(vehicle => {


      if(vehicle.vehicleDetails.vehicleId === locationMessage.vehicleLocation[1]){

        vehicle.vehicleDetails.latLng.lat = locationMessage.vehicleLocation[3];
        vehicle.vehicleDetails.latLng.lng = locationMessage.vehicleLocation[4]
      }

        return vehicle;

      });

      this.ambulanceLocations$.next(updated);

  }

  getLocation(increment:number){

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {

        //TODO - get rid of this and rely on the navigator values;
        const startLat = 24.632922 - increment;
        const startLong = 73.634537 + increment;
        const startSpeed = Math.floor(Math.random() * (70 - 1 + 1) + 1);

        console.log(`lat: ${startLat}, long: ${startLong}`)

        const vehicleLocation = {
          vehicleId: 1,
          timestamp: new Date(),
          latitude: startLat,
          longitude: startLong,
          speed: startSpeed,
          heading: position.coords.heading,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          altitude: position.coords.altitude,
          accuracy: position.coords.accuracy,
        };

        //console.log(vehicleLocation);

        await this.postSubEndpoint('LogVehicleLocation', vehicleLocation);

      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }

  }

  logLocation(){

      for(let i = 0; i < 4; i++){
        setTimeout(() => this.getLocation(i / 10),i * 5000);
      }

  }

  getActiveVehicleLocations() : void {

    console.log("called");

    const request = '/ActiveVehicleLocations';

    this.getObservable(request).subscribe((response: ActiveVehicleLocations[]) =>
        this.ambulanceLocations$.next(response)
    );

  }

  getVehicleLocationHistory(vehicleId: number) : Observable<VehicleLocationHistory>{

    const request = `/VehicleLocationHistory?vehicleId=${vehicleId}`;

    return this.getObservable(request).pipe(
        map((response: VehicleLocationHistory) => {
            return response;
        })
    );

  }

  toggleVehicleLocation(vehicleId: number, checked: boolean) : void{

    checked ?
      this.addVehicleLocationHistory(vehicleId)
      :
      this.removeVehicleLocationHistory(vehicleId);

  }

  addVehicleLocationHistory(vehicleId : number) : void{

    this.getVehicleLocationHistory(vehicleId).subscribe(locationHistory => {

      let currentHistory = this.locationList$.value;

      const lines = this.generatePolylines(vehicleId, locationHistory.locationHistory)

      currentHistory.push(lines);
      this.locationList$.next(currentHistory);

      })

  }

  removeVehicleLocationHistory(vehicleId : number) : void {

    const currentHistory = this.locationList$.value;

    const newHistoryList = currentHistory.filter(list => list.vehicleId !== vehicleId)

    this.locationList$.next(newHistoryList);

  }

  generatePolylines(vehicleId: number, locations: LocationHistory[]) : LocationPathSegment{

    let returnArray:LocationPathSegment = {
      vehicleId,
      options: []
    };

    for(let i = 0; i < locations.length - 1; i++){

      let curr:PolylineOptions = {
        strokeColor: this.getColourForSpeed(locations[i].speed),
        path: [locations[i].latLng, locations[i + 1].latLng]
      }

      returnArray.options.push(curr);

    }

    return returnArray;

  }

  getColourForSpeed(speed: number) : string | undefined{

    const currentSpeedBand = this.speedColours.find(band => speed < band.maxSpeed);

    return currentSpeedBand?.colour;

  }

}
