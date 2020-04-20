import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BoardSocketService } from '../../services/board-socket.service';
import { MatDialog } from '@angular/material/dialog';
import { RescueDetailsDialogComponent } from 'src/app/core/components/rescue-details-dialog/rescue-details-dialog.component';
import { FormBuilder } from '@angular/forms';
import { OutstandingCase, UpdatedRescue } from 'src/app/core/models/outstanding-case';
import { Subscription, of, Observable } from 'rxjs';

export interface Swimlane{
  key:string;
  state:number;
  name:string;
  array:OutstandingCase[]
}

@Component({
  selector: 'outstanding-case-board',
  templateUrl: './outstanding-case-board.component.html',
  styleUrls: ['./outstanding-case-board.component.scss']
})
export class OutstandingCaseBoardComponent implements OnInit {

  constructor(
    public rescueDialog: MatDialog,
    private fb: FormBuilder,
    private socketService: BoardSocketService) { }


  outstandingCases:OutstandingCase[];

  received:OutstandingCase[];
  assigned:OutstandingCase[];
  arrived:OutstandingCase[];
  rescued:OutstandingCase[];
  admitted:OutstandingCase[];

  subscription:Subscription;

  swimlanes:Swimlane[] = [];

  ngOnInit(): void {

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

  updateRescueStatus(updated:UpdatedRescue){

    //Find the existing record
    let updateIndex = this.outstandingCases.findIndex(elem => elem.EmergencyCaseId == updated.emergencyCaseId);

    //Get the current status so we can find the swimlane it's in
    let currentSwimlane = this.outstandingCases[updateIndex].RescueStatus;

    //get the index in the current lane
    let laneIndex = this.swimlanes[currentSwimlane - 1].array.findIndex(item => item.EmergencyCaseId === updated.emergencyCaseId);

    //Remove it from the old array and update the rescue status
    let moveItem = this.swimlanes[currentSwimlane - 1].array.splice(laneIndex, 1)[0];
    moveItem.RescueStatus = updated.rescueStatus;

    //put it into the new lane.
    this.swimlanes[updated.rescueStatus - 1].array.push(moveItem);
  }

  populate(outstandingCases:OutstandingCase[]){

    this.outstandingCases = [];

    outstandingCases.forEach(item => this.outstandingCases.push(item));

    //These must remain in order as per below as this order is used elsewhere
    this.received = this.filterOutstandingByRescueStatus(this.outstandingCases, 1, "Received");
    this.assigned = this.filterOutstandingByRescueStatus(this.outstandingCases, 2, "Assigned");
    this.arrived  = this.filterOutstandingByRescueStatus(this.outstandingCases, 3, "Arrived");
    this.rescued  = this.filterOutstandingByRescueStatus(this.outstandingCases, 4, "Rescued");
    this.admitted = this.filterOutstandingByRescueStatus(this.outstandingCases, 5, "Admitted");

    this.subscription.unsubscribe();

  }

  filterOutstandingByRescueStatus(outstandingCases:OutstandingCase[], state:number, name:string){

    let newList = outstandingCases.filter(item => item.RescueStatus === state);

    this.swimlanes.push({"key":name.toLowerCase(), "state": state, "name":name, "array": newList});

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

  openRescueEditAndMove(outstandingCase:OutstandingCase){

    this.openRescueEdit(outstandingCase).subscribe((result:UpdatedRescue) =>
    this.programmaticRescueMove(result, outstandingCase)
    );

  }

  programmaticRescueMove(result:UpdatedRescue, outstandingCase:OutstandingCase){

    if(result?.success === 1){
      //Find the index of the case we're moving
      let currentIndex = this.swimlanes[outstandingCase.RescueStatus - 1].array.findIndex(item => item.EmergencyCaseId == outstandingCase.EmergencyCaseId);

      //Go to the old swimlane and remove the case
      this.swimlanes[outstandingCase.RescueStatus - 1].array.splice(currentIndex, 1);

      //Update the rescue status of the case. This will get reloaded later, but let's
      //update it for completeness.
      outstandingCase.RescueStatus = result.rescueStatus;

      //Move the case to the new swimlane
      this.swimlanes[result.rescueStatus - 1].array.push(outstandingCase);
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

              console.log(result.rescueStatus - 1)

              //Update our base array
              let toUpdate = this.swimlanes[result.rescueStatus - 1].array.findIndex(elem => elem.EmergencyCaseId == result.emergencyCaseId)

              this.swimlanes[result.rescueStatus - 1].array[toUpdate].RescueStatus = result.rescueStatus;
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

}
