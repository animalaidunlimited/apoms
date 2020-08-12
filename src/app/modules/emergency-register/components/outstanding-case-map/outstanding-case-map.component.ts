import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserOptionsService } from 'src/app/core/services/user-options.service';
import { OutstandingCaseResponse, OutstandingCase, } from 'src/app/core/models/outstanding-case';
import { Observable, BehaviorSubject } from 'rxjs';
import { OutstandingCaseService } from '../../services/outstanding-case.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'outstanding-case-map',
  templateUrl: './outstanding-case-map.component.html',
  styleUrls: ['./outstanding-case-map.component.scss']
})
export class OutstandingCaseMapComponent implements OnInit {

  center: google.maps.LatLngLiteral;
  zoom: number = 13;


  options : google.maps.MapOptions;

  outstandingCases$:BehaviorSubject<OutstandingCase[]>;

  constructor(
    private userOptions: UserOptionsService,
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


}
