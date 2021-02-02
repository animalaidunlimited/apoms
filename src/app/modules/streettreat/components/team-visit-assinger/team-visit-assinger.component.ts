import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild, SecurityContext } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { StreetTreatService } from '../../services/streettreat.service';
import { GoogleMap } from '@angular/google-maps';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { DatePipe } from '@angular/common';
import { ChartData, chartSelectObject, StreetTreatCases, StreetTreatCaseVisit, StreetTreatScoreCard, TeamColor } from 'src/app/core/models/streettreet';
import { DomSanitizer } from '@angular/platform-browser';

export interface Position {
  lat: number;
  lng: number;
}
export interface MapMarker {
  marker?:google.maps.Marker;
  options: google.maps.MarkerOptions;
  streetTreatCaseId?: number;
  teamId:number;
} 


@Component({
  selector: 'app-team-visit-assinger',
  templateUrl: './team-visit-assinger.component.html',
  styleUrls: ['./team-visit-assinger.component.scss']
})
export class TeamVisitAssingerComponent implements OnInit, AfterViewInit {
  @Output() 
  public openStreetTreatCase = new EventEmitter<number>();
  icon = {
    path: 'M261-46C201-17 148 39 124 98 111 128 107 169 108 245 110 303 105 377 98 408L89 472 142 458C175 444 227 436 309 430 418 423 435 419 476 394 652 288 637 28 450-48 397-70 309-69 261-46ZZ',
    fillColor: '#FF0000',
    fillOpacity: 1,
    anchor: new google.maps.Point(0,0),
    strokeWeight: 0,
    scale: 0.07
  };
  zoom = 11.0;
  streetTreatCasesResponse !: StreetTreatCases[] | null | undefined;
  streetTreatCaseByVisitDateResponse !: StreetTreatCases[] |  null;
  teamsDropDown:StreetTreatCases[] | null=[];
  center!:google.maps.LatLngLiteral;
  latlngboundsArray:google.maps.LatLng[] = [];
  markers: MapMarker[] = [];
  highlightStreetTreatCase = -1;
  highlightMarkerStreetTreatCase = -1;
  latlngbounds = new google.maps.LatLngBounds(undefined);

  @ViewChild(GoogleMap, { static: false }) 
  map!: GoogleMap;

  @ViewChild('containerRef',{ static: false }) 
  containerRef!: ElementRef;

  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  animations= true;
  chartExpanded = false;
  chartData!: ChartData[];
  scoreCards$!: Observable<StreetTreatScoreCard>;
  infoWindow = new google.maps.InfoWindow();
  
  view:[number,number] = [700,400];
  customColors:TeamColor[] = [];
 
  searchDate = new Date();

  streetTreatServiceSubs:Subscription = new Subscription();

  teamsgroup!:FormGroup;

  @HostListener('window:resize') onResize() {
    if(this.containerRef)
    {
      this.view = [this.containerRef.nativeElement.offsetWidth/1.2, 400];
    }
  }
  constructor(
    private streetTreatService: StreetTreatService,
    private changeDetector: ChangeDetectorRef,
    private fb: FormBuilder,
    private showSnackBar: SnackbarService,
    private datePipe: DatePipe,
    private elementRef:ElementRef,
    private _sanitizer: DomSanitizer
    ) {
      this.view = [innerWidth / 1.2, 400];
    }
  ngOnInit(): void {

    this.teamsgroup = this.fb.group({
      teams:[''],
      date:[this.datePipe.transform(new Date(),'yyyy-MM-dd')]
    });
    
    this.teamsgroup.get('teams')?.valueChanges.subscribe((teamIds)=>{
        if(teamIds.length > 0){
          this.streetTreatCasesResponse = this.streetTreatCaseByVisitDateResponse?.filter((streetTreatCase)=> teamIds.indexOf(streetTreatCase.TeamId) > -1);
        }    
        else {
          this.streetTreatCasesResponse = this.streetTreatCaseByVisitDateResponse;
        } 
        this.initMarkers(this.streetTreatCasesResponse); 
    });

    this.teamsgroup.get('date')?.valueChanges.subscribe((date)=>{
      this.searchDate = new Date(date);
      this.streetTreatServiceSubs = 
        this.streetTreatService
        .getActiveStreetTreatCasesWithVisitByDate(this.searchDate)
        .subscribe((streetTreatCaseByVisitDateResponse) => {
          this.streetTreatCasesResponse = streetTreatCaseByVisitDateResponse.Cases;
          this.streetTreatCaseByVisitDateResponse = streetTreatCaseByVisitDateResponse.Cases;
          if(streetTreatCaseByVisitDateResponse.Cases)
          {
            this.teamsDropDown = streetTreatCaseByVisitDateResponse.Cases;
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
    this.scoreCards$ = this.streetTreatService.getScoreCards();
    this.streetTreatServiceSubs = 
    this.streetTreatService.getActiveStreetTreatCasesWithVisitByDate(new Date())
    .subscribe((streetTreatCaseByVisitDateResponse) => {
      this.streetTreatCaseByVisitDateResponse = streetTreatCaseByVisitDateResponse.Cases;
      this.streetTreatCasesResponse = streetTreatCaseByVisitDateResponse.Cases;
      this.teamsDropDown = streetTreatCaseByVisitDateResponse.Cases;
      if(streetTreatCaseByVisitDateResponse.Cases)
      {
        const todayDate = this.datePipe.transform(new Date(),'yyyy-MM-dd');
        this.initMarkers(streetTreatCaseByVisitDateResponse.Cases);
      }
      this.streetTreatServiceSubs.unsubscribe();
    });  
    this.streetTreatService.getChartData().subscribe((data) => {
      const charts = data.chartData;
      this.chartExpanded = data.chartData.length > 0 ? true : false;
      const startDate = new Date(new Date().setDate(new Date().getDate() - 7));
      const endDate = new Date(new Date().setDate(new Date().getDate() + 14));
      const datesRange = this.getDatesBetween(startDate, endDate);

      datesRange.forEach((dateObj)=>{
        
        if(charts.filter(chart => chart.name === dateObj.name).length > 0)
        {
          dateObj.series = charts.filter(chart => chart.name === dateObj.name)[0].series;
        } 
      });
      this.chartData = datesRange;
      setTimeout(()=>{
        const ticks = this.elementRef.nativeElement.querySelectorAll('g.tick');
        ticks.forEach((tick:any) =>{
          // Renderer2 Angular Dosen't work with innerHTML it just pass to View it dosen't hold the html value
          tick.addEventListener('click',this.onDateClick.bind(this));
   
        });
      },1000);
      this.customColors = data.teamColors;

      
    });
  }

  markerDragEnd(event: google.maps.MouseEvent) {
    const position = event.latLng.toJSON();
    this.center = { lat: position.lat, lng: position.lng };
  }
  
  markerClick(marker:MapMarker)
  {
    this.highlightStreetTreatCase = marker.streetTreatCaseId as number;
  }
  markerClean(){
    this.highlightStreetTreatCase = -1;
  }


  drop(event: CdkDragDrop<StreetTreatCaseVisit[], any>){

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
    }
    let TeamId = {...event.container} as any;
    TeamId = parseInt(TeamId.__ngContext__[0].id,10);
    const StreetTreatCaseId = event.item.data.StreetTreatCaseId;
    this.streetTreatService.updateVisitTeamByTeamId({TeamId,StreetTreatCaseId}).then((visitTeamUpdateResponse) =>{
      if(visitTeamUpdateResponse[0].success === 1){
        this.streetTreatServiceSubs = this.streetTreatService
        .getActiveStreetTreatCasesWithVisitByDate(this.searchDate)
        .subscribe((streetTreatCaseByVisitDateResponse) => {
          this.showSnackBar.successSnackBar('StreetTreat case team updated successfully','OK');
          this.streetTreatCasesResponse = streetTreatCaseByVisitDateResponse.Cases;
          this.initMarkers(this.streetTreatCasesResponse);     
          this.streetTreatServiceSubs.unsubscribe();
        });
      }else 
      {
        this.showSnackBar.errorSnackBar('Error updating streettreat case team status','OK');
      }
    });
   
  }

  
  
  initMarkers(streetTreatCases:StreetTreatCases[] | null | undefined){
    this.markers = [];
    let position:google.maps.LatLng | google.maps.LatLngLiteral;
    streetTreatCases?.forEach((streetTreatResponse) =>
    {
      streetTreatResponse.StreetTreatCaseVisits.forEach((cases)=>{
        position = { lat: cases.Position.Latitude, lng: cases.Position.Longitude };
        this.markers.push({
          streetTreatCaseId:cases.StreetTreatCaseId, 
          teamId:streetTreatResponse.TeamId, 
          options:{
            position,
            draggable: true,
            icon:{
              ...this.icon,
              fillColor: streetTreatResponse.TeamColor
            }
          }
        });
        this.latlngbounds.extend(new google.maps.LatLng(cases.Position.Latitude, cases.Position.Longitude));
      });
    });
    this.fitMaps(this.latlngbounds);
  }

  fitMaps(latlngbounds: google.maps.LatLngBounds){
    this.map.fitBounds(latlngbounds);
      this.map.panToBounds(latlngbounds);
      this.map.zoomChanged.subscribe(() => {
        if(this.map.getZoom() > 14) {
          this.map.zoom = 14;
        }
      });
  }

  trackByStreetTreatCaseId( index:number,item:StreetTreatCaseVisit)
  {
    return item.StreetTreatCaseId;
  }

  trackByTeamId(index:number, item:StreetTreatCases)
  {
    return item.TeamId;
  }

  markersTrack(index:number, item:MapMarker)
  {
    return item.teamId;
  }

  onSelect($event:chartSelectObject){
    if(this.streetTreatCasesResponse)
    {
      this.teamsgroup.get('teams')?.patchValue([]);
    }
    const dateString = $event.series.split('/');
    const date = this.datePipe.transform(new Date(new Date().getFullYear(), +dateString[1] - 1 , +dateString[0]),'yyyy-MM-dd');
    if(this.teamsgroup.get('date')?.value !== date){
      this.teamsgroup.get('date')?.patchValue(date);
    }
    
    setTimeout(()=>{
      const TeamId = this.streetTreatCaseByVisitDateResponse?.filter((streetTreatCase)=> streetTreatCase.TeamName === $event.name)[0].TeamId;
      this.teamsgroup.get('teams')?.patchValue([TeamId]);
    },100);
  }

  onDateClick($event:any){
    // console.log(this._sanitizer.sanitize(1,$event));
    let date = $event.target?.innerHTML.trim().split('/');
    date = new Date(new Date().getFullYear(), +date[1] - 1 , +date[0]);
    date = this.datePipe.transform(date,'yyyy-MM-dd');
    this.teamsgroup.get('date')?.patchValue(date);
  }


  getDatesBetween(startDate:Date, endDate:Date):ChartData[] {
    const dates:any[] = [];

    let currentDate = startDate;
    while (currentDate <= endDate) {
        dates.push(
          {
            name:this.datePipe.transform(currentDate,'d/MM') as string,
            series:[]
          } 
        );
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }
    return dates;
  }
  noVisits(){
    this.teamsgroup.get('date')?.patchValue('',{emitEvent:false});
    this.streetTreatService.getActiveStreetTreatCasesWithNoVisits().subscribe((cases)=>{
      this.streetTreatCaseByVisitDateResponse = cases;
      this.streetTreatCasesResponse = cases;
      this.teamsDropDown  = cases;
      this.initMarkers(cases);
    });
  }

  openCase(streetTreatCase:any){
    /* :SearchStreetTreatResponse  */
    const result:any = {
      StreetTreatCaseId:streetTreatCase.StreetTreatCaseId,
      TagNumber:streetTreatCase.AnimalDetails.TagNumber,
      PatientId:streetTreatCase.AnimalDetails.PatientId,
      EmergencyCaseId:streetTreatCase.AnimalDetails.EmergencyCaseId
    };
    this.openStreetTreatCase.emit(result);
  }
  
}
