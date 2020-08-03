import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserOptionsService } from 'src/app/core/services/user-options.service';
import { MessagingService } from '../../services/messaging.service';
import { RescueDetailsService } from '../../services/rescue-details.service';
import { map } from 'rxjs/operators';
import { OutstandingCase, OutstandingCaseResponse, RescuerGroup } from 'src/app/core/models/outstanding-case';
import { Observable } from 'rxjs';

@Component({
  selector: 'outstanding-case-map',
  templateUrl: './outstanding-case-map.component.html',
  styleUrls: ['./outstanding-case-map.component.scss']
})
export class OutstandingCaseMapComponent implements OnInit {

  center: google.maps.LatLngLiteral;
  zoom: number = 13;


  options : google.maps.MapOptions;

  rescues: Observable<OutstandingCaseResponse>;

  constructor(private userOptions: UserOptionsService,
    private outstandingCases: MessagingService,
    private rescueService: RescueDetailsService) {
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

    this.rescues = this.rescueService.getOutstandingRescues();

  }


}
