import { Component, OnInit, Input , ViewChild} from '@angular/core';
import { SurgeryService } from "src/app/core/services/surgery/surgery.service";
import { FormBuilder , FormGroup } from "@angular/forms";
import { SearchRecordTab } from 'src/app/core/models/search-record-tab';
import { MatDialog } from "@angular/material/dialog";
import { MatTable } from "@angular/material/table";
import { SurgeryRecordDialogComponent  } from "../../components/surgery-record-dialog/surgery-record-dialog/surgery-record-dialog.component";
import { UpdatedSurgery } from 'src/app/core/models/Surgery-details';
import { CdkTable } from '@angular/cdk/table';
import { AddSurgeryDialogComponent } from '../add-surgery-dialog/add-surgery-dialog.component';
import { RepositionScrollStrategy } from '@angular/cdk/overlay';

// import { threadId } from 'worker_threads';
export interface SurgeryRecord {
  surgeryId : number;
  date: string | Date;
  type: string;
  surgeon: string;
  site: string;
  anesthesiaMinutes: number;
  died: string;
  comments: string;
  antibioticsGiven: string;
}

const ELEMENT_DATA: SurgeryRecord[] = [
  {surgeryId : null ,date : "", type : "", surgeon : "", site : "", anesthesiaMinutes : 0, died : "", comments : "", antibioticsGiven: ""}
];


@Component({
  selector: 'surgery-details',
  templateUrl: './surgery-details.component.html',
  styleUrls: ['./surgery-details.component.scss']
})
export class SurgeryDetailsComponent implements OnInit {

  @Input() patientId:number;
  @Input() tagNumber:string;
  @Input() emergencyNumber:number;
  @Input() animalType:string;
  @ViewChild(MatTable) table : MatTable<any>;
  tagnumber: string;
  date : string|Date;
  type : string;
  surgeon : string;
  site : string;
  anesthesiaMinutes : number;
  

  constructor(private surgeryService : SurgeryService , 
    public dialog : MatDialog) { }

  ngOnInit() {

    this.surgeryService.getSurgeryByPatientId(this.patientId).then(response=>
    this.surgeryRecords = response);


    // console.log(this.surgeryRecords)
  }

  displayedColumns: string[] = ["Date","Type","Surgeon","Site","Anesthesia Minutes","Edit Surgery"];
  surgeryRecords = ELEMENT_DATA;

  updateSurgeryDialog(row:SurgeryRecord): void {
    const dialogRef = this.dialog.open(SurgeryRecordDialogComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      width: "90%",
      height:"80%",
      data: {surgeryId : row.surgeryId, animalType:this.animalType
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      let index = this.surgeryRecords.findIndex(x=> x.surgeryId == result.surgeryId);
      this.surgeryRecords.splice(index,1,result);

      this.table.renderRows();
      // this.surgeryRecords = result;
      // console.log(result.died);
    });
  }
  addSurgeryDialog() {
    const dialogRef = this.dialog.open(AddSurgeryDialogComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      width: "90%",
      height:"80%",
      data:{patientId:this.patientId , emergencyNumber:this.emergencyNumber , tagNumber:this.tagNumber , animalType : this.animalType}
  });
  dialogRef.afterClosed().subscribe(result=>{
    //TODO USE A IF LOOP FOR MESSAGE//
    console.log(result);
    if(result)
    {
      alert("Surgery Stored Successfully!");
    }
    this.table.renderRows();
  });



}
  

  addSurgery(){
    this.addSurgeryDialog();
  }

  updateSurgery(row)
  {
    console.log(row);
    this.updateSurgeryDialog(row);
    
  }




}


  
