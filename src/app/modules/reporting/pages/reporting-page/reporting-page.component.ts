import { Component, OnInit } from '@angular/core';
import { CensusArea } from 'src/app/core/models/census-details';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CensusService } from 'src/app/core/services/census/census.service';
import { SurgeryService } from 'src/app/core/services/surgery/surgery.service';
import { SurgeryRecord } from 'src/app/core/models/surgery-details';
import { getCurrentDateString } from 'src/app/core/helpers/utils';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { MatDialog } from '@angular/material/dialog';
import { SurgeriesByDateDialogComponent } from '../../components/surgeries-by-date-dialog/surgeries-by-date-dialog.component';
import { PatientDetailsDialogComponent } from '../../components/patient-details-dialog/patient-details-dialog.component';


interface PatientCountInArea{
    area : string;
    count : number;
}

@Component({
    selector: 'app-reporting-page',
    templateUrl: './reporting-page.component.html',
    styleUrls: ['./reporting-page.component.scss'],
})
export class ReportingPageComponent implements OnInit {

    constructor(
        private fb: FormBuilder,
        private census: CensusService,
        private dialog: MatDialog,
        private surgeryService: SurgeryService) {}

    areaId: number;

    censusAreas$ : Observable<CensusArea[]>;
    censusArea : FormGroup;
    displayString : string;
    errorMatcher = new CrossFieldErrorMatcher();
    patientCountData : PatientCountInArea[];
    surgeries: Observable<SurgeryRecord[]>;
    surgeryCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    surgeryDetails: FormGroup;
    totalPatientCount : number;

    ngOnInit() {

        this.patientCountData = [{
                area : '',
                count : 0
        }];

        this.census.getCensusPatientCount().then(response => {
            this.patientCountData = response;
        });

        this.surgeryDetails = this.fb.group({
            surgeryDate: [, Validators.required]
        });

        this.surgeryDetails.get('surgeryDate').valueChanges.subscribe(() => {

            this.surgeries = this.surgeryService.getSurgeryBySurgeryDate(this.surgeryDetails.get('surgeryDate').value);
            this.surgeries.subscribe(surgeries => this.surgeryCount.next(surgeries.length || 0));
        });

        this.surgeryDetails.get('surgeryDate').setValue(getCurrentDateString());

    }

    getPatientDetailsByArea(area:string){

        this.dialog.open(PatientDetailsDialogComponent, {

          width: '90%',
          maxHeight: 'auto',
          data: {
            areaName : area
          },
      });

    }

    openSurgeryDetailsDialog(){

        this.surgeries.subscribe(surgeryList => {

           this.dialog.open(SurgeriesByDateDialogComponent, {
                minWidth: '50%',
                data: {
                    surgeries: surgeryList
                }
            });

        });

    }





}
