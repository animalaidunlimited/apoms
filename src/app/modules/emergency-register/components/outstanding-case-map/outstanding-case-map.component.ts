import { Component, OnInit, ViewChild, Output, EventEmitter, OnDestroy, NgZone } from '@angular/core';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { OutstandingAssignment, ActionPatient, OutstandingCase, ActionGroup, RescuerGroup, } from 'src/app/core/models/outstanding-case';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { OutstandingCaseService } from '../../services/outstanding-case.service';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';
import { SearchResponse } from 'src/app/core/models/responses';
import { CaseService } from '../../services/case.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'outstanding-case-map',
  templateUrl: './outstanding-case-map.component.html',
  styleUrls: ['./outstanding-case-map.component.scss']
})
export class OutstandingCaseMapComponent implements OnInit, OnDestroy {

  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  @Output() public openEmergencyCase = new EventEmitter<SearchResponse>();

  caseSubscription: Subscription = new Subscription();

  center: google.maps.LatLngLiteral = {} as google.maps.LatLngLiteral;
  zoom = 13;

  infoContent:BehaviorSubject<SearchResponse[]> = new BehaviorSubject<SearchResponse[]>([]);

  rescues:any = [];

  options : google.maps.MapOptions = {};

  ambulanceLocations$!:Observable<any>;
  outstandingCases$:BehaviorSubject<OutstandingCase[]>;

  iconAnchor:google.maps.Point = new google.maps.Point(0, 55);
  iconLabelOrigin:google.maps.Point = new google.maps.Point(37,-5);


  constructor(
    private userOptions: UserOptionsService,
    private caseService: CaseService,
    private outstandingCases: OutstandingCaseService) {
      this.outstandingCases$ = this.outstandingCases.outstandingCases$;
      this.ambulanceLocations$ = this.outstandingCases.ambulanceLocations$;
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

    this.outstandingCases.outstandingCases$.subscribe(cases => {
  
      if(cases.length > 0){
        this.ambulanceLocations$ = this.outstandingCases.getAmbulanceLocations();
      }

    });

  }

  ngOnDestroy(){

    this.caseSubscription.unsubscribe();

  }

  openAmbulanceInfoWindow(marker: MapMarker, rescues: RescuerGroup){

    let searchQuery = ' search.EmergencyCaseId IN (';

    let assignments:OutstandingAssignment[] = [];

    rescues.actions.forEach(action => {

      action.ambulanceAssignment.forEach(ambulanceAssignments => {
        assignments = assignments.concat(ambulanceAssignments);
      });
    });

    const emergencyNumbers = assignments.map(rescue => {

      return rescue.emergencyCaseId;

    }).join(',');

    searchQuery += emergencyNumbers + ') ';

    this.caseSubscription = this.caseService.searchCases(searchQuery).subscribe(result => {

      this.infoContent.next(result);
      this.infoWindow.open(marker);
    });

  }

  openInfoWindow(marker: MapMarker, rescue: OutstandingAssignment) {

    // Go off and get all the details for the current rescue so we can display all the animals for a rescue
    const searchQuery = 'search.EmergencyNumber=' + rescue.emergencyNumber;

    this.caseSubscription = this.caseService.searchCases(searchQuery).subscribe(result => {

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
