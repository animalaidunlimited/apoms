import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LatLngLiteral } from '../../models/driver-view';
import { VehicleLocation, LocationPathSegment, PolylineOptions, VehicleLocationDetails, ActiveVehicleLocation } from '../../models/location';
import { APIService } from '../http/api.service';

@Injectable({
  providedIn: 'root'
})
export class LocationService extends APIService {

  ambulanceLocations$ = new BehaviorSubject<ActiveVehicleLocation[]>([]);
  currentLocation$ = new BehaviorSubject<LatLngLiteral>({lat: 0, lng: 0})

  endpoint = 'Location';

  locationLogInterval: ReturnType<typeof setTimeout> | undefined;

  locationList$!: BehaviorSubject<LocationPathSegment[]>
  logLocation = new BehaviorSubject<boolean>(false);

  // TODO - Allow this to be changed in settings.
  speedColours = [
    {maxSpeed: 7, colour: 'gray'},
    {maxSpeed: 30, colour: 'green'},
    {maxSpeed: 40, colour: 'yellow'},
    {maxSpeed: 999, colour: 'red'}
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
  }

  initialise(){

    this.locationList$ = new BehaviorSubject<LocationPathSegment[]>(this.emptyLocationList);


    // Uncomment the below in order to start sending location updates
    // this.getActiveVehicleLocations();

    this.logLocation.subscribe(logLocation => {

      if(logLocation) {
        this.locationLogInterval = (setInterval(() => {this.postLocation();}, 30000));
      }
      else if(this.locationLogInterval) {
        clearInterval(this.locationLogInterval);
      }

    });

  }

  receiveVehicleLocation(locationMessage: ActiveVehicleLocation){

    const currentLocations = this.ambulanceLocations$.value;

    const updated = currentLocations.map(vehicle => {

      if(vehicle.vehicleDetails.vehicleId === locationMessage.vehicleDetails.vehicleId){
        vehicle.vehicleLocation.latLng.lat = locationMessage.vehicleLocation.latLng.lat;
        vehicle.vehicleLocation.latLng.lng = locationMessage.vehicleLocation.latLng.lat;
        vehicle.vehicleStaff = locationMessage.vehicleStaff;
      }


      return vehicle;

    });

    this.ambulanceLocations$.next(updated);

  }

  beginLoggingVehicleLocation(){
    this.logLocation.next(true);
  }

  getCurrentLocation() {

    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(position => {

        const latLng:LatLngLiteral = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }

        this.currentLocation$.next(latLng);

      });

    } else {
      alert('Geolocation is not supported by this browser.');
    }

  }

  postLocation(){

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

        await this.postSubEndpoint('LogVehicleLocation', vehicleLocation);

      });
    } else {
      this.logLocation.next(false);
      alert('Geolocation is not supported by this browser.');
    }

  }

  // toggleLogLocation(){

  //    while(let i = 0; i < 20; i++){
  //      setTimeout(() => this.getLocation(i / 100),i * 5000);
  //    }

  // }

  getActiveVehicleLocations() : void {

    const request = '/ActiveVehicleLocations';

    this.getObservable(request).subscribe((response: ActiveVehicleLocation[]) => this.ambulanceLocations$.next(response));

  }

  getVehicleLocation(vehicleId: number) : Observable<VehicleLocationDetails>{

    const request = `/VehicleLocationHistory?vehicleId=${vehicleId}`;

    return this.getObservable(request).pipe(
        map((response: VehicleLocationDetails) => {
            return response;
        })
    );

  }

  toggleVehicleLocation(vehicleId: number, checked: boolean) : void{

    checked ?
      this.addVehicleLocation(vehicleId)
      :
      this.removeVehicleLocation(vehicleId);

  }

  addVehicleLocation(vehicleId : number) : void{

    this.getVehicleLocation(vehicleId).subscribe(locationHistory => {

      const currentHistory = this.locationList$.value;

      const lines = this.generatePolylines(vehicleId, locationHistory.locationHistory)

      currentHistory.push(lines);

      this.locationList$.next(currentHistory);

    });

  }

  removeVehicleLocation(vehicleId : number) : void {

    const currentHistory = this.locationList$.value;

    const newHistoryList = currentHistory.filter(list => list.vehicleId !== vehicleId);

    this.locationList$.next(newHistoryList);

  }

  generatePolylines(vehicleId: number, locations: VehicleLocation[]) : LocationPathSegment{

    const returnArray:LocationPathSegment = {
      vehicleId,
      options: []
    };

    for(let i = 0; i < locations.length - 1; i++){

      const curr:PolylineOptions = {
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
