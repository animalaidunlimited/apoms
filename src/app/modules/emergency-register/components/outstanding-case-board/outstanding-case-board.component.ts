import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BoardSocketService } from '../../services/board-socket.service';
import { MatDialog } from '@angular/material/dialog';
import { RescueDetailsDialogComponent } from 'src/app/core/components/rescue-details-dialog/rescue-details-dialog.component';
import { FormBuilder } from '@angular/forms';
import { OutstandingCase } from 'src/app/core/models/outstanding-case';
import { filter } from 'rxjs/operators';
import { Observable } from 'rxjs';



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

  // swimlanes = ["A", "B", "C", "D"];

  swimlanes = [
    {"key":"received", "name":"Received", "array": []},
    {"key": "assigned", "name": "Assigned", "array": []},
    {"key": "arrived", "name": "Arrived", "array": []},
    {"key": "rescued", "name": "Rescued", "array": []},
    {"key": "admitted", "name": "Admitted", "array": []}];

  ngOnInit(): void {

    this.setupConnection();

  }

  async setupConnection(){

    await this.socketService.setupSocketConnection().then();

    this.socketService.getOutstandingRescues().subscribe(outstandingCases =>

      this.setOutstandingCases(outstandingCases)
      );

  }

  setOutstandingCases(outstandingCases:OutstandingCase[]){

    this.received = outstandingCases.filter(outstandingCase => outstandingCase.RescueStatus === 1);
    this.assigned = outstandingCases.filter(outstandingCase => outstandingCase.RescueStatus === 2);
    this.arrived = outstandingCases.filter(outstandingCase => outstandingCase.RescueStatus === 3);
    this.rescued = outstandingCases.filter(outstandingCase => outstandingCase.RescueStatus === 4);
    this.admitted = outstandingCases.filter(outstandingCase => outstandingCase.RescueStatus === 5);


   this.swimlanes = [
          {"key":"received", "name":"Received", "array": [this.received]},
          {"key": "assigned", "name": "Assigned", "array": [this.assigned]},
          {"key": "arrived", "name": "Arrived", "array": [this.arrived]},
          {"key": "rescued", "name": "Rescued", "array": [this.rescued]},
          {"key": "admitted", "name": "Admitted", "array": [this.admitted]}];

  }



  drop(event: CdkDragDrop<string[]>) {




    if (event.previousContainer === event.container) {

      try{
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      }
      catch(e){
        console.log(e)
      }
    } else {

      try{
        this.openRescueEdit(event.container.data[event.previousIndex]);

        transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);
      }
      catch(e){
        console.log(e)
      }
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

    this.rescueDialog.open(RescueDetailsDialogComponent, {
      width: '500px',
      height: '500px',
      data: {emergencyCaseId:outstandingCase.EmergencyCaseId, recordForm:recordForm}
    });

  }

}
