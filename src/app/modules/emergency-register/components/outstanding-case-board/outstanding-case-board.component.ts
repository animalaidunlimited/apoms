import { Component, OnInit, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MessagingService } from '../../services/messaging.service';
import { MatDialog } from '@angular/material/dialog';
import { RescueDetailsDialogComponent } from 'src/app/core/components/rescue-details-dialog/rescue-details-dialog.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OutstandingCase, UpdatedRescue, OutstandingRescue } from 'src/app/core/models/outstanding-case';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, startWith, map } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ThemePalette } from '@angular/material/core';
import { OutstandingCaseService } from '../../services/outstanding-case.service';
import { SearchResponse } from 'src/app/core/models/responses';
import { EmergencyTab } from 'src/app/core/models/emergency-record';

export interface Swimlane{
  label:string;
  state:number;
  name:string;
  array:OutstandingCase[];
}

@Component({
  selector: 'outstanding-case-board',
  templateUrl: './outstanding-case-board.component.html',
  styleUrls: ['./outstanding-case-board.component.scss'],
  animations:
  [
    trigger("rescueMoved",
    [
      state("void", style({
        background: "transparent"
      })),
      state("moved",style({
        background: "lightsteelblue"

    })),
    state("still", style({
      background: "transparent"
    })),
    transition("moved => still", [
      animate("5s")
    ]),
    transition("still => moved", [
      animate("0s")
    ])

  ])
]
})
export class OutstandingCaseBoardComponent implements OnInit {

  constructor(
    public rescueDialog: MatDialog,
    private fb: FormBuilder,
    private messagingService: MessagingService,
    private outstandingCaseService: OutstandingCaseService,
    private changeDetector: ChangeDetectorRef

    ) { }

  @Output() public onOpenEmergencyCase = new EventEmitter<EmergencyTab>();

  autoRefresh:boolean;

  hideMap: boolean = true;

  notificationPermissionGranted:boolean = false;

  outstandingCases:OutstandingCase[];
  outstandingCases$:BehaviorSubject<OutstandingCase[]>;

  refreshColour$:BehaviorSubject<ThemePalette>;
  refreshColour:ThemePalette = "primary";

  refreshForm:FormGroup;
  searchForm:FormGroup;

  ngOnInit(): void {

    this.searchForm = this.fb.group({
      searchTerm: ['']
    });

    this.refreshForm = this.fb.group({
      autoRefreshEnabled: [false, Validators.requiredTrue],
      updateRequired: [false, Validators.requiredTrue]
    });

    this.outstandingCases$ = this.outstandingCaseService.outstandingCases$;

    this.outstandingCases$.subscribe(() => {

      this.changeDetector.detectChanges();
    })

    this.outstandingCaseService.initialise();

    this.refreshColour$ = this.outstandingCaseService.refreshColour;

    this.refreshColour$.subscribe(colour => {
      this.refreshColour = colour;
    });

    this.setup();

  }

  autoRefreshToggled(){
    this.outstandingCaseService.toggleAutoRefresh();
  }


  setup(){

    //Find out whether we have permission to receive notifications or not
    this.messagingService.getPermissionGranted().subscribe((permissionGranted) => {

      this.notificationPermissionGranted = !!permissionGranted;

      this.outstandingCaseService.getAutoRefresh().subscribe(value => {

        this.autoRefresh = value;

      });

      this.outstandingCaseService.setAutoRefresh(!!permissionGranted)

      this.changeDetector.detectChanges();

    });

    //If we receive focus then make sure we tidy up as needed.
    this.outstandingCaseService.haveReceivedFocus.subscribe((focusReceived) => {

      if(focusReceived && !this.autoRefresh){
        this.refreshColour$.next("warn");
        this.changeDetector.detectChanges();
      }
      else if (focusReceived && this.autoRefresh){
        // this.refreshRescues();

        this.outstandingCases$ =  this.outstandingCaseService.outstandingCases$;

      }

    });

    this.searchForm.get("searchTerm").valueChanges
      .pipe(
        debounceTime(250),
        startWith('')
      )
      .subscribe(value => {
          this.outstandingCaseService.onSearchChange(value);
      })
  }

  drop(event: CdkDragDrop<any>) {

    if (event.previousContainer === event.container) {

      try{
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      }
      catch(e){
        console.log(e)
      }
    } else {

      try{

        //We need to move the item first when moving by drag so that the rescue
        //waits in its new swimlane until it either succeeds or fails and is moved back
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
            }
            else {
              this.refreshColour$.next("warn");
              this.changeDetector.detectChanges();
            }
          });
      }
      catch(e){
        console.log(e)
      }
    }
  }

  openRescueEdit(outstandingCase:OutstandingRescue){

    const rescueDialog = this.rescueDialog.open(RescueDetailsDialogComponent, {
      width: '500px',
      height: '500px',
      data: {
              emergencyCaseId:outstandingCase.emergencyCaseId,
              emergencyNumber:outstandingCase.emergencyNumber
            }
    });

    //If we successfully updated the rescue and we're currently set to
    //not receive auto-refresh updates, then we need to set the colour of
    //the refresh button to show we've made a change.
    let afterClosed = rescueDialog.afterClosed();

    afterClosed.subscribe(result => {

      if(result?.success === 1 && !this.autoRefresh){
        this.refreshColour$.next("warn");
        this.changeDetector.detectChanges();
      }

    });

    return afterClosed;

  }

openCaseFromMap(emergencyCase:EmergencyTab){

  this.onOpenEmergencyCase.emit(emergencyCase);

}

openCase(caseSearchResult:OutstandingRescue)
{
  let result:SearchResponse = {

    EmergencyCaseId: caseSearchResult.emergencyCaseId,
    EmergencyNumber: caseSearchResult.emergencyNumber,
    CallDateTime: caseSearchResult.callDateTime.toString(),
    CallerId: null,
    Name: caseSearchResult.callerName,
    Number: caseSearchResult.callerNumber,
    AnimalTypeId: null,
    AnimalType: null,
    PatientId: null,
    TagNumber: null,
    CallOutcomeId: caseSearchResult.callOutcomeId,
    CallOutcome: null,
    sameAsNumber: null,
    Location: caseSearchResult.location,
    Latitude: caseSearchResult.latitude,
    Longitude: caseSearchResult.longitude,
    CurrentLocation: null,

  }

  this.onOpenEmergencyCase.emit(result);
}

refreshRescues(){

  // this.outstandingCases$.subscribe(vals => console.log(vals));
 this.outstandingCaseService.refreshRescues();
}
}