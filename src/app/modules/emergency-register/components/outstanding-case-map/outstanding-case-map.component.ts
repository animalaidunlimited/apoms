import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { UserOptionsService } from 'src/app/core/services/user-options.service';
import { OutstandingCase, OutstandingRescue, } from 'src/app/core/models/outstanding-case';
import { BehaviorSubject, Subscription } from 'rxjs';
import { OutstandingCaseService } from '../../services/outstanding-case.service';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';
import { SearchResponse } from 'src/app/core/models/responses';
import { EmergencyTab } from 'src/app/core/models/emergency-record';
import { CaseService } from '../../services/case.service';

@Component({
  selector: 'outstanding-case-map',
  templateUrl: './outstanding-case-map.component.html',
  styleUrls: ['./outstanding-case-map.component.scss']
})
export class OutstandingCaseMapComponent implements OnInit {

  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;
  @Output() public onOpenEmergencyCase = new EventEmitter<any>();

  caseSubscription: Subscription;

  center: google.maps.LatLngLiteral;
  zoom: number = 13;

  infoContent:SearchResponse[];

  rescues:any = [];

  options : google.maps.MapOptions;
  outstandingCases$:BehaviorSubject<OutstandingCase[]>;


  constructor(
    private userOptions: UserOptionsService,
    private caseService: CaseService,
    private outstandingCases: OutstandingCaseService) {
   }

  ngOnInit(): void {



    this.center = this.userOptions.getCoordinates();

    //Turn off the poi labels as they get in the way. NB you need to set the center here for this to work currently.
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


  }

  ngOnDestroy(){

    this.caseSubscription.unsubscribe();

  }

  openInfoWindow(marker: MapMarker, rescue: OutstandingRescue) {

    //Go off and get all the details for the current rescue so we can display all the animals for a rescue
    let searchQuery = 'ec.EmergencyNumber=' + rescue.emergencyNumber;

    this.caseSubscription = this.caseService.searchCases(searchQuery).subscribe(result => {

      this.infoContent = result;

      this.infoWindow.open(marker);
    })

  }

  openCase(caseSearchResult:SearchResponse)
  {
    this.onOpenEmergencyCase.emit(caseSearchResult);
  }


}
