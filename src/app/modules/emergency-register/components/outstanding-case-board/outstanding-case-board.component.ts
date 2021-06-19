import { Component, OnInit, EventEmitter, Output, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild, ViewChildren, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MessagingService } from '../../services/messaging.service';
import { MatDialog } from '@angular/material/dialog';
import { RescueDetailsDialogComponent } from 'src/app/core/components/rescue-details-dialog/rescue-details-dialog.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OutstandingCase, UpdatedRescue, OutstandingAssignment } from 'src/app/core/models/outstanding-case';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, startWith, takeUntil } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ThemePalette } from '@angular/material/core';
import { OutstandingCaseService } from '../../services/outstanding-case.service';
import { SearchResponse } from 'src/app/core/models/responses';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { ReleaseAssignDialogComponent } from 'src/app/core/components/release-assign-dialog/release-assign-dialog.component';
import { AddSearchMediaDialogComponent } from '../add-search-media-dialog/add-search-media-dialog.component';
import { MediaDialogComponent } from 'src/app/core/components/media/media-dialog/media-dialog.component';

import { MatChip, MatChipList } from '@angular/material/chips';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { AnimalType } from 'src/app/core/models/animal-type';
import { EmergencyCode } from 'src/app/core/models/emergency-record';

export interface Swimlane{
  label:string;
  state:number;
  name:string;
  array:OutstandingCase[];
}

interface ActionStatus {
  actionStatus: number;
  actionStatusName: string;
}
export interface FilterKeys {
  group: string;
  value: string;
  selected: boolean;
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
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

export class OutstandingCaseBoardComponent implements OnInit, OnDestroy {

  @Output() public openEmergencyCase = new EventEmitter<SearchResponse>();
  @ViewChildren('filterChips') filterChips!: MatChipList[];
  @ViewChild('filterDiv') filterDiv!: ElementRef;
  @ViewChild('chipsDiv') chipsDiv!: ElementRef;

  ngUnsubscribe = new Subject();

  actionStatus: ActionStatus[] = [{actionStatus:1 , actionStatusName: 'Recieved'},
    {actionStatus: 2, actionStatusName: 'Assigned'},
    {actionStatus: 3, actionStatusName: 'Arrived/Picked'},
    {actionStatus: 4, actionStatusName: 'Rescued/Released'},
    {actionStatus: 5, actionStatusName: 'Admitted'}];

    autoRefresh = false;

    caseFilter = [{
      groupId: 1,
      showTitle: 'Ambulance action',
      groupTitle: 'ambulanceAction',
      groupValues: [{
        id: 1 , value: 'Rescue'
      },
      {
        id: 2 , value: 'Release'
      }]
    },
    {
      groupId: 2,
      groupTitle: 'emergencyCode',
      showTitle: 'Emergency code',
      groupValues: []
    },
    {
      groupId: 3,
      showTitle: 'Animal type',
      groupTitle: 'animalType',
      groupValues: []
    }];

    clickCount = 0;

  filterBtnColor: ThemePalette = 'accent';
  filterKeysArray : FilterKeys[] = [];

  hideList = true;
  hideMap = true;

  incomingObject!: FilterKeys;

  loading = true;

  notificationPermissionGranted = false;

  refreshColour:ThemePalette = 'primary';
  refreshColour$!:BehaviorSubject<ThemePalette>;

 /*  refreshForm:FormGroup = new FormGroup({}); */
  removable = true;

  outstandingCases!:OutstandingCase[];
  outstandingCases$!:BehaviorSubject<OutstandingCase[]>;
  outstandingCasesArray!:OutstandingCase[];

  searchForm:FormGroup = new FormGroup({});
  searchValue!: string;


  constructor(
    public rescueDialog: MatDialog,
    public releaseAssignDialog: MatDialog,
    private fb: FormBuilder,
    private messagingService: MessagingService,
    private outstandingCaseService: OutstandingCaseService,
    private changeDetector: ChangeDetectorRef,
    private userOptions: UserOptionsService,
    private printService: PrintTemplateService,
    private dialog: MatDialog,
    private dropDown: DropdownService,
    private renderer: Renderer2
    ) {}

  ngOnInit(): void {

    this.renderer.listen('window', 'click',(e:Event)=>{

      // The below logic made the filter list disappear when click outside it.
      if(!this.filterDiv?.nativeElement.contains(e.target)) {
        this.hideList= true;
        this.changeDetector.detectChanges();
      }

      });

    this.dropDown.getAnimalTypes()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe((animalType: AnimalType[])=> {

      animalType.forEach(type=> {

        this.caseFilter.forEach(filterObject=>{

          if(filterObject.groupId === 3) {

            filterObject.groupValues.push({
              id: type.AnimalTypeId,
              value: type.AnimalType
            });

          }

        });

      });

    });


    this.dropDown.getEmergencyCodes()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe((emergencyCodes: EmergencyCode[])=> {
      emergencyCodes.forEach(emcode=>{

        this.caseFilter.forEach(filterObject=>{

          if(filterObject.groupId === 2) {

            filterObject.groupValues.push({
              id: emcode.EmergencyCodeId,
              value: emcode.EmergencyCode
            });

          }

        });

      });
    });

    this.searchForm = this.fb.group({
      searchTerm: ['']
    });

/*     this.refreshForm = this.fb.group({
      autoRefreshEnabled: [false, Validators.requiredTrue],
      updateRequired: [false, Validators.requiredTrue]
    }); */

    this.initialiseBoard();
    this.refreshColour$ = this.outstandingCaseService.refreshColour;

    this.refreshColour$
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(colour => {
      this.refreshColour = colour;
      this.changeDetector.detectChanges();
    });

    this.setup();

  }

  ngOnDestroy() {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
  }

  initialiseBoard() {

    this.outstandingCases$ = this.outstandingCaseService.outstandingCases$;

    // Attempting to force change detection here causes the whole thing to hang.
    this.outstandingCases$
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe((assignments) => {

      this.outstandingCasesArray = assignments;

      this.actionStatus.forEach(status=> {
        const statusExist = this.outstandingCasesArray.some(statusObj=> statusObj.actionStatus === status.actionStatus);

        if(statusExist) {
          return;
        }
        else {
          this.outstandingCasesArray.push({
            actionStatus: status.actionStatus,
            actionStatusName: status.actionStatusName,
            statusGroups: []
          });
        }

        this.outstandingCasesArray.sort((status1,status2)=> status1.actionStatus - status2.actionStatus);
      });

        this.loading = false;
        this.changeDetector.detectChanges();
    });

    this.outstandingCaseService.initialise();
  }

  openMediaDialog(patientId: number, tagNumber: string | null): void{
    this.dialog.open(MediaDialogComponent, {
        minWidth: '50%',
        data: {
            tagNumber,
            patientId,
        }
    });

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

  setup(){

    // Find out whether we have permission to receive notifications or not
    this.messagingService.getPermissionGranted()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe((permissionGranted) => {

      this.notificationPermissionGranted = !!permissionGranted;

      this.outstandingCaseService.getAutoRefresh()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(value => {

        this.autoRefresh = value;

      });

      this.outstandingCaseService.setAutoRefresh(!!permissionGranted);
      this.changeDetector.detectChanges();

    });

    // If we receive focus then make sure we tidy up as needed.
    this.outstandingCaseService.haveReceivedFocus
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe((focusReceived) => {

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
        startWith(''),
        takeUntil(this.ngUnsubscribe)
        )
      .subscribe(value => {
        this.searchValue = value;
          this.outstandingCaseService.onSearchChange(this.filterKeysArray,this.searchValue);
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

        this.openRescueEdit(event.container.data[event.currentIndex])
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((result:UpdatedRescue) =>
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
        maxWidth: 'auto',
        maxHeight: '100vh',
        data: {
                emergencyCaseId:outstandingCase.emergencyCaseId,
                emergencyNumber:outstandingCase.emergencyNumber
              }
      });

    // If we successfully updated the rescue and we're currently set to
    // not receive auto-refresh updates, then we need to set the colour of
    // the refresh button to show we've made a change.
    const afterClosed = rescueDialog.afterClosed();

    afterClosed
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(result => {

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

openReleaseAssignDialog(caseDetails: OutstandingAssignment) {
  const dialogRef = this.releaseAssignDialog.open(ReleaseAssignDialogComponent, {
    maxWidth: '100vw',
    maxHeight: '100vh',
    data: {
      caseDetails
    }
  });
}

filterChipSelected(groupName: string, chip: MatChip) {

  this.incomingObject = {
    group: groupName,
    value: chip.value.trim(),
    selected: chip.selected
  };

  if(this.incomingObject.selected) {

    this.filterKeysArray.push(this.incomingObject);
  }

  if(!this.incomingObject.selected) {
    const index = this.filterKeysArray.findIndex(obj=> obj.group === this.incomingObject.group &&
    obj.value === this.incomingObject.value);
    this.filterKeysArray.splice(index,1);
  }

  this.outstandingCaseService.onSearchChange(this.filterKeysArray, this.searchValue);

}


}
