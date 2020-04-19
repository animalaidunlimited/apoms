import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BoardSocketService } from '../../services/board-socket.service';
import { MatDialog } from '@angular/material/dialog';
import { RescueDetailsDialogComponent } from 'src/app/core/components/rescue-details-dialog/rescue-details-dialog.component';
import { FormBuilder } from '@angular/forms';
import { OutstandingCase, UpdatedRescue } from 'src/app/core/models/outstanding-case';
import { Subscription, of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

  rescueDialogResult:UpdatedRescue;

  swimlanes = [];

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

    let updateIndex = this.outstandingCases.findIndex(elem => elem.EmergencyCaseId == updated.emergencyCaseId);

    this.outstandingCases[updateIndex].RescueStatus == updated.rescueStatus;
  }

//TODO make this type safe
  populate(outstandingCases:any){

    this.outstandingCases = [];

    outstandingCases.forEach(item => this.outstandingCases.push(item));

    this.received = this.filterOutstandingByRescueStatus(this.outstandingCases, 1, "Received");
    this.assigned = this.filterOutstandingByRescueStatus(this.outstandingCases, 2, "Assigned");
    this.arrived  = this.filterOutstandingByRescueStatus(this.outstandingCases, 3, "Arrived");
    this.rescued  = this.filterOutstandingByRescueStatus(this.outstandingCases, 4, "Rescued");
    this.admitted = this.filterOutstandingByRescueStatus(this.outstandingCases, 5, "Admitted");

    this.subscription.unsubscribe();

  }

  filterOutstandingByRescueStatus(outstandingCases:OutstandingCase[], state:number, name:string){

    // let newList = outstandingCases.pipe(
    //   map(outstandingCase => outstandingCase.filter(item => item.RescueStatus === state)));

      let newList = outstandingCases.filter(item => item.RescueStatus === state);

    this.swimlanes.push({"key":name.toLowerCase(), "name":name, "state":state, "array": newList});

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
            //Check to see if we were successful
            if(result?.success !== 1){
              transferArrayItem(event.container.data,
                event.previousContainer.data,
                event.currentIndex,
                event.previousIndex);
            }

            if(result?.success === 1){
              //Update our base array
              let toUpdate = this.outstandingCases.findIndex(elem => elem.EmergencyCaseId == result.emergencyCaseId)

              let moveArrayIndex = this.swimlanes.findIndex(lane => lane.state == result.rescueStatus)

              transferArrayItem(event.container.data,
                this.swimlanes[moveArrayIndex].array,
                event.currentIndex,
                event.previousIndex);

              this.outstandingCases[toUpdate].RescueStatus = result.rescueStatus;
            }
          })
      }
      catch(e){
        console.log(e)
      }
    }
  }

  //TODO make this call typesafe
  openRescueEdit(outstandingCase:any){

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
      data: {emergencyCaseId:outstandingCase.EmergencyCaseId, recordForm:recordForm}
    });

    return rescueDialog.afterClosed();

  }

}
