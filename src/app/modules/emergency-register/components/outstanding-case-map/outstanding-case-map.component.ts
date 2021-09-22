import { Component, OnInit, ViewChild, OnDestroy, Inject, AfterViewInit, ChangeDetectorRef, Optional } from '@angular/core';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { ActionGroup, OutstandingAssignment } from 'src/app/core/models/outstanding-case';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { SearchResponse } from 'src/app/core/models/responses';
import { CaseService } from '../../services/case.service';
import { map, takeUntil } from 'rxjs/operators';
import { LocationPathSegment } from 'src/app/core/models/location';
import { LocationService } from 'src/app/core/services/location/location.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OutstandingCaseService } from '../../services/outstanding-case.service';
import { DriverAssignment } from 'src/app/core/models/driver-view';
import { Patient } from 'src/app/core/models/patients';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'outstanding-case-map',
  templateUrl: './outstanding-case-map.component.html',
  styleUrls: ['./outstanding-case-map.component.scss']
})
export class OutstandingCaseMapComponent implements OnInit, OnDestroy, AfterViewInit {

  private ngUnsubscribe = new Subject();

  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  @ViewChild(GoogleMap, { static: false }) googlemap!: GoogleMap;
  //@Output() public openEmergencyCase = new EventEmitter<SearchResponse>();

  ambulanceLocations$!:Observable<any[]>;

  center: google.maps.LatLngLiteral = {} as google.maps.LatLngLiteral;

  iconAnchor:google.maps.Point = new google.maps.Point(0, 55);
  iconLabelOrigin:google.maps.Point = new google.maps.Point(37,-5);
  infoContent:BehaviorSubject<SearchResponse[]> = new BehaviorSubject<SearchResponse[]>([]);

  locationList$: BehaviorSubject<LocationPathSegment[]>;

  options: google.maps.MapOptions = {};

  outstandingCases$!: BehaviorSubject<(OutstandingAssignment | DriverAssignment)[]>;

  rescues: any = [];

  zoom = 13;

  constructor(
    private userOptions: UserOptionsService,
    private caseService: CaseService,
    private locationService: LocationService,
    private outstandingCases: OutstandingCaseService,
    public cdr: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) public vehicleId: number) {

      this.outstandingCases$ =  this.outstandingCases.outstandingCases$;
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

    if(this.vehicleId)
    {

      this.ambulanceLocations$ = this.ambulanceLocations$.pipe(
        map(ambulanceLocations => ambulanceLocations.filter(ambulanceLocation => ambulanceLocation.vehicleDetails.vehicleId === this.vehicleId))
      );

    }


  }

  ngOnDestroy(){

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

  }

  ngAfterViewInit(){
    this.ambulanceLocations$.subscribe(ambulanceLocation => {
      if(this.vehicleId)
      {
        this.fitMaps( new google.maps.LatLngBounds(new google.maps.LatLng(ambulanceLocation[0].vehicleLocation.latLng.lat, ambulanceLocation[0].vehicleLocation.latLng.lng)));
        this.googlemap.zoomChanged.subscribe(() => {
          this.zoom = 15;
          this.cdr.detectChanges();
        });
      }
    });


  }



  fitMaps(latlngbounds: google.maps.LatLngBounds){

    this.googlemap.fitBounds(latlngbounds);
    this.googlemap.panToBounds(latlngbounds);


  }

  openAmbulanceInfoWindow(marker: MapMarker, actions?: ActionGroup[]){

    let searchQuery = ' ec.EmergencyCaseId IN (';

    if(!this.vehicleId){
      let assignments:OutstandingAssignment[] = [];

      actions?.forEach(action => {

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
    }else{
      this.infoWindow.open(marker);
    }


  }

  openInfoWindow(marker: MapMarker, rescue: OutstandingAssignment | DriverAssignment) {

    // Go off and get all the details for the current rescue so we can display all the animals for a rescue
    const searchQuery = 'ec.EmergencyNumber=' + rescue.emergencyNumber;
    this.caseService.searchCases(searchQuery)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(result => {
      this.infoContent.next(result);
      this.infoWindow.open(marker);

    });

  }

  hasLargeAnimal(patients:Patient[]) : boolean {

    return patients?.some(patient => patient?.largeAnimal === 1);

  }

  openCase(caseSearchResult:SearchResponse)
  {
    //this.openEmergencyCase.emit(caseSearchResult);
    this.caseService.openCase({tab: caseSearchResult, source: "emergencyRegister"});
  }


}
