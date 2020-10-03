import { Component, OnInit, ViewChild } from '@angular/core';
import { DropdownService } from "src/app/core/services/dropdown/dropdown.service";
import { CensusArea } from 'src/app/core/models/census-details';
import { Observable } from 'rxjs';
import { FormGroup , FormBuilder } from '@angular/forms';
import { CensusService } from 'src/app/core/services/census/census.service';
import { MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { PatientDetailsDialogComponent } from '../patient-details-dialog/patient-details-dialog.component';

interface PatientCountInArea{
    area : string,
    count : number
}



@Component({
  selector: 'reporting-record',
  templateUrl: './reporting-record.component.html',
  styleUrls: ['./reporting-record.component.scss']
})
export class ReportingRecordComponent implements OnInit {

  constructor(
        private census : CensusService,
        private dialog : MatDialog) {}

        areaId: number;
        censusAreas$ : Observable<CensusArea[]>;

        censusArea : FormGroup;

        displayString : string;

        totalPatientCount : number;

        patientCountInArea: PatientCountInArea[];

        areaNamelabel : Array<string> = [];

        dataValue : Array<number> = [];

        @ViewChild(MatTable) patientDetailsTable : MatTable<any> ;




        ngOnInit() {

              this.patientCountInArea = [{
                  area : '',
                  count : null
              }]

          this.census.getCensusPatientCount().then(response =>{
              this.patientCountInArea = response;
          })

      }

      getPatientDetailsByArea(areaName:string){
        const dialogRef = this.dialog.open(PatientDetailsDialogComponent, {

          width: '90%',
          maxHeight: '100vh',
          data: {
            areaName : areaName
          },
      });

      dialogRef.afterClosed()


      }

}
