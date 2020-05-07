import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BoardSocketService } from '../../services/board-socket.service';
import { MatDialog } from '@angular/material/dialog';
import { RescueDetailsDialogComponent } from 'src/app/core/components/rescue-details-dialog/rescue-details-dialog.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OutstandingCase, UpdatedRescue, OutstandingRescue, RescuerGroup } from 'src/app/core/models/outstanding-case';
import { Subscription } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { RescueDetailsService } from '../../services/rescue-details.service';

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
    private socketService: BoardSocketService) { }

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

  ngOnInit(): void {

    this.searchForm = this.fb.group({
      searchTerm: ['']
    });

    this.setupConnection();

  }

  async setupConnection(){

    await this.socketService.initialiseConnection();

    this.subscription = await this.rescueService.getOutstandingRescues()
      .subscribe(outstandingCases =>

      this.populate(outstandingCases.outstandingRescues)
    );

    this.socketService.getUpdatedRescues().subscribe((updatedRescue:OutstandingRescue) => {
      this.updateRescue(updatedRescue);

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

    return rescueDialog.afterClosed();

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