import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { StreetTreatService } from '../../services/streettreat.service';
import { GoogleMap } from '@angular/google-maps';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { DatePipe } from '@angular/common';
import { ChartData, ChartResponse, ChartSelectObject, StreetTreatCases, StreetTreatCaseVisit, StreetTreatScoreCard, TeamColour } from 'src/app/core/models/streettreet';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { take } from 'rxjs/operators';


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

interface StreetTreatTabResult {
  StreetTreatCaseId:number;
  TagNumber:string;
  PatientId:number;
  EmergencyCaseId:number;
}


@Component({
  selector: 'app-team-visit-assinger',
  templateUrl: './team-visit-assinger.component.html',
  styleUrls: ['./team-visit-assinger.component.scss']
})
export class TeamVisitAssingerComponent implements OnInit, AfterViewInit {

  @Output() public openStreetTreatCase = new EventEmitter<StreetTreatTabResult>();

  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;

  animations = true;

  center:google.maps.LatLngLiteral = this.userOptions.getCoordinates();

  chartExpanded = false;
  chartData!: ChartData[];

  customColours:TeamColour[] = [];

  filteredStreetTreatCases !: StreetTreatCases[] | null | undefined;
  gradient = false;
  highlightStreetTreatCase = -1;

  icon = {
    path: 'M261-46C201-17 148 39 124 98 111 128 107 169 108 245 110 303 105 377 98 408L89 472 142 458C175 444 227 436 309 430 418 423 435 419 476 394 652 288 637 28 450-48 397-70 309-69 261-46ZZ',
    fillColor: '#FF0000',
    fillOpacity: 1,
    anchor: new google.maps.Point(0,0),
    strokeWeight: 0,
    scale: 0.07
  };

  infoWindow = new google.maps.InfoWindow();

  latlngbounds = new google.maps.LatLngBounds(undefined);
  latlngboundsArray:google.maps.LatLng[] = [];

  markers: MapMarker[] = [];

  scoreCards$!: Observable<StreetTreatScoreCard>;

  searchDate = new Date();

  showLegend = true;
  showXAxis = true;
  showYAxis = true;

  streetTreatCaseByVisitDateResponse !: StreetTreatCases[] |  null;
  streetTreatServiceSubs:Subscription = new Subscription();

  teamsDropDown:StreetTreatCases[] | null=[];
  teamsgroup!:FormGroup;

  view:[number,number] = [700,400];

  zoom = 11.0;

  constructor(
    private streetTreatService: StreetTreatService,
    private changeDetector: ChangeDetectorRef,
    private fb: FormBuilder,
    private showSnackBar: SnackbarService,
    private datePipe: DatePipe,
    private elementRef:ElementRef,
    private userOptions:UserOptionsService
    ) {
      if(innerWidth > 786)
      {
        this.view = [innerWidth / 1.1, 400];
      }
      else{
        this.view = [innerWidth * 2, 400];
      }
    }

  ngOnInit(): void {

    this.teamsgroup = this.fb.group({
      teams:[''],
      date:[this.datePipe.transform(new Date(),'yyyy-MM-dd')]
    });

    this.teamsgroup.get('teams')?.valueChanges.subscribe((teamIds)=>{

        if(teamIds.length > 0){
          this.filteredStreetTreatCases = this.streetTreatCaseByVisitDateResponse?.filter((streetTreatCase)=> teamIds.indexOf(streetTreatCase.TeamId) > -1);
        }
        else {
          this.filteredStreetTreatCases = this.streetTreatCaseByVisitDateResponse;
        }

        this.initMarkers(this.filteredStreetTreatCases);

    });

    this.teamsgroup.get('date')?.valueChanges.subscribe((date)=>{
      this.searchDate = new Date(date);

      this.streetTreatServiceSubs =
        this.streetTreatService
        .getActiveStreetTreatCasesWithVisitByDate(this.searchDate)
        .pipe(take(1))
        .subscribe((streetTreatCaseByVisitDateResponse) => {

          this.filteredStreetTreatCases = streetTreatCaseByVisitDateResponse?.Cases;
          this.streetTreatCaseByVisitDateResponse = streetTreatCaseByVisitDateResponse?.Cases;


          if(streetTreatCaseByVisitDateResponse?.Cases)
          {
            this.teamsDropDown = streetTreatCaseByVisitDateResponse?.Cases;
            this.initMarkers(this.filteredStreetTreatCases);
          }
          else{
            this.filteredStreetTreatCases = null;
            this.markers = [];
          }

          this.streetTreatServiceSubs.unsubscribe();

        });
    });
  }

  ngAfterViewInit():void {
    this.scoreCards$ = this.streetTreatService.getScoreCards();
    this.initSwimlane();
  }

  private initSwimlane() {
    this.streetTreatServiceSubs =
      this.streetTreatService.getActiveStreetTreatCasesWithVisitByDate(new Date())
        .subscribe((streetTreatCaseByVisitDateResponse) => {


          if (streetTreatCaseByVisitDateResponse?.Cases) {
            this.streetTreatCaseByVisitDateResponse = streetTreatCaseByVisitDateResponse.Cases;
            this.filteredStreetTreatCases = streetTreatCaseByVisitDateResponse.Cases;
            this.teamsDropDown = streetTreatCaseByVisitDateResponse.Cases;
            const todayDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
            this.initMarkers(streetTreatCaseByVisitDateResponse.Cases);
          }
          this.streetTreatServiceSubs.unsubscribe();
        });

    this.streetTreatService.getChartData().subscribe((data) => {
      this.initChartData(data);
    });
  }

  private initChartData(data: ChartResponse) {

    const charts = data.chartData;
    this.chartExpanded = data.chartData.length > 0 ? true : false;
    const startDate = new Date(new Date().setDate(new Date().getDate() - 7));
    const endDate = new Date(new Date().setDate(new Date().getDate() + 14));
    const datesRange = this.getDatesBetween(startDate, endDate);

    datesRange.forEach((dateObj) => {

      if (charts.filter(chart => chart.name === dateObj.name).length > 0) {
        dateObj.series = charts.filter(chart => chart.name === dateObj.name)[0].series;
      }
    });

    datesRange.forEach((date) => date.series.sort((a,b) => a.name < b.name ? -1 : 1));

    this.chartData = datesRange;

    setTimeout(() => {
      this.elementRef.nativeElement.querySelectorAll('g.tick').forEach((chartDate: any) => {
      // Renderer2 Angular Dosen't work with innerHTML it just pass to View it dosen't hold the html value
        chartDate.addEventListener('click', () => this.onDateClick(chartDate));
      });
    }, 1000);

    this.customColours = data.teamColours;
  }

  refreshRescues(){
    if(this.teamsgroup.get('date')?.value === ''){
      this.noVisits();
    }
    else{
      this.initSwimlane();
    }
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

    TeamId = parseInt(TeamId.__ngContext__[0].id, 10);

    const StreetTreatCaseId = event.item.data.StreetTreatCaseId;

    this.streetTreatService.updateVisitTeamByTeamId({TeamId,StreetTreatCaseId}).then((visitTeamUpdateResponse) =>{

      if(visitTeamUpdateResponse[0].success === 1){

        if(this.teamsgroup.get('date')?.value === ''){
          this.noVisits();
        }
        else {

          this.streetTreatServiceSubs = this.streetTreatService
          .getActiveStreetTreatCasesWithVisitByDate(this.searchDate)
          .pipe(take(1))
          .subscribe((streetTreatCaseByVisitDateResponse) => {

            streetTreatCaseByVisitDateResponse.Cases?.forEach(team =>
                team.StreetTreatCaseVisits.sort((a,b) => a.AnimalDetails.TagNumber < b.AnimalDetails.TagNumber ? 1 : -1));

            this.showSnackBar.successSnackBar('StreetTreat case team updated successfully','OK');

            this.filteredStreetTreatCases = streetTreatCaseByVisitDateResponse.Cases;
            this.initMarkers(this.filteredStreetTreatCases);
            this.streetTreatServiceSubs.unsubscribe();

          });
        }
      }
      else {
        this.showSnackBar.errorSnackBar('Error updating streettreat case team status','OK');
      }
    });

  }

  initMarkers(streetTreatCases:StreetTreatCases[] | null | undefined){

    this.markers = [];

    streetTreatCases?.forEach((streetTreatResponse) =>
    {
      streetTreatResponse.StreetTreatCaseVisits.forEach((visitResponse)=>{

        this.markers.push({

          streetTreatCaseId:visitResponse.StreetTreatCaseId,
          teamId:streetTreatResponse.TeamId,
          options:{
            position: { lat: visitResponse.Position.Latitude, lng: visitResponse.Position.Longitude },
            draggable: true,
            icon:{
              ...this.icon,
              fillColor: streetTreatResponse.TeamColour
            }
          }
        });

        this.latlngbounds.extend(new google.maps.LatLng(visitResponse.Position.Latitude, visitResponse.Position.Longitude));
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

  onSelect($event:ChartSelectObject){

    if(this.filteredStreetTreatCases)
    {
      this.teamsgroup.get('teams')?.patchValue([],{ emitEvent: false });
    }

    const dateString = $event.series.split('/');
    const date = this.datePipe.transform(new Date(new Date().getFullYear(), +dateString[1] - 1 , +dateString[0]),'yyyy-MM-dd');

    if(this.teamsgroup.get('date')?.value !== date){
      this.teamsgroup.get('date')?.patchValue(date);
    }

    setTimeout(()=>{
      const TeamId = this.streetTreatCaseByVisitDateResponse?.filter((streetTreatCase)=> streetTreatCase.TeamName === $event.name)[0]?.TeamId;
      this.teamsgroup.get('teams')?.patchValue([TeamId]);
    },100);
  }

  onDateClick($event:any){

    let date = $event.firstChild.innerHTML.trim().split('/');

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

  noVisits($event?:Event){
    $event?.preventDefault();
    $event?.stopPropagation();
    this.teamsgroup.get('date')?.patchValue('', { emitEvent: false });

    this.streetTreatService.getActiveStreetTreatCasesWithNoVisits().pipe(take(1)).subscribe((cases)=>{

      this.streetTreatCaseByVisitDateResponse = cases;
      this.filteredStreetTreatCases = cases;
      this.teamsDropDown  = cases;
      this.initMarkers(cases);

    });
  }

  openCase(streetTreatCase:StreetTreatCaseVisit,$event:Event){
    $event.preventDefault();
    $event.stopPropagation();
    const result:StreetTreatTabResult = {
      StreetTreatCaseId:streetTreatCase.StreetTreatCaseId,
      TagNumber:streetTreatCase.AnimalDetails.TagNumber,
      PatientId:streetTreatCase.AnimalDetails.PatientId,
      EmergencyCaseId:streetTreatCase.AnimalDetails.EmergencyCaseId
    };
    this.openStreetTreatCase.emit(result);
  }

}
