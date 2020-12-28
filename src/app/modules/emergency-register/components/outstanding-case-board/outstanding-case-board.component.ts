import { Component, OnInit, EventEmitter, Output, ChangeDetectorRef, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MessagingService } from '../../services/messaging.service';
import { MatDialog } from '@angular/material/dialog';
import { RescueDetailsDialogComponent } from 'src/app/core/components/rescue-details-dialog/rescue-details-dialog.component';
import { FormBuilder, FormGroup, Validators, FormControl, NgControlStatusGroup } from '@angular/forms';
import { OutstandingCase, UpdatedRescue, OutstandingAssignment } from 'src/app/core/models/outstanding-case';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, startWith, filter } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ThemePalette } from '@angular/material/core';
import { OutstandingCaseService } from '../../services/outstanding-case.service';
import { SearchResponse } from 'src/app/core/models/responses';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { AssignReleaseDialogComponent } from 'src/app/core/components/assign-release-dialog/assign-release-dialog.component';
import { AddSearchMediaDialogComponent } from '../add-search-media-dialog/add-search-media-dialog.component';


export interface Swimlane{
  label:string;
  state:number;
  name:string;
  array:OutstandingCase[];
}

interface FilterObject {
  groupIdValue: number;
  valueId: number;
  valueName: string;
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'outstanding-case-board',
  templateUrl: './outstanding-case-board.component.html',
  styleUrls: ['./outstanding-case-board.component.scss'],
  animations:
  [
    trigger('rescueMoved',
    [
      state('void', style({
        background: 'transparent'
      })),
      state('moved',style({
        background: 'lightsteelblue'

    })),
    state('still', style({
      background: 'transparent'
    })),
    transition('moved => still', [
      animate('1s')
    ]),
    transition('still => moved', [
      animate('0s')
    ])

  ])
],
changeDetection: ChangeDetectionStrategy.OnPush
})
export class OutstandingCaseBoardComponent implements OnInit {

  autoRefresh = false;

  hideMap = true;

  loading = true;

  incomingObject!: FilterObject;

  filterArray: FilterObject[] = [];

  showList = false;

  notificationPermissionGranted = false;

  outstandingCases!:OutstandingCase[];
  outstandingCases$!:BehaviorSubject<OutstandingCase[]>;

  refreshColour$!:BehaviorSubject<ThemePalette>;
  refreshColour:ThemePalette = 'primary';

  caseFilter = [{
    groupId: 1,
    groupTitle: 'Action',
    groupValues: [{
      id: 1 , value: 'Rescue'
    },
    {
      id: 2 , value: 'Release' 
    }]
  },
  {
    groupId: 2,
    groupTitle: 'EmergencyCode',
    groupValues: [{
      id:-1 , value:'Not Defined'
    },
    {
      id:1 , value:'Red'
    },
    {
      id:2 , value:'Green'
    },
    {
      id:3 , value:'Yellow'
    },
  ]
  },
  {
    groupId: 3,
    groupTitle: 'EmergencyNumber',
    groupValues: [{
      id:1 , value:'8986'
    },
    {
      id:2 , value:'8987'
    },
    {
      id:3 , value:'8988'
    },
    {
      id:4 , value:'8989'
    },
    {
      id:5 , value:'8990'
    },
    {
      id:6 , value:'8991'
    },
    {
      id:7 , value:'8992'
    },
    {
      id:2 , value:'8993'
    },
    {
      id:3 , value:'8994'
    },
    {
      id:4 , value:'8995'
    },
    {
      id:5 , value:'8996'
    },
    {
      id:6 , value:'8997'
    },
    {
      id:7 , value:'8998'
    },
    {
      id:2 , value:'8999'
    },
    {
      id:3 , value:'8985'
    },
    {
      id:4 , value:'8945'
    },
    {
      id:5 , value:'8970'
    },
    {
      id:6 , value:'8941'
    },
    {
      id:7 , value:'8932'
    }
  ]
  }];

  refreshForm:FormGroup = new FormGroup({});
  searchForm:FormGroup = new FormGroup({});

  constructor(
    public rescueDialog: MatDialog,
    public assignReleaseDialog: MatDialog,
    private fb: FormBuilder,
    private messagingService: MessagingService,
    private outstandingCaseService: OutstandingCaseService,
    private changeDetector: ChangeDetectorRef,
    private userOptions: UserOptionsService,
    private printService: PrintTemplateService,
    private dialog: MatDialog

    ) { }

  @Output() public openEmergencyCase = new EventEmitter<SearchResponse>();

  ngOnInit(): void {

    this.searchForm = this.fb.group({
      searchTerm: ['']
    });

    this.refreshForm = this.fb.group({
      autoRefreshEnabled: [false, Validators.requiredTrue],
      updateRequired: [false, Validators.requiredTrue]
    });

    this.initialiseBoard();
    this.refreshColour$ = this.outstandingCaseService.refreshColour;

    this.refreshColour$.subscribe(colour => {
      this.refreshColour = colour;
      this.changeDetector.detectChanges();
    });

    this.setup();

  }

  initialiseBoard() {

    this.outstandingCases$ = this.outstandingCaseService.outstandingCases$;

    // Attempting to force change detection here causes the whole thing to hang.
    this.outstandingCases$.subscribe((assignments) => {
      console.log(assignments);
      this.loading = false;
      this.changeDetector.detectChanges();
    });

    this.outstandingCaseService.initialise();
  }

    openSearchMediaDialog(){

      this.dialog.open(AddSearchMediaDialogComponent, {
      minWidth: '50%',
      data: {
          mediaVal: []
      }
  });
  }

  autoRefreshToggled(){
    this.outstandingCaseService.toggleAutoRefresh();
  }

  changeDetection(value: Event) {
    console.log(value);
  }


  setup(){

    // Find out whether we have permission to receive notifications or not
    this.messagingService.getPermissionGranted().subscribe((permissionGranted) => {

      this.notificationPermissionGranted = !!permissionGranted;

      this.outstandingCaseService.getAutoRefresh().subscribe(value => {

        this.autoRefresh = value;

      });

      this.outstandingCaseService.setAutoRefresh(!!permissionGranted);
      this.changeDetector.detectChanges();

    });

    // If we receive focus then make sure we tidy up as needed.
    this.outstandingCaseService.haveReceivedFocus.subscribe((focusReceived) => {

      if(focusReceived && !this.autoRefresh){
        this.refreshColour$.next('warn');
        this.changeDetector.detectChanges();
      }
      else if (focusReceived && this.autoRefresh){
        // this.refreshRescues();

        this.outstandingCases$ =  this.outstandingCaseService.outstandingCases$;
        this.changeDetector.detectChanges();

      }

    });

    this.searchForm.get('searchTerm')?.valueChanges
      .pipe(
        debounceTime(250),
        startWith('')
      )
      .subscribe(value => {
          this.outstandingCaseService.onSearchChange(value);
      });
  }

  drop(event: CdkDragDrop<any>) {

    if (event.previousContainer === event.container) {

      try{
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        this.changeDetector.detectChanges();
      }
      catch(error){
        console.log(error);
      }
    } else {

      try{

        // We need to move the item first when moving by drag so that the rescue
        // waits in its new swimlane until it either succeeds or fails and is moved back
        transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);

        this.openRescueEdit(event.container.data[event.currentIndex]).subscribe((result:UpdatedRescue) =>
          {

            if(result?.success !== 1){
              transferArrayItem(event.container.data,
                event.previousContainer.data,
                event.currentIndex,
                event.previousIndex);
                this.changeDetector.detectChanges();
            }
            else {
              this.refreshColour$.next('warn');
              this.changeDetector.detectChanges();
            }
          });
      }
      catch(error){
        console.log(error);
      }
    }
  }


  openRescueEdit(outstandingCase:OutstandingAssignment){

      const rescueDialog = this.rescueDialog.open(RescueDetailsDialogComponent, {
        width: '500px',
        height: '500px',
        data: {
                emergencyCaseId:outstandingCase.emergencyCaseId,
                emergencyNumber:outstandingCase.emergencyNumber
              }
      });

    // If we successfully updated the rescue and we're currently set to
    // not receive auto-refresh updates, then we need to set the colour of
    // the refresh button to show we've made a change.
    const afterClosed = rescueDialog.afterClosed();

    afterClosed.subscribe(result => {

      if(result?.success === 1 && !this.autoRefresh){
        this.refreshColour$.next('warn');
      }
      this.changeDetector.detectChanges();

    });

    return afterClosed;

  }

openCaseFromMap(emergencyCase:SearchResponse){

  this.openEmergencyCase.emit(emergencyCase);

}

openCase(caseSearchResult:OutstandingAssignment)
{
  const result:SearchResponse = {

    EmergencyCaseId: caseSearchResult.emergencyCaseId,
    EmergencyNumber: caseSearchResult.emergencyNumber,
    CallDateTime: caseSearchResult.callDateTime.toString(),
    callerDetails: caseSearchResult.callerDetails,
    AnimalTypeId: 0,
    AnimalType: '',
    PatientId: 0,
    MediaCount: 0,
    TagNumber: '',
    CallOutcomeId: caseSearchResult.callOutcomeId,
    CallOutcome: undefined,
    sameAsNumber: undefined,
    Location: caseSearchResult.location,
    Latitude: caseSearchResult.latLngLiteral.lat,
    Longitude: caseSearchResult.latLngLiteral.lng,
    CurrentLocation: undefined,

  };

  this.openEmergencyCase.emit(result);
}

refreshRescues(){

  this.loading = true;
  this.outstandingCaseService.refreshRescues();
}

printEmergencyCard(emergencyCaseId: number){

  const printTemplateId = this.userOptions.getEmergencyCardTemplateId();

  this.printService.printEmergencyCaseDocument(printTemplateId, emergencyCaseId);

}

openAssignReleaseDialog(caseDetails: OutstandingAssignment) {
  const dialogRef = this.assignReleaseDialog.open(AssignReleaseDialogComponent, {
    maxWidth: '100vw',
    maxHeight: '100vh',
    data: {
      caseDetails
    }
  });
}

getTimer(startDateTime: Date | string) : string {

  if(typeof startDateTime === 'string'){
    startDateTime = new Date(startDateTime);
  }

  const result = Math.floor((new Date()).getTime() - startDateTime.getTime());

  let elapsedTime = '';

  if(result < 3600000){
    elapsedTime = Math.round(result / 60000) + 'm';
  }
  else if (result >= 3600000 && result < 86400000){
    elapsedTime = Math.round(result / 3600000) + 'h';
  }
  else if (result >= 86400000){
    elapsedTime = Math.round(result / 86400000) + 'd';
  }
  else {
    elapsedTime = 'Unk';
  }

  return elapsedTime;

}

// toggle(value:never) {
//   if (this.filterArray.includes(value)) {
//     const index = this.filterArray.indexOf(value);
//     this.filterArray.splice(index, 1);
//   }
//   else {
//     this.filterArray.push(value);
//   }
//   console.log(this.filterArray);
// }

// hasOrNot(value:never) {
//   return this.filterArray.includes(value);
// }

toggle(groupId:number,id:number,value:string) {
  this.incomingObject = {
    groupIdValue: groupId,
    valueId: id,
    valueName: value
  };

  const objectExist = this.filterArray.some(data=> data.groupIdValue === this.incomingObject.groupIdValue && data.valueName === this.incomingObject.valueName);
  const objectExistWithDifVal = this.filterArray.some(data=> data.groupIdValue === this.incomingObject.groupIdValue && data.valueName !== this.incomingObject.valueName);

  if(!objectExist && !objectExistWithDifVal) {

   this.filterArray.push(this.incomingObject);

    this.filterOutstanding(this.filterArray);

    console.log(this.filterArray)

  }
  else if(!objectExist && objectExistWithDifVal) {
    const index =  this.filterArray.findIndex(data=> data.groupIdValue === this.incomingObject.groupIdValue && data.valueName !== this.incomingObject.valueName);

    this.filterArray.splice(index,1);

    this.filterArray.push(this.incomingObject);

    this.filterOutstanding(this.filterArray);

  }
  else if(objectExist && !objectExistWithDifVal) {
    const index = this.filterArray.findIndex(data=> data.groupIdValue === this.incomingObject.groupIdValue && data.valueName === this.incomingObject.valueName);

    this.filterArray.splice(index,1);

    this.filterOutstanding(this.filterArray);

  }

}

hasOrNot(groupId:number, id:number ,value:string) {
  this.incomingObject = {
    groupIdValue: groupId,
    valueId: id,
    valueName: value
  };
  const objectExist = this.filterArray.some(data=> data.groupIdValue === this.incomingObject.groupIdValue && data.valueName === this.incomingObject.valueName);
  return objectExist;
}

filterOutstanding(arrayToFilter: FilterObject[]) {
  const filteredArrayByAction: any[] = [];
  const filteredArrayByCode: any[] = [];
  const filteredArrayByEmno: any[] = [];

  this.outstandingCases$.subscribe((assignments)=> {

    arrayToFilter.forEach(filterVal=> {
      if(filterVal.groupIdValue === 1) {
        assignments.map((status)=> {
          status.statusGroups.map((statusNames)=> {
            const data = statusNames.actions.filter((statusName)=> statusName.ambulanceAction === arrayToFilter[0].valueName);
            if(data.length>0){
              filteredArrayByAction.push(data[0]);
            }
          });
        });
      }

      if(filteredArrayByAction.length === 0 && filteredArrayByEmno.length === 0 && filterVal.groupIdValue === 2) {
        assignments.map((status)=> {
          status.statusGroups.map((statusNames)=> {
            statusNames.actions.map((action)=> {
              const data = action.ambulanceAssignment.filter((assignment)=>
              assignment.emergencyCodeId === filterVal.valueId);
              
              if(data.length>0) 
                filteredArrayByCode.push(data[0]);
              
            });
          });
        });
      }

      if(filteredArrayByAction.length === 0 && filteredArrayByCode.length === 0 && filterVal.groupIdValue === 3) {
        assignments.map((status)=> {
          status.statusGroups.map((statusNames)=> {
            statusNames.actions.map((action)=> {
              const data = action.ambulanceAssignment.filter((assignment)=>
              assignment.emergencyNumber === parseInt(filterVal.valueName, 10));
              
              if(data.length>0) 
                filteredArrayByEmno.push(data[0]);
              
            });
          });
        });
      }

      
    });

  });

  console.log(filteredArrayByAction);
  console.log(filteredArrayByCode);
  console.log(filteredArrayByEmno);

}

}