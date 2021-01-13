import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CdkDragDrop, CdkDragEnter, CdkDragExit, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { StreetTreatService } from '../../services/streettreat.service';
import { ActiveCasesForTeamByDateResponse } from 'src/app/core/models/streettreet';
import { GoogleMap } from '@angular/google-maps';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

export interface Position {
  lat: number;
  lng: number;
}
export interface mapMarker {
  marker?:google.maps.Marker;
  options: google.maps.MarkerOptions;
  streetTreatCaseId?: number;
  teamId:number;
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
  zoom = 11.0;
  streetTreatCasesResponse: any[] =[];
  teamsDropDown:any[]=[];
  center!:google.maps.LatLngLiteral;
  latlngboundsArray:google.maps.LatLng[] = [];
  markers: mapMarker[] = [];
  highlightStreetTreatCase = -1;
  highlightMarkerStreetTreatCase = -1;
  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;

  infoWindow = new google.maps.InfoWindow();
  
  streetTreatServiceSubs:Subscription = new Subscription();

  teamsgroup!:FormGroup;

 
  constructor(
    private streetTreatService: StreetTreatService,
    private changeDetector: ChangeDetectorRef,
    private fb: FormBuilder
    ) {}

  markerDragEnd(event: google.maps.MouseEvent) {
    const position = event.latLng.toJSON();
    this.center = { lat: position.lat, lng: position.lng };
  }
  
  markerClick(marker:mapMarker)
  {
    this.highlightStreetTreatCase = marker.streetTreatCaseId as number;
  }

  highLightMarker(streetTreatCase:any){

    if(streetTreatCase.CaseId){
      this.markers.forEach((marker)=>{
        if(marker.streetTreatCaseId == streetTreatCase.CaseId)
        {
          marker.marker?.setAnimation(1);
          // this.highlightMarkerStreetTreatCase  = marker.streetTreatCaseId as number;
        }
      });
      // console.log(this.markers.findIndex((marker) => marker.streetTreatCaseId = streetTreatCase));
    } 
  }

  markerClean(){
    this.highlightStreetTreatCase = -1;
  /*   this.highlightMarkerStreetTreatCase = -1; */
  }
  entered(event: CdkDragEnter<string[]>) {
    console.log('Entered', event.item.data);
  }
   
  exited(event: CdkDragExit<string[]>) {
     console.log('Exited', event.item.data);
  }
  
  drop(event: CdkDragDrop<string[]>){
    if(event.previousContainer === event.container){
      try{
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        this.changeDetector.detectChanges();
      }
      catch(error){
        console.log(error);
      }
    }
    else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
        console.log("Previous Container",event.previousContainer);
        console.log("Current Container",event.container);
        console.log(event.container.data[event.currentIndex]);
    }
    console.log('Dropped', event.item.data);
  }

  ngOnInit(): void {

    this.teamsgroup = this.fb.group({
      teams:[''],
      date:[]
    });
    
    this.teamsgroup.get('teams')?.valueChanges.subscribe((teamIds)=>{
        this.streetTreatServiceSubs = this.streetTreatService
        .getActiveStreetTreatCasesWithVisitByDate(new Date())
        .subscribe(streetTreatCaseByVisitDateResponse => {
          if(teamIds.length > 0){
            this.streetTreatCasesResponse = streetTreatCaseByVisitDateResponse.filter((streetTreatCase)=> teamIds.indexOf(streetTreatCase.TeamId) > -1);
          }    
          else {
            this.streetTreatCasesResponse = streetTreatCaseByVisitDateResponse
          } 
          this.initMarkers(this.streetTreatCasesResponse);     
          this.streetTreatServiceSubs.unsubscribe();
        });
    });
    this.teamsgroup.get('date')?.valueChanges.subscribe((date)=>{
      this.streetTreatServiceSubs = 
        this.streetTreatService
        .getActiveStreetTreatCasesWithVisitByDate(date)
        .subscribe(streetTreatCaseByVisitDateResponse => {
          if(streetTreatCaseByVisitDateResponse)
          {
            this.streetTreatCasesResponse = streetTreatCaseByVisitDateResponse;
            this.initMarkers(this.streetTreatCasesResponse);
          }
          this.streetTreatServiceSubs.unsubscribe();
        });
    })
  }

  ngAfterViewInit():void {
    const latlngbounds = new google.maps.LatLngBounds(undefined);
    /* this.initStreetTreatCases(new Date()); 
    console.log(this.streetTreatCases);*/
    this.streetTreatServiceSubs = 
    this.streetTreatService.getActiveStreetTreatCasesWithVisitByDate(new Date())
    .subscribe(streetTreatCaseByVisitDateResponse => {
      this.streetTreatCasesResponse = streetTreatCaseByVisitDateResponse;
      this.teamsDropDown = streetTreatCaseByVisitDateResponse;
      streetTreatCaseByVisitDateResponse.forEach((streetTreatResponse:any) =>
      {
        console.log(streetTreatResponse.StreetTreatCaseVisits);
        streetTreatResponse.StreetTreatCaseVisits.forEach((StreetTreatCaseVisit:any)=>{
          this.markers.push({
            streetTreatCaseId:StreetTreatCaseVisit.StreetTreatCaseId, 
            teamId:streetTreatResponse.TeamId, 
            options:{
              position: { lat: StreetTreatCaseVisit.Position.Latitude, lng: StreetTreatCaseVisit.Position.Longitude },
              draggable: true,
              icon:{
                ...this.icon,
                fillColor: streetTreatResponse.TeamColor
              }
            }
          });
          latlngbounds.extend(new google.maps.LatLng(StreetTreatCaseVisit.Position.Latitude, StreetTreatCaseVisit.Position.Longitude));
        });
      });
      this.fitMaps(latlngbounds);
      this.streetTreatServiceSubs.unsubscribe();
    });  
  }
  initMarkers(streetTreatCases:any){
    this.markers = [];
    streetTreatCases.forEach((streetTreatResponse:any) =>
    {
      streetTreatResponse.StreetTreatCaseVisits.forEach((StreetTreatCaseVisit:any)=>{
        this.markers.push({
          streetTreatCaseId:StreetTreatCaseVisit.StreetTreatCaseId, 
          teamId:streetTreatResponse.TeamId, 
          options:{
            position: { lat: StreetTreatCaseVisit.Position.Latitude, lng: StreetTreatCaseVisit.Position.Longitude },
            draggable: true,
            icon:{
              ...this.icon,
              fillColor: streetTreatResponse.TeamColor
            }
          }
        });
      });
    }); 
  }
 /*  initStreetTreatCases(date: Date){
    this.streetTreatServiceSubs = this.streetTreatService
    .getActiveStreetTreatCasesWithVisitByDate(date)
    .subscribe(streetTreatCaseByVisitDateResponse => {
      this.streetTreatCases = streetTreatCaseByVisitDateResponse;
      this.streetTreatServiceSubs.unsubscribe();
    });
  } */

  fitMaps(latlngbounds: google.maps.LatLngBounds){
    this.map.fitBounds(latlngbounds);
      this.map.panToBounds(latlngbounds);
      this.map.zoomChanged.subscribe(() => {
        if(this.map.getZoom() > 14) {
          this.map.zoom = 14;
        }
      });
  }

  trackByStreetTreatCaseId(index:number, item:any)
  {
    return item.StreetTreatCaseId;
  }

  markersTrack(index:number, item:any)
  {
    return item.teamId;
  }
}
