import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { StreetTreatService } from '../../services/streettreat.service';
import { StreetTreatCaseByVisitDateResponse } from 'src/app/core/models/streettreet';
import { GoogleMap } from '@angular/google-maps';

export interface Position {
  lat: number;
  lng: number;
}
export interface Marker {
  position: Position;
  label: string;
  options: any;
  streetTreatCaseId?: number;
}
@Component({
  selector: 'team-visit-assinger',
  templateUrl: './team-visit-assinger.component.html',
  styleUrls: ['./team-visit-assinger.component.scss']
})
export class TeamVisitAssingerComponent implements OnInit, AfterViewInit {
  icon = {
    path: 'M261-46C201-17 148 39 124 98 111 128 107 169 108 245 110 303 105 377 98 408L89 472 142 458C175 444 227 436 309 430 418 423 435 419 476 394 652 288 637 28 450-48 397-70 309-69 261-46ZZ',
    fillColor: '#FF0000',
    fillOpacity: 1,
    anchor: new google.maps.Point(0,0),
    strokeWeight: 0,
    scale: 0.07
  };

  options: google.maps.MapOptions = {
    maxZoom: 17,
    minZoom: 8,
  };

  zoom = 11.0;
  streetTreatCases: any[] =[];
  center!:google.maps.LatLngLiteral;
  latlngboundsArray:google.maps.LatLng[] = [];
  markers: Marker[] = [];
  highlightStreetTreatCase = -1;

  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  @ViewChild('googleMap',{read: ElementRef}) googleMap!: ElementRef;
  infoWindow = new google.maps.InfoWindow();

  /*Get Street Treat Visit List*/

  done = [
    'Get up',
    'Brush teeth',
    'Take a shower',
    'Check e-mail',
    'Walk dog'
  ];

  later = [
    'Get Things Done'
  ];

  constructor(
    private streetTreatService: StreetTreatService,
    private changeDetector: ChangeDetectorRef
    ) {}

  markerDragEnd(event: google.maps.MouseEvent) {
    const position = event.latLng.toJSON();
    this.center = { lat: position.lat, lng: position.lng };
  }


  markerClick(marker:Marker)
  {
    this.highlightStreetTreatCase = this.streetTreatCases
                                    .findIndex(
                                      (streetTreatCase:StreetTreatCaseByVisitDateResponse) =>
                                      streetTreatCase.CaseId === marker.streetTreatCaseId);
  }

  highLightMarker(streetTreatCase:any){
    // console.log(streetTreatCase);
  }

  markerClean(){
    this.highlightStreetTreatCase = -1;
  }

  drop(event: CdkDragDrop<string[]>){
    if(event.previousContainer === event.container){
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
    else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }
  ngOnInit(): void {

  }

  ngAfterViewInit():void {
    const latlngbounds = new google.maps.LatLngBounds(undefined);
    this.streetTreatService.getActiveCasesWithVisitByDate(new Date())
    .subscribe(
    (streetTreatCaseByVisitDateResponse:StreetTreatCaseByVisitDateResponse[]) =>
    {
      streetTreatCaseByVisitDateResponse.forEach((streetTreatResponse) =>
        {
          this.markers.push({
            position: { lat: streetTreatResponse.Latitude, lng: streetTreatResponse.Longitude },
            label: '',
            streetTreatCaseId:streetTreatResponse.CaseId,
            options: {
              draggable: true,
              icon:{
                ...this.icon,
                fillColor: '#58b09c'
              }
            },
          });
          latlngbounds.extend(new google.maps.LatLng(streetTreatResponse.Latitude, streetTreatResponse.Longitude));

          this.streetTreatCases.push(streetTreatResponse);

        }
      );

      this.map.fitBounds(latlngbounds);
      this.map.panToBounds(latlngbounds);

      this.map.zoomChanged.subscribe(() => {

        if(this.map.getZoom() > 14) {
          console.log('setZoom');

          this.map.zoom = 14;

        }

      });

    });
  }

}
