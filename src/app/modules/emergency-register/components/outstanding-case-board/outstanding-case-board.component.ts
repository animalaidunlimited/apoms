import { Component, OnInit, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MessagingService } from '../../services/messaging.service';
import { MatDialog } from '@angular/material/dialog';
import { RescueDetailsDialogComponent } from 'src/app/core/components/rescue-details-dialog/rescue-details-dialog.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OutstandingCase, UpdatedRescue, OutstandingRescue, RescuerGroup } from 'src/app/core/models/outstanding-case';
import { Subscription } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { RescueDetailsService } from '../../services/rescue-details.service';
import { ThemePalette } from '@angular/material/core';

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
    private rescueService: RescueDetailsService,
    private messagingService: MessagingService,
    private changeDetector: ChangeDetectorRef

    ) { }

  @Output() public onOpenEmergencyCase = new EventEmitter<any>();

  outstandingCases:OutstandingCase[];
  received:OutstandingCase[];
  assigned:OutstandingCase[];
  arrived:OutstandingCase[];
  rescued:OutstandingCase[];
  admitted:OutstandingCase[];

  subscription:Subscription;

  swimlanes:Swimlane[] = [];

  searchForm:FormGroup;
  refreshForm:FormGroup;

  autoRefresh:boolean = false;
  notificationPermissionGranted:boolean = false;

  refreshColour: ThemePalette = "primary";

  mapShowing: boolean = false;



  ngOnInit(): void {

    this.searchForm = this.fb.group({
      searchTerm: ['']
    });

    this.refreshForm = this.fb.group({
      autoRefreshEnabled: [false, Validators.requiredTrue],
      updateRequired: [false, Validators.requiredTrue]
    });

    this.setupConnection();

  }

  autoRefreshToggled(){
    this.autoRefresh = !this.autoRefresh;
  }

  async setupConnection(){

    //Get ths initial list of rescues
    this.subscription = this.refreshRescueSubscription();

    //Find out whether we have permission to receive notifications or not
    this.messagingService.getPermissionGranted().subscribe((permissionGranted) => {

      this.notificationPermissionGranted = !!permissionGranted;

      this.autoRefresh = !!permissionGranted;
      this.changeDetector.detectChanges();

    });


    this.messagingService.getUpdatedRescue().subscribe((updatedRescue) => {

      //Here we only do the refresh if the user has the toggle turned on.
      if(updatedRescue?.messageData && this.autoRefresh){

        this.updateRescue(JSON.parse(JSON.parse(updatedRescue?.messageData)));
      }
      else if(updatedRescue?.messageData && !this.autoRefresh){
        this.refreshColour = "warn";
        this.changeDetector.detectChanges();
      }
    });

    //If we receive focus then make sure we tidy up as needed.
    this.messagingService.haveReceivedFocus.subscribe((focusReceived) => {

      if(focusReceived && !this.autoRefresh){
        this.refreshColour = "warn";
        this.changeDetector.detectChanges();
      }
      else if (focusReceived && this.autoRefresh){
        this.refreshRescues();
      }

    });

    this.searchForm.get("searchTerm").valueChanges
      .pipe(
        debounceTime(250),
        startWith('')
      )
      .subscribe(value => {
          this.onSearchChange(this.outstandingCases, value);
      })
  }
  
  refreshRescues(){
    this.subscription = this.refreshRescueSubscription();
  }

  refreshRescueSubscription():Subscription{

    return this.rescueService.getOutstandingRescues()
    .subscribe(outstandingCases => {

    this.populate(outstandingCases.outstandingRescues)
    }
    );

  }

  updateRescue(updatedRescue:OutstandingRescue){

    //Find the rescue and remove it from its current location.
    // let rescueToMove:OutstandingRescue =
    this.removeRescueById(this.outstandingCases, updatedRescue);

    //If the record is no longer outstanding, then remove it from the list
    if(!updatedRescue.rescueStatus){
      return;
    }

    //Check to see if the swimlane exists and insert if not
    let laneExists = this.outstandingCases.find(elem => elem.rescueStatus === updatedRescue.rescueStatus);

    let newRescueGroup:RescuerGroup = {
      rescuer1: updatedRescue.rescuer1Id,
      rescuer1Abbreviation: updatedRescue.rescuer1Abbreviation,
      rescuer2: updatedRescue.rescuer2Id,
      rescuer2Abbreviation: updatedRescue.rescuer2Abbreviation,
      rescues: [updatedRescue],
    };

    if(!laneExists){

      this.outstandingCases.push({
        rescueStatus: updatedRescue.rescueStatus,
        rescuerGroups: [newRescueGroup]
      })
    }

    //Check to see if the rescuers exist and insert if not
    let rescuersExist = this.outstandingCases.find(rescueState => {

      if(rescueState.rescueStatus === updatedRescue.rescueStatus)
      {
       return rescueState.rescuerGroups
      .find(rescueGroup =>  rescueGroup.rescuer1 === updatedRescue.rescuer1Id &&
                            rescueGroup.rescuer2 === updatedRescue.rescuer2Id)
      }
    });

    if(!rescuersExist){

      this.outstandingCases.forEach(rescueState => {

        if(rescueState.rescueStatus == updatedRescue.rescueStatus){
          rescueState.rescuerGroups.push(newRescueGroup);
        }
      });
    }

    //Insert the rescue into its new home
    if(rescuersExist && laneExists){
      this.insertRescue(this.outstandingCases, updatedRescue);
    }

    //Set the rescue to show as moved
    this.setMoved(this.outstandingCases, updatedRescue.emergencyCaseId, true, false);
    this.changeDetector.detectChanges();

  }

  insertRescue(outstanding:OutstandingCase[], rescue:OutstandingRescue){

    outstanding.forEach(status => {

      if(status.rescueStatus === rescue.rescueStatus){

        status.rescuerGroups.forEach(group => {

          if(group.rescuer1 === rescue.rescuer1Id && group.rescuer2 === rescue.rescuer2Id){

            group.rescues.push(rescue);
          }
        });
      }
    });
  }

  removeRescueById(outstanding:OutstandingCase[], rescue:OutstandingRescue):OutstandingRescue {

    //Search through the outstanding cases and remove the old case
    let returnCase:OutstandingRescue;

    outstanding.forEach(status => {



        status.rescuerGroups.forEach((group,index) => {

            let removeIndex = group.rescues
                              .findIndex(current => current.emergencyCaseId == rescue.emergencyCaseId);

            if(removeIndex > -1){

              returnCase = group.rescues.splice(removeIndex, 1)[0];

              //If the group is now empty, remove it.
              if(group.rescues.length === 0){
                status.rescuerGroups.splice(index,1);
              }
              return;
            }
          })
    });

    return returnCase;
  }

  populate(outstandingCases:OutstandingCase[]){

    this.outstandingCases = outstandingCases;

    this.subscription.unsubscribe();
    this.refreshColour = "primary";
    this.changeDetector.detectChanges();
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
              this.refreshColour = "warn";
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
        this.refreshColour = "warn";
        this.changeDetector.detectChanges();
      }

    })


    return afterClosed;



  }

  setMoved(o:any, emergencyCaseId:number, moved:boolean, timeout:boolean){

    //Search for the rescue and update its moved flag depending on whether this function
    //is being called by itself or not
      if( o?.emergencyCaseId === emergencyCaseId ){

        o.moved = moved;

        if(!timeout){
          setTimeout(() => this.setMoved(this.outstandingCases, emergencyCaseId, false, true), 3500)
        }

      }
      var result, p;
      for (p in o) {
          if( o.hasOwnProperty(p) && typeof o[p] === 'object' ) {
              result = this.setMoved(o[p], emergencyCaseId, moved, timeout);
          }
      }

      this.changeDetector.detectChanges();

  }

  onSearchChange(o:OutstandingCase[], searchValue: string): void {

    if(!o){
      return;
    }

    o.forEach(status =>
      {
        status.rescuerGroups.forEach(group => {

            group.rescues.forEach(rescue => {

              rescue.searchCandidate = false;

              //Because we can't use an observable as the source for the board, we need to add a
              //flag to the records that match our search.
              if(
                Object.keys(rescue)
                .reduce((currentTerm: string, key: string) => {
                  return currentTerm + (rescue as {[key: string]: any})[key] + '◬';
                }, '').toLowerCase().indexOf(searchValue) > -1
                && searchValue !== ""
              ){
                rescue.searchCandidate = true;
              }
            });
          });
      });
  }

openCase(caseSearchResult:OutstandingRescue)
{
  this.onOpenEmergencyCase.emit(
    { "caseSearchResult" : {"EmergencyCaseId" : caseSearchResult.emergencyCaseId,
  "EmergencyNumber" : caseSearchResult.emergencyNumber}});
}
}