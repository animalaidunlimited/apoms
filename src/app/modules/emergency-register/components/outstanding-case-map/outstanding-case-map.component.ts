import { Component, OnInit, ViewChild, Output, EventEmitter, OnDestroy } from '@angular/core';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { OutstandingAssignment, ActionPatient, OutstandingCase, ActionGroup, } from 'src/app/core/models/outstanding-case';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { OutstandingCaseService } from '../../services/outstanding-case.service';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';
import { SearchResponse } from 'src/app/core/models/responses';
import { CaseService } from '../../services/case.service';
import { takeUntil } from 'rxjs/operators';
import { ActiveVehicleLocations, LocationPathSegment } from 'src/app/core/models/location';
import { LocationService } from 'src/app/core/services/location/location.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'outstanding-case-map',
  templateUrl: './outstanding-case-map.component.html',
  styleUrls: ['./outstanding-case-map.component.scss']
})
export class OutstandingCaseMapComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  @ViewChild('googlemap') googlemap: any;
  @Output() public openEmergencyCase = new EventEmitter<SearchResponse>();

  ambulanceLocations$!:Observable<ActiveVehicleLocations[]>;

  center: google.maps.LatLngLiteral = {} as google.maps.LatLngLiteral;

  iconAnchor:google.maps.Point = new google.maps.Point(0, 55);
  iconLabelOrigin:google.maps.Point = new google.maps.Point(37,-5);
  infoContent:BehaviorSubject<SearchResponse[]> = new BehaviorSubject<SearchResponse[]>([]);



  vehicleLocations = [{latLng: {lat: 24.62486, lng: 73.630552}, speed: 54},
    {latLng: {lat: 24.626108, lng: 73.635362}, speed: 9},
    {latLng: {lat: 24.628605, lng: 73.63849}, speed: 36},
    {latLng: {lat: 24.626811, lng: 73.642372}, speed: 49},
    {latLng: {lat: 24.62488, lng: 73.647662}, speed: 12},
    {latLng: {lat: 24.62408, lng: 73.64996}, speed: 45},
    {latLng: {lat: 24.623378, lng: 73.655585}, speed: 19},
    {latLng: {lat: 24.621973, lng: 73.661135}, speed: 35},
    {latLng: {lat: 24.620374, lng: 73.663884}, speed: 29},
    {latLng: {lat: 24.616433, lng: 73.666761}, speed: 52},
    {latLng: {lat: 24.613331, lng: 73.670003}, speed: 11},
    {latLng: {lat: 24.610776, lng: 73.673782}, speed: 41},
    {latLng: {lat: 24.609118, lng: 73.677583}, speed: 16},
    {latLng: {lat: 24.610308, lng: 73.682715}, speed: 53},
    {latLng: {lat: 24.609683, lng: 73.686966}, speed: 39},
    {latLng: {lat: 24.608786, lng: 73.689242}, speed: 25},
    {latLng: {lat: 24.604845, lng: 73.690316}, speed: 12},
    {latLng: {lat: 24.601704, lng: 73.691432}, speed: 27},
    {latLng: {lat: 24.598602, lng: 73.691733}, speed: 50},
    {latLng: {lat: 24.595675, lng: 73.692077}, speed: 38},
    {latLng: {lat: 24.592612, lng: 73.690359}, speed: 39},
    {latLng: {lat: 24.590895, lng: 73.690166}, speed: 35},
    {latLng: {lat: 24.586759, lng: 73.687804}, speed: 36},
    {latLng: {lat: 24.587676, lng: 73.683446}, speed: 20},
    {latLng: {lat: 24.58672, lng: 73.678765}, speed: 6},
    {latLng: {lat: 24.588963, lng: 73.678357}, speed: 6},
    {latLng: {lat: 24.586017, lng: 73.671841}, speed: 6},
    {latLng: {lat: 24.583383, lng: 73.66712}, speed: 33},
    {latLng: {lat: 24.583754, lng: 73.658187}, speed: 24},
    {latLng: {lat: 24.583734, lng: 73.651993}, speed: 43},
    {latLng: {lat: 24.584964, lng: 73.648261}, speed: 26},
    {latLng: {lat: 24.585022, lng: 73.641801}, speed: 8},
    {latLng: {lat: 24.584632, lng: 73.639568}, speed: 19},
    {latLng: {lat: 24.58791, lng: 73.634973}, speed: 53},
    {latLng: {lat: 24.591129, lng: 73.632402}, speed: 25},
    {latLng: {lat: 24.595032, lng: 73.629569}, speed: 54},
    {latLng: {lat: 24.601528, lng: 73.626995}, speed: 21},
    {latLng: {lat: 24.60703, lng: 73.624783}, speed: 8},
    {latLng: {lat: 24.609371, lng: 73.623025}, speed: 32},
    {latLng: {lat: 24.60824, lng: 73.623561}, speed: 23},
    {latLng: {lat: 24.609547, lng: 73.625666}, speed: 30},
    {latLng: {lat: 24.615497, lng: 73.626696}, speed: 16},
    {latLng: {lat: 24.619106, lng: 73.624933}, speed: 45},
    {latLng: {lat: 24.621661, lng: 73.629271}, speed: 14},
    {latLng: {lat: 24.626967, lng: 73.636742}, speed: 5},
    {latLng: {lat: 24.631746, lng: 73.639274}, speed: 16},
    {latLng: {lat: 24.632545, lng: 73.635254}, speed: 30}];

  locationList$: BehaviorSubject<LocationPathSegment[]>;
  //polyLineOptions: google.maps.PolylineOptions = {};

  options: google.maps.MapOptions = {};

  outstandingCases$: BehaviorSubject<OutstandingCase[]>;

  rescues: any = [];

  zoom = 13;

  constructor(
    private userOptions: UserOptionsService,
    private caseService: CaseService,
    private locationService: LocationService,
    private outstandingCases: OutstandingCaseService) {

      this.outstandingCases$ = this.outstandingCases.outstandingCases$;
      this.ambulanceLocations$ = this.locationService.ambulanceLocations$;
      this.locationList$ = this.locationService.locationList$;
   }

  ngOnInit(): void {

    this.center = this.userOptions.getCoordinates();

    // Turn off the poi labels as they get in the way. NB you need to set the center here for this to work currently.
    this.options = {
      streetViewControl: false,
      center: this.center,
      styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{visibility: 'off'}]
      }
    ]};

    //this.outstandingCases.outstandingCases$
    //.pipe(takeUntil(this.ngUnsubscribe))
    //.subscribe(cases => {

    //  if(cases.length > 0){
    //    this.ambulanceLocations$ = this.locationService.ambulanceLocations$;
    //  }

    //});




  }

  ngOnDestroy(){

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

  }


  openAmbulanceInfoWindow(marker: MapMarker, actions: ActionGroup[]){

    let searchQuery = ' ec.EmergencyCaseId IN (';

    let assignments:OutstandingAssignment[] = [];

    actions.forEach(action => {

      action.ambulanceAssignment.forEach(ambulanceAssignments => {
        assignments = assignments.concat(ambulanceAssignments);
      });
    });

    const emergencyNumbers = assignments.map(rescue => {

      return rescue.emergencyCaseId;

    }).join(',');

    searchQuery += emergencyNumbers + ') ';

    this.caseService.searchCases(searchQuery)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(result => {

      this.infoContent.next(result);
      this.infoWindow.open(marker);
    });

  }

  openInfoWindow(marker: MapMarker, rescue: OutstandingAssignment) {

    // Go off and get all the details for the current rescue so we can display all the animals for a rescue
    const searchQuery = 'ec.EmergencyNumber=' + rescue.emergencyNumber;

    this.caseService.searchCases(searchQuery)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(result => {

      this.infoContent.next(result);
      this.infoWindow.open(marker);

    });

  }

  hasLargeAninmal(patients:ActionPatient[]) : boolean{

    return patients.some(patient => patient.largeAnimal);

  }

  openCase(caseSearchResult:SearchResponse)
  {
    this.openEmergencyCase.emit(caseSearchResult);
  }


}
