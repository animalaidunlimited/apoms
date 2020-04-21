import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BoardSocketService } from '../../services/board-socket.service';
import { MatDialog } from '@angular/material/dialog';
import { RescueDetailsDialogComponent } from 'src/app/core/components/rescue-details-dialog/rescue-details-dialog.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OutstandingCase, UpdatedRescue } from 'src/app/core/models/outstanding-case';
import { Subscription } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';

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
    transition("moved <=> still", [
      animate("5s")
    ])

  ])
]
})
export class OutstandingCaseBoardComponent implements OnInit {

  constructor(
    public rescueDialog: MatDialog,
    private fb: FormBuilder,
    private socketService: BoardSocketService) { }

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

    this.searchForm.get("searchTerm").valueChanges
    .pipe(
      debounceTime(250),
      startWith('')
    )
    .subscribe(value => {
      this.onSearchChange(value);
    })


    this.setupConnection();
  }

  async setupConnection(){

    await this.socketService.setupSocketConnection();

    this.subscription = await this.socketService.getOutstandingRescues().subscribe(outstandingCases =>

      this.populate(outstandingCases)

    );

    this.socketService.getUpdatedRescues().subscribe((updatedRescue:UpdatedRescue) =>

      this.updateRescueStatus(updatedRescue)
      );
  }

  updateRescueStatus(updatedRescue:UpdatedRescue){

    //search the swimlanes for the existing rescue
    this.swimlanes.forEach(lane =>
      lane.array.forEach((rescue, index) => {
        if(rescue.EmergencyCaseId === updatedRescue.emergencyCaseId){

          //Update the rescue status
          rescue.RescueStatus = updatedRescue.rescueStatus;
          this.setMoved(rescue.EmergencyCaseId, true, false);

          //Remove the item from the existing swimlane
          //and push it into the new swimlane
          this.swimlanes[updatedRescue.rescueStatus - 1].array
          .push(lane.array.splice(index, 1)[0]);
        }
      })
      )
  }

  populate(outstandingCases:OutstandingCase[]){

    //These must remain in order as per below as this order is used elsewhere
    this.received = this.filterOutstandingByRescueStatus(outstandingCases, 1, "Received");
    this.assigned = this.filterOutstandingByRescueStatus(outstandingCases, 2, "Assigned");
    this.arrived  = this.filterOutstandingByRescueStatus(outstandingCases, 3, "Arrived");
    this.rescued  = this.filterOutstandingByRescueStatus(outstandingCases, 4, "Rescued");
    this.admitted = this.filterOutstandingByRescueStatus(outstandingCases, 5, "Admitted");

    this.subscription.unsubscribe();
  }

  filterOutstandingByRescueStatus(outstandingCases:OutstandingCase[], state:number, name:string){

    let newList = outstandingCases.filter(item => item.RescueStatus === state);

    this.swimlanes.push({"label":name.toLowerCase(), "state": state, "name":name, "array": newList});

    return newList;
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
            this.moveRescue(event, result)
          });
      }
      catch(e){
        console.log(e)
      }
    }
  }

  moveRescue(event:any, result:UpdatedRescue){

            //Check to see if we were successful and transfer back if not
            if(result?.success !== 1){
              transferArrayItem(event.container.data,
                event.previousContainer.data,
                event.currentIndex,
                event.previousIndex);
            }

            if(result?.success === 1){

              //Update our base array
              this.swimlanes[result.rescueStatus - 1].array.forEach(rescue => {
                if(rescue.EmergencyCaseId === result.emergencyCaseId){
                  rescue.RescueStatus = result.rescueStatus;
                  this.setMoved(rescue.EmergencyCaseId, true, false)
                }
              });
            }

  }

  openRescueEdit(outstandingCase:OutstandingCase){

    let recordForm = this.fb.group({

      emergencyDetails: this.fb.group({
        emergencyCaseId: [outstandingCase.EmergencyCaseId],
        callDateTime: [''],
        updateTime: ['']
      }),
      callOutcome: this.fb.group({
        callOutcome: ['']
      })
    }
    );

    const rescueDialog = this.rescueDialog.open(RescueDetailsDialogComponent, {
      width: '500px',
      height: '500px',
      data: {
              emergencyCaseId:outstandingCase.EmergencyCaseId,
              emergencyNumber:outstandingCase.EmergencyNumber,
              recordForm:recordForm
            }
    });

    return rescueDialog.afterClosed();

  }

  setMoved(emergencyCaseId:number, moved:boolean, timeout:boolean){


    //Search through the swimlanes for the rescue
    this.swimlanes.forEach(swimlane =>
      swimlane.array.forEach(rescue =>{
        if(rescue.EmergencyCaseId == emergencyCaseId){

          rescue.Moved = moved;

          if(!timeout){
            setTimeout(() => this.setMoved(emergencyCaseId, false, true), 3500)
          }
        }
      }))
  }

  onSearchChange(searchValue: string): void {



    this.swimlanes.forEach(swimlane => {

      swimlane.array.forEach(rescue => {

        rescue.SearchCandidate = false;

        //Because we can't use an observable as the source for the board, we need to add a
        //flag to the records that match our search.
        if(
          Object.keys(rescue)
          .reduce((currentTerm: string, key: string) => {
            return currentTerm + (rescue as {[key: string]: any})[key] + '◬';
          }, '').toLowerCase().indexOf(searchValue) > -1
          && searchValue !== ""
        ){
          rescue.SearchCandidate = true;
        }
      })
    })
  }
}