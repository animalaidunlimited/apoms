import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { StreetTreatService } from '../../services/streettreat.service';
import { ActiveCasesForTeamByDateResponse } from 'src/app/core/models/streettreet';
import { GoogleMap } from '@angular/google-maps';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject, Subscription } from 'rxjs';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { DatePipe } from '@angular/common';

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
  streetTreatCasesResponse !: any[];
  streetTreatCaseByVisitDateResponse !: any[];
  teamsDropDown:any[]=[];
  center!:google.maps.LatLngLiteral;
  latlngboundsArray:google.maps.LatLng[] = [];
  markers: mapMarker[] = [];
  highlightStreetTreatCase = -1;
  highlightMarkerStreetTreatCase = -1;
  latlngbounds = new google.maps.LatLngBounds(undefined);
  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  @ViewChild('containerRef',{ static: false }) containerRef!: ElementRef;
  showXAxis: boolean = true;
  gradient: boolean = false;
  showLegend: boolean = true;
  animations: boolean = true;
  casesWithoutVisits: number = 0;
  totalVisitToday: number = 0;
  visitCompleteToday: number = 0;
  chartData!: any[];
  infoWindow = new google.maps.InfoWindow();
  private _refreshNeeded$ = new Subject<void>();
  view:[number,number] = [700,400];
  customColors:{name:string, value:string}[] = [
    {
        name: 'Team Pushkar',
        value: '#75d5ff' 
    },
    {
        name: 'Team A',
        value: '#ff7d78',
    },
    {
        name: 'Team C',
        value: '#0432ff' 
    },
    {
        name: 'Team Vinod',
        value: '#fefb00' 
    },
    {
        name: 'Team D',
        value: '#72fcd5' 
    },
    {
        name: 'Team F',
        value: '#ff9300' 
    }
];
  
  get refreshNeeded$(){
    return this._refreshNeeded$;
  }

  searchDate = new Date();

  streetTreatServiceSubs:Subscription = new Subscription();

  teamsgroup!:FormGroup;

  @HostListener('window:resize') onResize() {
    console.log(this.containerRef.nativeElement.offsetWidth);
    if(this.containerRef)
    {
      
      this.view = [this.containerRef.nativeElement.offsetWidth, 400];
    }
  }
  constructor(
    private streetTreatService: StreetTreatService,
    private changeDetector: ChangeDetectorRef,
    private fb: FormBuilder,
    private showSnackBar: SnackbarService,
    private datePipe: DatePipe,
    private elementRef:ElementRef
    ) {
      this.view = [innerWidth / 1.1, 400];
    }

  markerDragEnd(event: google.maps.MouseEvent) {
    const position = event.latLng.toJSON();
    this.center = { lat: position.lat, lng: position.lng };
  }
  
  markerClick(marker:mapMarker)
  {
    this.highlightStreetTreatCase = marker.streetTreatCaseId as number;
  }

  highLightMarker(streetTreatCaseId:any){
      this.markers.forEach((marker)=>{
        if(marker.streetTreatCaseId == streetTreatCaseId)
        {
          //marker.marker?.setAnimation(1);
          /* console.log(marker.marker?.setAnimation(1)); */
          // this.highlightMarkerStreetTreatCase  = marker.streetTreatCaseId as number;
        }
      }); 
      // console.log(this.markers.findIndex((marker) => marker.streetTreatCaseId = streetTreatCase));
  
  }

  markerClean(){
    this.highlightStreetTreatCase = -1;
  /*   this.highlightMarkerStreetTreatCase = -1; */
  }
  
  
  drop(event: CdkDragDrop<string[]>){
    // console.log(event);
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
        /* console.log("Previous Container",event.previousContainer); */
        
    }
    let TeamId = {...event.container} as any;
    TeamId = parseInt(TeamId.__ngContext__[0].id);
    const StreetTreatCaseId = event.item.data.StreetTreatCaseId;
    this.streetTreatService.updateVisitTeamByTeamId({TeamId,StreetTreatCaseId}).then((visitTeamUpdateResponse) =>{
      if(visitTeamUpdateResponse[0].success === 1){
        this.streetTreatServiceSubs = this.streetTreatService
        .getActiveStreetTreatCasesWithVisitByDate(this.searchDate)
        .subscribe(streetTreatCaseByVisitDateResponse => {
          this.showSnackBar.successSnackBar('StreetTreat case team updated successfully','OK')
          this.streetTreatCasesResponse = streetTreatCaseByVisitDateResponse;
          this.initMarkers(this.streetTreatCasesResponse);     
          this.streetTreatServiceSubs.unsubscribe();
        });
      }else 
      {
        this.showSnackBar.errorSnackBar('Error updating streettreat case team status','OK');
      }
    });
   
  }

  ngOnInit(): void {

    this.teamsgroup = this.fb.group({
      teams:[''],
      date:[]
    });
    
    this.teamsgroup.get('teams')?.valueChanges.subscribe((teamIds)=>{
        if(teamIds.length > 0){
          this.streetTreatCasesResponse = this.streetTreatCaseByVisitDateResponse.filter((streetTreatCase)=> teamIds.indexOf(streetTreatCase.TeamId) > -1);
        }    
        else {
          this.streetTreatCasesResponse = this.streetTreatCaseByVisitDateResponse
        } 
        this.initMarkers(this.streetTreatCasesResponse); 
    });

    this.teamsgroup.get('date')?.valueChanges.subscribe((date)=>{
      this.searchDate = new Date(date);
      this.streetTreatServiceSubs = 
        this.streetTreatService
        .getActiveStreetTreatCasesWithVisitByDate(this.searchDate)
        .subscribe(streetTreatCaseByVisitDateResponse => {
          this.streetTreatCasesResponse = streetTreatCaseByVisitDateResponse;
          this.streetTreatCaseByVisitDateResponse = streetTreatCaseByVisitDateResponse;
          if(streetTreatCaseByVisitDateResponse)
          {
            this.teamsDropDown = streetTreatCaseByVisitDateResponse;
            this.initMarkers(this.streetTreatCasesResponse);
          }
          else{
            this.markers = [];
          }
          this.streetTreatServiceSubs.unsubscribe(); 
        });
    });
  }

  ngAfterViewInit():void {
    // this.initStreetTreatCases(new Date());
    this.streetTreatServiceSubs = 
    this.streetTreatService.getActiveStreetTreatCasesWithVisitByDate(new Date())
    .subscribe(streetTreatCaseByVisitDateResponse => {
      this.streetTreatCaseByVisitDateResponse = streetTreatCaseByVisitDateResponse;
      this.streetTreatCasesResponse = streetTreatCaseByVisitDateResponse;
      this.teamsDropDown = streetTreatCaseByVisitDateResponse;
      if(streetTreatCaseByVisitDateResponse)
      {
        const todayDate = this.datePipe.transform(new Date(),"yyyy-MM-dd");
        this.initMarkers(streetTreatCaseByVisitDateResponse);
        streetTreatCaseByVisitDateResponse.forEach((streetTreatCase:any)=>{
          streetTreatCase.StreetTreatCaseVisits.forEach((streetTreatCaseDetails:any)=>{
            streetTreatCaseDetails.Visits.forEach((visit:any)=>{
              if(visit.VisitStatus == "Complete"){
                this.visitCompleteToday += 1;
              }
              if(todayDate == visit.VisitDate){
                this.totalVisitToday += 1;
              }
            });
          });
        });
      }
      this.streetTreatServiceSubs.unsubscribe();
    });  
    this.streetTreatService.getChartData().subscribe((charts) => {
      let datesRange:any =this.getDatesBetween(
            new Date(charts[0].name), 
            new Date(
              new Date(charts[charts.length - 1].name)
              .setDate(new Date(charts[charts.length - 1].name)
              .getDate() + 5)
            )
      );


      datesRange.forEach((dateObj:any)=>{
        
        if(charts.filter((chart:any) => chart.name == dateObj.name).length > 0)
        {
          dateObj.series = charts.filter((chart:any) => chart.name == dateObj.name)[0].series;
        } 
      });

      this.chartData = datesRange;
      setTimeout(()=>{
        const ticks = this.elementRef.nativeElement.querySelectorAll('g.tick');
        ticks.forEach((tick:any) =>{
          tick.addEventListener('click',this.onDateClick.bind(this))
        });
      },1000);
      
    });

    this.streetTreatService.getActiveStreetTreatCasesWithNoVisits(new Date()).subscribe((cases)=>{
      this.streetTreatCaseByVisitDateResponse = cases;
      this.streetTreatCasesResponse = cases;
      this.teamsDropDown  = cases;
      this.initMarkers(this.streetTreatCasesResponse);
      this.streetTreatCasesResponse.forEach((streetTreatCase)=>{
        streetTreatCase.StreetTreatCaseVisits.forEach((streetTreatCaseDetails:any) =>{
          this.casesWithoutVisits += 1;
        });
      });
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
        this.latlngbounds.extend(new google.maps.LatLng(StreetTreatCaseVisit.Position.Latitude, StreetTreatCaseVisit.Position.Longitude));
      });
    });
    this.fitMaps(this.latlngbounds);
  }
  /* initStreetTreatCases(date: Date){
    this.streetTreatServiceSubs = this.streetTreatService
    .getActiveStreetTreatCasesWithVisitByDate(date)
    .subscribe(streetTreatCaseByVisitDateResponse => {
      this.streetTreatCasesResponse = streetTreatCaseByVisitDateResponse;
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

  onSelect($event:any){
    if(this.streetTreatCasesResponse)
    {
      // reset
      this.teamsgroup.get('teams')?.patchValue([]);
    }
    const date = this.datePipe.transform($event.series,"yyyy-MM-dd");
    if(this.teamsgroup.get('date')?.value !== date){
      this.teamsgroup.get('date')?.patchValue(date);
    }
    
    setTimeout(()=>{
      const TeamId = this.streetTreatCaseByVisitDateResponse.filter((streetTreatCase)=> streetTreatCase.TeamName === $event.name)[0].TeamId;
      this.teamsgroup.get('teams')?.patchValue([TeamId]);
    },100);
  }

  /* onResize($event:any) {
    this.view = [$event.target.innerWidth / 1.35, 400];
  } */

  onDateClick($event:any){
    const date = this.datePipe.transform($event.target.innerHTML.trim(),"yyyy-MM-dd");
    this.teamsgroup.get('date')?.patchValue(date);
  }

  getDatesBetween(startDate:Date, endDate:Date){
    endDate = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    );
    const dates = [];

    // Strip hours minutes seconds etc.
    let currentDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
    );

    while (currentDate <= endDate) {
        dates.push(
          {
            name:this.datePipe.transform(currentDate,'M/d/yyyy'),
            series:[]
          } 
        );
        currentDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate() + 1, // Will increase month if over range
        );
    }
    return dates;
  }
  noVisits(){
    this.casesWithoutVisits = 0;
    this.streetTreatService.getActiveStreetTreatCasesWithNoVisits(new Date()).subscribe((cases)=>{
      this.streetTreatCaseByVisitDateResponse = cases;
      this.streetTreatCasesResponse = cases;
      this.teamsDropDown  = cases;
      this.initMarkers(this.streetTreatCasesResponse);
      this.streetTreatCasesResponse.forEach((streetTreatCase)=>{
        streetTreatCase.StreetTreatCaseVisits.forEach((streetTreatCaseDetails:any) =>{
          this.casesWithoutVisits += 1;
        });
      });
    });
  }
  
}
