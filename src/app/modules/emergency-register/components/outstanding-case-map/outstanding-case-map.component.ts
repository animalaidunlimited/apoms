import { Component, OnInit, ViewChild, Output, EventEmitter, OnDestroy } from '@angular/core';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { OutstandingCase, OutstandingRescue, RescuerGroup, } from 'src/app/core/models/outstanding-case';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { OutstandingCaseService } from '../../services/outstanding-case.service';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';
import { SearchResponse } from 'src/app/core/models/responses';
import { CaseService } from '../../services/case.service';
import { map } from 'rxjs/operators';

@Component({
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
  outstandingCases$:BehaviorSubject<OutstandingCase[]> = new BehaviorSubject<OutstandingCase[]>([]);

  ambulanceLocations$!:Observable<any>;

  iconAnchor:google.maps.Point = new google.maps.Point(0, 55);
  iconLabelOrigin:google.maps.Point = new google.maps.Point(37,-5);


  constructor(
    private userOptions: UserOptionsService,
    private caseService: CaseService,
    private outstandingCases: OutstandingCaseService) {
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

    this.outstandingCases$ = this.outstandingCases.outstandingCases$;
    // this.ambulanceLocations$ = this.outstandingCases.ambulanceLocations$;

    this.ambulanceLocations$ = this.outstandingCases$.pipe(map((cases) => {
        if(cases){

          return cases.filter(swimlane => swimlane.rescueStatus >= 3)
                      .map(groups => groups.rescuerGroups)

                        // In the below we need to aggregate the rescues into their own ambulance groups so that we can then find
                        // the last one based upon time. However if we make the changes directly to the result object of the
                        // reduce, it changes the underlying object, moving the rescues around to the wrong ambulance groups.
                        // So we need to create a new object based on the result (which is what the JSON.parse(JSON.stringify is doing)),
                        // to avoid changing the object that lives in the outstandingCases observable in the outstandingCases service.
                      .map(rescuerGroups => JSON.parse(JSON.stringify(rescuerGroups)))
                      .reduce((aggregatedLocations, current) => {


                if(aggregatedLocations.length === 0){
                  return current;
                }
                else{

                  current.forEach((currentRescueGroup:RescuerGroup) => {

                    const index = aggregatedLocations.findIndex((parentRescueGroup:any) => {

                      return parentRescueGroup.rescuer1 === currentRescueGroup.rescuer1 &&
                          parentRescueGroup.rescuer2 === currentRescueGroup.rescuer2;

                    });

                    index > -1 ?
                    aggregatedLocations[index].rescues = aggregatedLocations[index].rescues.concat(currentRescueGroup.rescues)
                      :
                      aggregatedLocations.push(currentRescueGroup);

                  });

                  return aggregatedLocations;


                }}, [])
              .map((rescueGroup:RescuerGroup) => {

                const maxRescue = rescueGroup.rescues.reduce((current, previous) => {

                const currentTime = new Date(current.ambulanceArrivalTime) > (new Date(current.rescueTime) || new Date(1901, 1, 1))
                  ? current.ambulanceArrivalTime : current.rescueTime;

                const previousTime = new Date(previous.ambulanceArrivalTime) > (new Date(previous.rescueTime) || new Date(1901, 1, 1))
                  ? previous.ambulanceArrivalTime : previous.rescueTime;

                return previousTime > currentTime ? previous : current;

              });

               return {
                rescuer1: rescueGroup.rescuer1,
                rescuer1Abbreviation: rescueGroup.rescuer1Abbreviation,
                rescuer2: rescueGroup.rescuer2,
                rescuer2Abbreviation: rescueGroup.rescuer2Abbreviation,
                latestLocation: maxRescue.latLngLiteral,
                rescues: rescueGroup.rescues
                };

             });

            }
        }
    ));

  }

  ngOnDestroy(){

    this.caseSubscription.unsubscribe();

  }

  openAmbulanceInfoWindow(marker: MapMarker, rescues: OutstandingRescue[]){

    let searchQuery = ' search.EmergencyCaseId IN (';

    const emergencyNumbers = rescues.map(rescue => {

      return rescue.emergencyCaseId;

    }).join(',');

    searchQuery += emergencyNumbers + ') ';

    this.caseSubscription = this.caseService.searchCases(searchQuery).subscribe(result => {

      this.infoContent.next(result);
      this.infoWindow.open(marker);
    });

  }

  openInfoWindow(marker: MapMarker, rescue: OutstandingRescue) {

    // Go off and get all the details for the current rescue so we can display all the animals for a rescue
    const searchQuery = 'search.EmergencyNumber=' + rescue.emergencyNumber;

    this.caseSubscription = this.caseService.searchCases(searchQuery).subscribe(result => {

      this.infoContent.next(result);
      this.infoWindow.open(marker);

    });

  }

  openCase(caseSearchResult:SearchResponse)
  {
    this.openEmergencyCase.emit(caseSearchResult);
  }


}
