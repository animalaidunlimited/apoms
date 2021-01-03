import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, ViewChildren } from '@angular/core';
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
export class TeamVisitAssingerComponent implements OnInit {
  icon = {
    path: "M261-46C201-17 148 39 124 98 111 128 107 169 108 245 110 303 105 377 98 408L89 472 142 458C175 444 227 436 309 430 418 423 435 419 476 394 652 288 637 28 450-48 397-70 309-69 261-46ZZ",
    fillColor: '#FF0000',
    fillOpacity: 1,
    anchor: new google.maps.Point(0,0),
    strokeWeight: 0,
    scale: 0.07
  }
  options: google.maps.MapOptions = {
    maxZoom: 17,
    minZoom: 8,
  }
  zoom:number = 15;
  streetTreatCases: any[] =[];
  center!:google.maps.LatLngLiteral;
  latlngboundsArray:google.maps.LatLng[] = [];
  markers: Marker[] = [];
  highlightStreetTreatCase:number = -1;
  
  private mutationObserver!: MutationObserver;
  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  @ViewChild('googleMap',{read: ElementRef}) googleMap!: ElementRef;
  infoWindow = new google.maps.InfoWindow();

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
    //console.log(streetTreatCase);
  }

  markerClean(){
    this.highlightStreetTreatCase = -1;
  }
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
    private changeDetector: ChangeDetectorRef,
    private elementRef:ElementRef
  ) { 
    
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
    const latlngbounds = new google.maps.LatLngBounds();
    this.streetTreatService.getActiveCasesWithVisitByDate(new Date())
    .subscribe(
    (streetTreatCaseByVisitDateResponse:StreetTreatCaseByVisitDateResponse[]) => 
    {
      streetTreatCaseByVisitDateResponse.forEach(
        (streetTreatResponse) =>
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
         
      setTimeout(
      () => {
        this.changeDetector.detectChanges();
        console.log(this.googleMap.nativeElement.getBoundingClientRect().height);
      },0);
      console.log(this.googleMap.nativeElement.offsetWidth);  
      this.zoom = this.getBoundsZoomLevel(latlngbounds, {width:608,height:610}) as number;    
    });
  }
  getBoundsZoomLevel(bounds:google.maps.LatLngBounds, mapDim:{width:number,height:number}) {
    var WORLD_DIM = { height: 256, width: 256 };
    var ZOOM_MAX = 21;

    function latRad(lat:number) {
        var sin = Math.sin(lat * Math.PI / 180);
        var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
        return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    }

    const zoom = (mapPx:number, worldPx:number, fraction:number) => Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);

    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    var latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;

    var lngDiff = ne.lng() - sw.lng();
    var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

    var latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
    var lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

    return Math.min(latZoom, lngZoom, ZOOM_MAX);  
  }
}
